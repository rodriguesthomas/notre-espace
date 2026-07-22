<script setup>
import { ref, onMounted } from 'vue';

// Profil de l'utilisateur ('thomas' ou 'zoe')
const currentUser = ref('thomas');

// 1. Initialisation et association de l'utilisateur avec OneSignal
const initOneSignal = () => {
  // On récupère le profil enregistré localement (par défaut 'thomas')
  const savedUser = localStorage.getItem('currentUser') || 'thomas';
  currentUser.value = savedUser;

  if (window.OneSignal) {
    window.OneSignal.push(async () => {
      // Demander l'autorisation de recevoir des notifications
      await window.OneSignal.showNativePrompt();
      
      // Associer cet appareil au profil ('thomas' ou 'zoe') pour que les Push ciblés fonctionnent
      await window.OneSignal.setExternalUserId(savedUser);
      console.log(`Dispositif enregistré chez OneSignal pour : ${savedUser}`);
    });
  }
};

// 2. Fonction pour basculer rapidement entre Thomas et Zoé (pratique pour tester)
const switchUser = (newUser) => {
  currentUser.value = newUser;
  localStorage.setItem('currentUser', newUser);

  // Mettre à jour l'identifiant chez OneSignal
  if (window.OneSignal) {
    window.OneSignal.push(async () => {
      await window.OneSignal.setExternalUserId(newUser);
      console.log(`Compte OneSignal basculé sur : ${newUser}`);
    });
  }
  
  // Recharger la page pour synchroniser l'ensemble des composants (Message.vue, etc.)
  window.location.reload();
};

onMounted(() => {
  initOneSignal();
});
</script>

<template>
  <v-app>
    <!-- Barre de navigation supérieure -->
    <v-app-bar color="#f7f4f0" flat border class="px-3">
      <v-app-bar-title class="font-weight-bold color-title">
        🌱 Notre Espace
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- Selecteur de profil pour basculer facilement -->
      <div class="user-switcher">
        <v-btn
          size="small"
          rounded="pill"
          :color="currentUser === 'thomas' ? '#7fa4c4' : '#e2e8f0'"
          class="me-1 text-white"
          @click="switchUser('thomas')"
        >
          Thomas
        </v-btn>
        
        <v-btn
          size="small"
          rounded="pill"
          :color="currentUser === 'zoe' ? '#d47a6a' : '#e2e8f0'"
          class="text-white"
          @click="switchUser('zoe')"
        >
          Zoé
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Contenu principal (charge le routeur / les composants) -->
    <v-main class="app-background">
      <v-container class="py-4 fill-height align-start">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
/* Style global pour conserver l'esthétique pastel */
.app-background {
  background-color: #fffdfa !important;
  min-height: 100vh;
}

.color-title {
  color: #5c4d42 !important;
  font-size: 1.1rem;
}

.user-switcher {
  display: flex;
  align-items: center;
  background: #f1eeeb;
  padding: 3px;
  border-radius: 25px;
}
</style>