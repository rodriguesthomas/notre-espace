<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');

const handleLogin = () => {
  // Mode simple : si les champs sont remplis, on passe à l'accueil
  if (username.value && password.value) {
    router.push('/home');
  } else {
    alert('Remplis les champs pour te connecter ❤️');
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h2>❤️ Notre Cocon</h2>
      <p>Connecte-toi pour rejoindre notre espace</p>
      
      <div class="input-group">
        <input v-model="username" type="text" placeholder="Ton prénom" />
        <input v-model="password" type="password" placeholder="Mot de passe secret" />
      </div>

      <button @click="handleLogin" class="login-btn">Entrer</button>
    </div>
  </div>
</template>

<style scoped>
.login-container { 
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw; 
  height: 100vh; 
  background-color: #f7f4ef; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  z-index: 999;
}
.login-card { background: #fffdfa; padding: 2.5rem; border-radius: 20px; border: 1px solid #e3ded7; box-shadow: 0 10px 25px rgba(92, 77, 66, 0.05); text-align: center; width: 85vw; max-width: 350px; }
h2 { color: #5c4d42; margin-bottom: 0.5rem; font-family: Georgia, serif; }
p { color: #8c7e74; font-size: 0.9rem; margin-bottom: 2rem; }
.input-group { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
input { padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; background: #fffdfa; font-size: 1rem; color: #5c4d42; }
input:focus { outline: none; border-color: #d47a6a; }
.login-btn { width: 100%; padding: 12px; background: #d47a6a; color: white; border: none; border-radius: 10px; font-weight: bold; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 10px rgba(212, 122, 106, 0.2); }
</style>