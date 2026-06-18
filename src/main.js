import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // On importe la configuration depuis src/router/index.js
import './style.css' // Ton fichier de styles si tu en as un

const app = createApp(App)

app.use(router) // On dit à Vue d'utiliser le routeur AVANT de monter l'application

app.mount('#app')