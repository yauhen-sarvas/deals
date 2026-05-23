import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: { url: '/mockServiceWorker.js' },
    })
  }

  const app = createApp(App)

  app.config.errorHandler = (err, _instance, info) => {
    console.error('[Vue Error]', { err, info })
  }

  app.use(createPinia())
  app.use(router)
  app.use(i18n)
  app.mount('#app')
}

bootstrap()
