<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  const currentUser = localStorage.getItem('currentUser') || 'thomas';

  if (window.OneSignal) {
    window.OneSignal.push(() => {
      // Demande l'autorisation de notification
      window.OneSignal.showNativePrompt();
      
      // Associe l'appareil au profil (compatible toutes versions OneSignal)
      if (typeof window.OneSignal.login === 'function') {
        window.OneSignal.login(currentUser);
      }
      if (typeof window.OneSignal.setExternalUserId === 'function') {
        window.OneSignal.setExternalUserId(currentUser);
      }
    });
  }
});
</script>

<template>
  <v-app class="app-container">
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
.app-container {
  background-color: #fffdfa !important;
}
</style>