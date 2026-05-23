import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { HTTP_CODES } from '@/constants/http'
import { BACKOFF_BASE_MS, BACKOFF_MAX_MS, RETRY_LIMIT, BASE_TIMEOUT_MS } from '@/constants/api'
import { HttpError } from './api.error'

const RETRY_STATUSES = new Set<number>([
  HTTP_CODES.INTERNAL_SERVER_ERROR,
  HTTP_CODES.BAD_GATEWAY,
  HTTP_CODES.SERVICE_UNAVAILABLE,
  HTTP_CODES.GATEWAY_TIMEOUT,
])

// config can be undefined when a request never reaches the network (e.g. interceptor throws)
function isRetryableConfig(config: InternalAxiosRequestConfig | undefined): boolean {
  return config?.method?.toLowerCase() === 'get'
}

function exponentialDelay(attempt: number): Promise<void> {
  const ms = Math.min(BACKOFF_BASE_MS * 2 ** attempt, BACKOFF_MAX_MS)
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function serializeParams(params: Record<string, unknown>): string {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) sp.append(key, String(v))
    } else if (value !== null && value !== undefined) {
      sp.append(key, String(value))
    }
  }
  return sp.toString()
}

export function createApiInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: '/',
    timeout: BASE_TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
    paramsSerializer: serializeParams,
  })

  instance.interceptors.request.use((config) => {
    const authStore = useAuthStore()
    if (authStore.currentUser) {
      config.headers['x-user-id'] = authStore.currentUser.id
      config.headers['x-user-role'] = authStore.currentUser.role
    }
    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config as (InternalAxiosRequestConfig & { _retryCount?: number }) | undefined
      const status = error.response?.status as number | undefined

      if (status === HTTP_CODES.UNAUTHORIZED) {
        useAuthStore().logout()
        return Promise.reject(new Error('Unauthorized'))
      }

      const retryCount = config?._retryCount ?? 0
      const retryable = (RETRY_STATUSES.has(status ?? 0) || !status) && isRetryableConfig(config)

      if (retryable && retryCount < RETRY_LIMIT && config) {
        config._retryCount = retryCount + 1
        await exponentialDelay(config._retryCount)
        return instance.request(config as AxiosRequestConfig)
      }

      if (status) {
        return Promise.reject(new HttpError(status, `Request failed with status ${status}`))
      }

      return Promise.reject(new Error('Network error — please check your connection'))
    },
  )

  return instance
}

export const apiClient = createApiInstance()
