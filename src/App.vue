<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // 1. Récupération de l'utilisateur déjà connecté
  const currentUser = localStorage.getItem('currentUser') || 'thomas';

  // S'il n'y a pas encore de session enregistrée, on l'enregistre par défaut
  if (!localStorage.getItem('currentUser')) {
    localStorage.setItem('currentUser', currentUser);
  }

  // 2. Inscription auprès de OneSignal pour recevoir les Push
  if (window.OneSignal) {
    window.OneSignal.push(async () => {
      // Demande la permission de notification
      await window.OneSignal.showNativePrompt();

      // Enregistre l'identifiant 'thomas' ou 'zoe' sur OneSignal
      if (typeof window.OneSignal.login === 'function') {
        await window.OneSignal.login(currentUser);
      }
      if (typeof window.OneSignal.sendTag === 'function') {
        await window.OneSignal.sendTag('user_id', currentUser);
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