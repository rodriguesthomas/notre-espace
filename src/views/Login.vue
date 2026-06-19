<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');
const errorMessage = ref('');

const handleLogin = () => {
  const user = username.value.trim().toLowerCase();
  const pass = password.value.trim();

  if (user === 'thomas' && pass === 'JAIMEZOE') {
    localStorage.setItem('currentUser', 'thomas');
    router.push('/home');
  } else if (user === 'zoe' && pass === 'JAIMETHOMAS') {
    localStorage.setItem('currentUser', 'zoe');
    router.push('/home');
  } else {
    errorMessage.value = "Identifiant ou mot de passe incorrect... 😢";
  }
};
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h2>🔑 Rejoindre notre espace</h2>
      
      <div class="input-group">
        <label>Prénom</label>
        <input v-model="username" type="text" placeholder="Ton prénom..." />
      </div>

      <div class="input-group">
        <label>Mot de passe</label>
        <input v-model="password" type="password" placeholder="Mot de passe secret..." />
      </div>

      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

      <button @click="handleLogin" class="login-btn">Se connecter</button>
    </div>
  </div>
</template>

<style scoped>
.login-page { width: 100vw; height: 100vh; background-color: #f7f4ef; display: flex; justify-content: center; align-items: center; }
.login-card { background: #fffdfa; padding: 30px; border-radius: 20px; box-shadow: 0 8px 24px rgba(92, 77, 66, 0.08); border: 1px solid #e3ded7; width: 85%; max-width: 360px; text-align: center; }
h2 { color: #5c4d42; margin-bottom: 25px; font-family: Georgia, serif; }
.input-group { text-align: left; margin-bottom: 15px; }
label { display: block; font-size: 0.85rem; color: #8c7e74; margin-bottom: 5px; font-weight: bold; }
input { width: 100%; padding: 12px; border: 1px solid #e3ded7; border-radius: 10px; background: #fffdfa; box-sizing: border-box; color: #5c4d42; }
.error-msg { color: #d47a6a; font-size: 0.85rem; margin: 10px 0; }
.login-btn { width: 100%; padding: 12px; background: #d47a6a; color: white; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; margin-top: 10px; box-shadow: 0 4px 12px rgba(212, 122, 106, 0.2); }
</style>