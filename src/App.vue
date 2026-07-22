<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // On attend que la librairie OneSignal soit chargée sur la page
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      await OneSignal.init({
        appId: "TON_VRAI_APP_ID_ONESIGNAL", // <-- Coller ton App ID ici
        allowLocalhostAsSecureOrigin: true,
      });

      const currentUser = localStorage.getItem('currentUser') || 'thomas';

      // Demande l'autorisation pour les notifications
      await OneSignal.Notifications.requestPermission();

      // Identifie cet appareil sous le pseudo 'thomas' ou 'zoe'
      await OneSignal.login(currentUser);
    } catch (err) {
      console.warn("Erreur OneSignal :", err);
    }
  });
});
</script>

<template>
  <router-view />
</template>