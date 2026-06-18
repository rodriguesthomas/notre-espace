<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// On reçoit 'moi' ou 'elle' directement depuis l'URL grâce au Router
const props = defineProps(['owner']);
const router = useRouter();

const isLocked = ref(true);
const photos = ref([]);

onMounted(() => {
  // Logique de test (À lier plus tard avec ton API Spring Boot)
  if (props.owner === 'moi') {
    isLocked.value = false; // Tes propres photos sont toujours visibles
    photos.value = ['https://picsum.photos/300/300?random=1', 'https://picsum.photos/300/300?random=2'];
  } else {
    // Pour elle, on simule le verrouillage avant 20h
    const currentHour = new Date().getHours();
    if (currentHour < 20) {
      isLocked.value = true;
    } else {
      isLocked.value = false;
      photos.value = ['https://picsum.photos/300/300?random=3'];
    }
  }
});
</script>

<template>
  <div class="album-page">
    <header class="album-nav">
      <button @click="router.push('/home')" class="back-btn">⬅️ Retour</button>
      <h2>Album de {{ props.owner === 'moi' ? 'Julien' : 'Elle' }}</h2>
      <div style="width: 60px;"></div> </header>

    <main class="album-content">
      <div v-if="isLocked" class="locked-container">
        <div class="lock-icon">🔒</div>
        <h3>Contenu verrouillé</h3>
        <p>Les photos de ta copine s'ouvriront ce soir à 20h00 pile pour garder la surprise ! 🥰</p>
      </div>

      <div v-else class="photos-grid">
        <div v-for="(url, index) in photos" :key="index" class="photo-card">
          <img :src="url" alt="Moment précieux" />
        </div>
        <p v-if="photos.length === 0" class="empty-msg">Aucune photo partagée aujourd'hui...</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.album-page { width: 100vw; height: 100vh; background-color: #f7f4ef; display: flex; flex-direction: column; }
.album-nav { display: flex; justify-content: space-between; align-items: center; padding: 2vh 4vw; background: #fffdfa; border-bottom: 1px solid #e3ded7; }
.back-btn { background: #e3ded7; border: none; padding: 8px 14px; border-radius: 8px; color: #5c4d42; font-weight: bold; cursor: pointer; }
h2 { color: #5c4d42; font-size: 1.2rem; font-family: Georgia, serif; margin: 0; }

.album-content { flex: 1; padding: 20px; overflow-y: auto; display: flex; justify-content: center; align-items: initial; }
.locked-container { text-align: center; margin-top: 15vh; max-width: 300px; }
.lock-icon { font-size: 4rem; margin-bottom: 1rem; }
.locked-container h3 { color: #5c4d42; margin-bottom: 0.5rem; }
.locked-container p { color: #8c7e74; font-size: 0.95rem; line-height: 1.4; font-style: italic; }

.photos-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; width: 100%; max-width: 500px; height: fit-content; }
.photo-card { background: white; padding: 8px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e3ded7; }
.photo-card img { width: 100%; height: 160px; object-fit: cover; border-radius: 8px; }
.empty-msg { grid-column: span 2; text-align: center; color: #bdafa4; margin-top: 5vh; }
</style>