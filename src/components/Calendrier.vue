<script setup>
import { ref } from 'vue';

// 1. Liste dynamique des événements de l'agenda
const events = ref([
  {
    id: 1,
    day: '19',
    month: 'Juin',
    title: 'Cinéma en amoureux 🍿',
    desc: 'Voir le nouveau film à 20h30',
    color: '#d47a6a', // Terracotta
    author: 'Elle'
  },
  {
    id: 2,
    day: '21',
    month: 'Juin',
    title: 'Repas de famille 🍽️',
    desc: 'Dimanche midi chez les parents',
    color: '#7fa4c4', // Bleu ardoise
    author: 'Julien'
  }
]);

// Variables pour le formulaire d'ajout
const newTitle = ref('');
const newDesc = ref('');
const newColor = ref('#d47a6a'); // Terracotta par défaut
const newAuthor = ref('Julien');  // Auteur par défaut

// Liste des mois pour formater automatiquement la date du jour choisi
const months = ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];

// 2. Fonction pour ajouter un événement
const addEvent = () => {
  if (newTitle.value.trim() === '') return;

  // On récupère la date sélectionnée (ou celle du jour par défaut pour faire simple)
  const today = new Date();
  const dayStr = String(today.getDate()).padStart(2, '0');
  const monthStr = months[today.getMonth()];

  events.value.push({
    id: Date.now(),
    day: dayStr,
    month: monthStr,
    title: newTitle.value.trim(),
    desc: newDesc.value.trim() || 'Pas de description',
    color: newColor.value,
    author: newAuthor.value
  });

  // Réinitialisation des champs du formulaire
  newTitle.value = '';
  newDesc.value = '';
};
</script>

<template>
  <div class="agenda-container">
    
    <div class="events-flow">
      <h3>📅 Nos prochains rendez-vous</h3>
      
      <div class="events-list">
        <div 
          v-for="event in events" 
          :key="event.id" 
          class="event-card"
        >
          <div class="event-date" :style="{ backgroundColor: event.color }">
            <span class="day">{{ event.day }}</span>
            <span class="month">{{ event.month }}</span>
          </div>
          <div class="event-details">
            <div class="event-header-row">
              <h4>{{ event.title }}</h4>
              <span class="author-tag" :style="{ borderColor: event.color, color: event.color }">
                👤 {{ event.author }}
              </span>
            </div>
            <p>{{ event.desc }}</p>
          </div>
        </div>
      </div>

      <p v-if="events.length === 0" class="empty-events">
        Aucun événement de prévu... Planifie quelque chose ! 🌱
      </p>
    </div>

    <div class="agenda-input-zone">
      <div class="form-row">
        <input 
          v-model="newTitle" 
          type="text" 
          placeholder="Titre de l'événement..." 
          class="input-main"
        />
        <button @click="addEvent" class="add-btn">➔</button>
      </div>
      
      <div class="form-options">
        <input 
          v-model="newDesc" 
          type="text" 
          placeholder="Description (optionnel)..." 
          class="input-sub"
          @keydown.enter="addEvent"
        />
        
        <select v-model="newAuthor" class="select-author">
          <option value="Julien">Julien</option>
          <option value="Elle">Elle</option>
        </select>

        <div class="color-picker-wrapper">
          <input type="color" v-model="newColor" class="color-picker" />
          <div class="color-preview" :style="{ backgroundColor: newColor }">🎨</div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.agenda-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}
h3 {
  margin: 0 0 0.8rem 0;
  font-size: 1.1rem;
  color: #5c4d42;
  font-family: 'Georgia', serif;
}
.events-flow {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
  padding-right: 4px;
}
.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.event-card {
  display: flex;
  background: #fffdfa;
  border: 1px solid #e3ded7;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(92, 77, 66, 0.03);
}
.event-date {
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  min-width: 55px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}
.event-date .day {
  font-size: 1.2rem;
}
.event-date .month {
  font-size: 0.7rem;
  text-transform: uppercase;
}
.event-details {
  padding: 8px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.event-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.event-details h4 {
  margin: 0;
  font-size: 0.95rem;
  color: #5c4d42;
}
.event-details p {
  margin: 4px 0 0 0;
  font-size: 0.8rem;
  color: #8c7e74;
}
.author-tag {
  font-size: 0.7rem;
  font-weight: bold;
  padding: 1px 6px;
  border-radius: 10px;
  border: 1px solid;
  background: #fffdfa;
  white-space: nowrap;
}
.empty-events {
  text-align: center;
  color: #bdafa4;
  font-size: 0.85rem;
  font-style: italic;
  margin-top: 20px;
}

/* ZONE DE FORMULAIRE INTÉGRÉE */
.agenda-input-zone {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid #f1eeeb;
  padding-top: 8px;
  background: #fffdfa;
  position: relative;
  z-index: 999;
}
.form-row {
  display: flex;
  gap: 6px;
}
.form-options {
  display: flex;
  gap: 6px;
  align-items: center;
}
.input-main, .input-sub {
  border: 1px solid #e3ded7;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 0.85rem;
  background: #fffdfa;
  color: #5c4d42;
  outline: none;
}
.input-main { flex: 1; font-weight: bold; }
.input-sub { flex: 1; font-size: 0.8rem; }

.select-author {
  border: 1px solid #e3ded7;
  border-radius: 20px;
  padding: 4px 8px;
  font-size: 0.8rem;
  background: #fffdfa;
  color: #5c4d42;
  outline: none;
  cursor: pointer;
}

/* Bouton pipette couleur stylisé en rond */
.color-picker-wrapper {
  position: relative;
  width: 28px;
  height: 28px;
  cursor: pointer;
}
.color-picker {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 2;
}
.color-preview {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border: 1px solid #e3ded7;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  z-index: 1;
}

.add-btn {
  background: #d47a6a;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
</style>