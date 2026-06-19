<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase'; 

const props = defineProps(['owner']); // Reçoit 'thomas' ou 'zoe'
const isLocked = ref(true);
const photos = ref([]);
const isExpanded = ref(false);

// Qui regarde l'écran actuellement ?
const currentUser = localStorage.getItem('currentUser') || 'thomas';

const toggleDrawer = () => { isExpanded.value = !isExpanded.value; };

const fetchPhotosFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('url') 
      .eq('owner', props.owner);

    if (error) throw error;

    if (data) {
      photos.value = data.map(item => item.url);
    }
  } catch (err) {
    console.error("Erreur de chargement des photos :", err.message);
  }
};

onMounted(async () => {
  // Ajustement de la sécurité avec les vrais pseudos
  if (props.owner === currentUser) {
    isLocked.value = false;
    await fetchPhotosFromSupabase(); 
  } else {
    const currentHour = new Date().getHours();
    if (currentHour < 20) {
      isLocked.value = true;
    } else {
      isLocked.value = false;
      await fetchPhotosFromSupabase(); 
    }
  }
});
</script>

<template>
  <div class="photo-drawer" :class="{ 'expanded': isExpanded }">
    
    <div class="drawer-header">
      <div class="handle-bar" @click="toggleDrawer"></div>
      <div class="header-actions">
        <span class="drawer-title" @click="toggleDrawer">
          🖼️ Album de {{ props.owner === 'thomas' ? 'Thomas' : 'Zoé' }} {{ isExpanded ? '👇' : '👆' }}
        </span>
      </div>
    </div>

    <div class="drawer-content">
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

  </div>
</template>

<style scoped>
.photo-drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fffdfa;
  border-top: 1px solid #e3ded7;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -5px 25px rgba(92, 77, 66, 0.12);
  z-index: 9999;
  height: 70vh; 
  transform: translateY(calc(70vh - 50px));
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.125); 
}
.photo-drawer.expanded { transform: translateY(0); }
.drawer-header { display: flex; flex-direction: column; align-items: center; padding: 6px 16px 10px 16px; background: #fffdfa; border-radius: 24px 24px 0 0; }
.handle-bar { width: 40px; height: 4px; background-color: #cbd5e1; border-radius: 2px; margin-bottom: 6px; cursor: pointer; }
.header-actions { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.drawer-title { font-size: 0.9rem; font-weight: bold; color: #8c7e74; cursor: pointer; }
.drawer-content { height: calc(100% - 60px); overflow-y: auto; padding: 15px; }
.locked-box { text-align: center; padding: 2rem 1rem; }
.lock-avatar { font-size: 2.5rem; margin-bottom: 0.5rem; }
.locked-box p { margin: 0 0 6px 0; font-weight: bold; color: #5c4d42; }
.locked-box span { font-size: 0.8rem; color: #8c7e74; font-style: italic; line-height: 1.4; display: block; }
.grid-layout { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 5px; }
.img-card { background: white; padding: 5px; border-radius: 12px; border: 1px solid #f1eeeb; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
.img-card img { width: 100%; height: 120px; object-fit: cover; border-radius: 8px; }
.no-photo { grid-column: span 2; text-align: center; color: #bdafa4; font-size: 0.85rem; padding-top: 2rem; }
</style>