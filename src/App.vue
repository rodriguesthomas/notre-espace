<script setup>
import { onMounted } from 'vue';
import { useOneSignal } from 'onesignal-vue';

const onesignal = useOneSignal();

onMounted(async () => {
  try {
    // 1. Récupère l'utilisateur actuellement connecté ('thomas' ou 'zoe')
    const currentUser = localStorage.getItem('currentUser') || 'thomas';

    // 2. Demande l'autorisation d'envoyer des notifications sur l'iPhone
    await onesignal.Notifications.requestPermission();
    
    // 3. Associe cet iPhone spécifique au prénom ('thomas' ou 'zoe')
    await onesignal.login(currentUser);
  } catch (err) {
    console.error("Erreur d'initialisation OneSignal :", err);
  }
});
</script>

<template>
  <router-view />
</template>