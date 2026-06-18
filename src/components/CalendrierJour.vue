<script setup>
import { ref, computed } from 'vue';

// 1. Récupération de la date du jour réelle
const today = new Date();
const numeroJour = today.getDate(); // Exemple : 18

// Formater le jour de la semaine en français (ex: "Jeudi")
const nomJour = computed(() => {
  return today.toLocaleDateString('fr-FR', { weekday: 'long' });
});

// 2. Les activités d'aujourd'hui (Modifiables en temps réel)
const activiteMoi = ref('🍝 Cuisiner repas');
const activiteElle = ref('🏊‍♀️ Piscine');
</script>

<template>
  <div class="top-bar-container">
    <div class="calendar-header-card">
      
      <div class="activity-block moi-side">
        <span class="user-label">Moi</span>
        <div class="activity-badge badge-blue">
          {{ activiteMoi || 'Rien de prévu ☕' }}
        </div>
      </div>

      <div class="date-center">
        <span class="date-number">{{ numeroJour }}</span>
        <span class="date-day-name">{{ nomJour }}</span>
      </div>

      <div class="activity-block elle-side">
        <span class="user-label">Elle</span>
        <div class="activity-badge badge-terracotta">
          {{ activiteElle || 'Rien de prévu ☕' }}
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.top-bar-container {
  width: 100%;
  padding: 10px 10px 0 10px;
  box-sizing: border-box;
  background-color: transparent;
}

/* La grande carte blanche arrondie du haut */
.calendar-header-card {
  background: #fffdfa;
  border-radius: 24px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(92, 77, 66, 0.05);
  border: 1px solid #e3ded7;
  gap: 10px;
}

/* Blocs d'activités latéraux */
.activity-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.moi-side { align-items: flex-start; }
.elle-side { align-items: flex-end; }

.user-label {
  font-size: 0.75rem;
  font-weight: bold;
  color: #8c7e74;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Badges d'activités arrondis type boutons pilules */
.activity-badge {
  font-size: 0.85rem;
  font-weight: bold;
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  max-width: 110px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Coupe proprement le texte trop long */
  text-align: center;
}

/* Couleurs personnalisées pour chacun */
.badge-blue {
  background-color: #7fa4c4; /* Bleu ardoise doux */
  color: white;
}
.badge-terracotta {
  background-color: #d47a6a; /* Terracotta */
  color: white;
}

/* BLOC CENTRAL DE LA DATE */
.date-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 70px;
}
.date-number {
  font-family: 'Georgia', serif;
  font-size: 1.8rem;
  font-weight: 900;
  color: #4a3e3d;
  line-height: 1;
}
.date-day-name {
  font-size: 0.8rem;
  color: #8c7e74;
  text-transform: capitalize; /* Première lettre en majuscule */
  margin-top: 2px;
}
</style>