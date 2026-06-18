<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps(['owner']);
const isLocked = ref(true);
const photos = ref([]);

onMounted(() => {
  if (props.owner === 'moi') {
    isLocked.value = false; // Tes photos sont toujours visibles pour toi
    photos.value = [
      'https://picsum.photos/300/300?random=1',
      'https://picsum.photos/300/300?random=2'
    ];
  } else {
    // Pour l'autre, on vérifie l'heure locale
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
  <div class="album-wrapper">
    <div v-if="isLocked" class="locked-box">
      <div class="lock-avatar">🔒</div>
      <p>Pas encore disponible...</p>
      <span>Reviens ce soir à 20h00 pour découvrir ses photos de la journée ! 🥰</span>
    </div>

    <div v-else class="grid-layout">
      <div v-for="(url, idx) in photos" :key="idx" class="img-card">
        <img :src="url" alt="Instant partagé" />
      </div>
      <p v-if="photos.length === 0" class="no-photo">Aucune photo prise aujourd'hui.</p>
    </div>
  </div>
</template>

<style scoped>
.album-wrapper {
  width: 100%;
  height: 100%;
}
.locked-box {
  text-align: center;
  padding: 1.5rem 1rem;
}
.lock-avatar {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}
.locked-box p {
  margin: 0 0 4px 0;
  font-weight: bold;
  color: #5c4d42;
}
.locked-box span {
  font-size: 0.8rem;
  color: #8c7e74;
  font-style: italic;
  line-height: 1.4;
  display: block;
}
.grid-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 5px;
}
.img-card {
  background: white;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid #f1eeeb;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}
.img-card img {
  width: 100%;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
}
.no-photo {
  grid-column: span 2;
  text-align: center;
  color: #bdafa4;
  font-size: 0.85rem;
  padding-top: 2rem;
}
</style>