import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
// 1. On importe le plugin OneSignal
import OneSignalVuePlugin from 'onesignal-vue'

const app = createApp(App)

app.use(router)

// 2. On active OneSignal (remplace la valeur par ton vrai App ID OneSignal)
app.use(OneSignalVuePlugin, {
  appId: "cb8bf7f6-4a91-4c8c-aacc-894d16a98991", // Ex: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  allowLocalhostAsSecureOrigin: true,
})

app.mount('#app')