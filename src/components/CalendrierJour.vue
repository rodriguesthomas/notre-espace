<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const currentUser = ref('thomas');
const today = ref(new Date());

const numeroJour = computed(() => today.value.getDate());
const nomJour = computed(() => today.value.toLocaleDateString('fr-FR', { weekday: 'long' }));

const activiteThomas = ref('🌱 Dispo');
const activiteZoe = ref('🌱 Dispo');

// Récupère les données depuis la même clé localStorage que l'agenda
const syncWithAgenda = () => {
  today.value = new Date();
  const dayStr = String(today.value.getDate()).padStart(2, '0');

  // Remise à zéro
  activiteThomas.value = '🌱 Dispo';
  activiteZoe.value = '🌱 Dispo';

  const saved = localStorage.getItem('agenda_events');
  if (saved) {
    const allEvents = JSON.parse(saved);
    // Filtrer pour aujourd'hui seulement
    const todaysEvents = allEvents.filter(evt => String(evt.day).padStart(2, '0') === dayStr);

    todaysEvents.forEach(evt => {
      if (evt.author === 'les deux' || evt.author === 'nous') {
        activiteThomas.value = evt.title;
        activiteZoe.value = evt.title;
      } else if (evt.author === 'thomas') {
        activiteThomas.value = evt.title;
      } else if (evt.author === 'zoe') {
        activiteZoe.value = evt.title;
      }
    });
  }
};

onMounted(() => {
  currentUser.value = localStorage.getItem('currentUser') || 'thomas';
  syncWithAgenda();

  // Écoute les changements envoyés par le composant Calendrier
  window.addEventListener('agenda-updated', syncWithAgenda);
});

onUnmounted(() => {
  window.removeEventListener('agenda-updated', syncWithAgenda);
});
</script>

<template>
  <div class="top-bar-container">
    <div class="calendar-header-card">
      
      <div class="activity-block moi-side">
        <span class="user-label">Moi</span>
        <div class="activity-badge" :class="currentUser === 'thomas' ? 'badge-blue' : 'badge-terracotta'">
          <span class="badge-text">{{ currentUser === 'thomas' ? activiteThomas : activiteZoe }}</span>
        </div>
      </div>

      <div class="date-center">
        <span class="date-number">{{ numeroJour }}</span>
        <span class="date-day-name">{{ nomJour }}</span>
      </div>

      <div class="activity-block elle-side">
        <span class="user-label">{{ currentUser === 'thomas' ? 'Elle' : 'Lui' }}</span>
        <div class="activity-badge" :class="currentUser === 'thomas' ? 'badge-terracotta' : 'badge-blue'">
          <span class="badge-text">{{ currentUser === 'thomas' ? activiteZoe : activiteThomas }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.top-bar-container { width: 100%; padding: 10px 10px 0 10px; box-sizing: border-box; background-color: transparent; }
.calendar-header-card { background: #fffdfa; border-radius: 24px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 15px rgba(92, 77, 66, 0.05); border: 1px solid #e3ded7; gap: 8px; }
.activity-block { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.moi-side { align-items: flex-start; }
.elle-side { align-items: flex-end; }
.user-label { font-size: 0.7rem; font-weight: bold; color: #8c7e74; text-transform: uppercase; letter-spacing: 0.5px; }

.activity-badge { display: flex; align-items: center; justify-content: center; padding: 6px 10px; border-radius: 20px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04); width: 100%; max-width: 120px; height: 32px; box-sizing: border-box; }
.badge-text { font-size: 0.75rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; text-align: center; display: inline-block; }

@media (max-width: 380px) { .badge-text { font-size: 0.68rem; } }
.badge-blue { background-color: #7fa4c4; color: white; }
.badge-terracotta { background-color: #d47a6a; color: white; }

.date-center { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 95px; }
.date-number { font-family: 'Georgia', serif; font-size: 1.6rem; font-weight: 900; color: #4a3e3d; line-height: 0.9; }
.date-day-name { font-size: 1rem; font-weight: bold; color: #3d3130; text-transform: capitalize; margin-top: 6px; }
</style>