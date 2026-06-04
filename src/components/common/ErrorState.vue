<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/ui/AppButton.vue'

interface Props {
  type?: 'network' | 'server' | 'notFound' | 'forbidden' | 'generic'
  message?: string
  showRetry?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'generic',
  showRetry: true,
})

const emit = defineEmits<{ retry: [] }>()
const { t } = useI18n()

const errorTitle = computed(() => {
  switch (props.type) {
    case 'network': return t('deals.errors.networkError')
    case 'server': return t('deals.errors.serverError')
    case 'notFound': return t('deals.errors.notFound')
    case 'forbidden': return t('deals.errors.forbidden')
    default: return t('deals.errors.loadFailed')
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
    <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
      <svg class="h-7 w-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <div class="text-center">
      <p class="font-medium text-gray-800">{{ errorTitle }}</p>
      <p v-if="message" class="mt-1 text-sm text-gray-500">{{ message }}</p>
    </div>
    <AppButton v-if="showRetry" variant="secondary" size="sm" @click="emit('retry')">
      {{ t('common.retry') }}
    </AppButton>
  </div>
</template>
