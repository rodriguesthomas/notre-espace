<script setup>
import { ref, onMounted } from 'vue';

const notifStatus = ref('');

// Initialisation au chargement de l'app
onMounted(() => {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      await OneSignal.init({
        appId: "TON_VRAI_APP_ID_ONESIGNAL", // <-- Mets ton vrai App ID OneSignal ici
        allowLocalhostAsSecureOrigin: true,
      });

      const currentUser = localStorage.getItem('currentUser') || 'thomas';
      await OneSignal.login(currentUser);
    } catch (err) {
      console.warn("Erreur OneSignal :", err);
    }
  });
});

// Déclencheur sur clic (exigé par Apple sur iPhone)
const enableNotifications = async () => {
  // Vérification de sécurité
  if (!window.OneSignalDeferred) {
    alert("Le script OneSignal n'est pas encore chargé. Attends 2 secondes et réessaie.");
    return;
  }

  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      alert("Demande d'autorisation en cours...");
      
      const currentUser = localStorage.getItem('currentUser') || 'thomas';

      // Demande la permission à iOS
      const permission = await OneSignal.Notifications.requestPermission();
      
      alert("Résultat de la permission : " + permission);

      await OneSignal.login(currentUser);
      notifStatus.value = 'Notifications activées ! 🎉';
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  });
};
</script>

<template>
  <div class="app-layout">
    <!-- Bandeau discret pour activer les notifications -->
    <div class="notif-bar">
      <button @click="enableNotifications" class="notif-btn">
        🔔 Activer les notifications iPhone
      </button>
      <span v-if="notifStatus" class="notif-status">{{ notifStatus }}</span>
    </div>

    <!-- Affichage de tes pages via le routeur -->
    <router-view />
  </div>
</template>

<style scoped>
.app-layout {
  width: 100%;
  min-height: 100vh;
}

.notif-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 6px;
  background: #fffbf7;
  border-bottom: 1px solid #f1eeeb;
}

.notif-btn {
  background: #d47a6a;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(212, 122, 106, 0.2);
}

.notif-btn:active {
  transform: scale(0.96);
}

.notif-status {
  font-size: 0.75rem;
  color: #5c4d42;
  font-weight: bold;
}
</style>