<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      await OneSignal.init({
        appId: "cb8bf7f6-4a91-4c8c-aacc-894d16a98991",
        allowLocalhostAsSecureOrigin: true,
      });

      const currentUser = localStorage.getItem('currentUser') || 'thomas';
      await OneSignal.login(currentUser);
    } catch (err) {
      console.warn("OneSignal init error :", err);
    }
  });
});
</script>

<template>
  <!-- Le bandeau a été retiré pour laisser l'interface 100% propre -->
  <router-view />
</template>