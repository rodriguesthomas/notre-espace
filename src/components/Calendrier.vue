<script setup>
import { ref, onMounted } from 'vue';

const events = ref([]);
const newTitle = ref('');
const newDesc = ref('');
const newAuthor = ref('thomas');
const newColor = ref('#7fa4c4');

// Pour la modification
const editingEventId = ref(null);

// Charger les événements au démarrage
const loadEvents = () => {
  const saved = localStorage.getItem('agenda_events');
  if (saved) {
    events.value = JSON.parse(saved);
  } else {
    // Liste initiale vide ou par défaut
    events.value = [
      {
        id: 1,
        day: '19',
        month: 'Juin',
        title: 'Cinéma en amoureux 🍿',
        desc: 'Voir le nouveau film à 20h30',
        color: '#d47a6a',
        author: 'les deux'
      }
    ];
    saveEvents();
  }
};

const saveEvents = () => {
  localStorage.setItem('agenda_events', JSON.stringify(events.value));
  // Déclenche un événement personnalisé pour avertir instantanément le bandeau du haut
  window.dispatchEvent(new Event('agenda-updated'));
};

// Ajouter ou Modifier un événement
const handleSubmit = () => {
  if (!newTitle.value.trim()) return;

  if (editingEventId.value !== null) {
    // Mode Modification
    const index = events.value.findIndex(e => e.id === editingEventId.value);
    if (index !== -1) {
      events.value[index].title = newTitle.value;
      events.value[index].desc = newDesc.value;
      events.value[index].author = newAuthor.value;
      events.value[index].color = newColor.value;
    }
    editingEventId.value = null;
  } else {
    // Mode Ajout
    const today = new Date();
    const dayStr = String(today.getDate()).padStart(2, '0');
    const monthStr = today.toLocaleDateString('fr-FR', { month: 'short' });

    const newEvt = {
      id: Date.now(),
      day: dayStr,
      month: monthStr.replace('.', ''),
      title: newTitle.value,
      desc: newDesc.value,
      color: newColor.value,
      author: newAuthor.value
    };
    events.value.push(newEvt);
  }

  // Reset le formulaire
  newTitle.value = '';
  newDesc.value = '';
  saveEvents();
};

// Charger un événement dans le formulaire pour le modifier
const startEdit = (event) => {
  editingEventId.value = event.id;
  newTitle.value = event.title;
  newDesc.value = event.desc;
  newAuthor.value = event.author;
  newColor.value = event.color;
};

// Supprimer un événement
const deleteEvent = (id, clickEvent) => {
  clickEvent.stopPropagation(); // Évite de déclencher le mode édition en cliquant sur supprimer
  events.value = events.value.filter(e => e.id !== id);
  if (editingEventId.value === id) {
    editingEventId.value = null;
    newTitle.value = '';
    newDesc.value = '';
  }
  saveEvents();
};

onMounted(() => {
  loadEvents();
});
</script>

<template>
  <div class="agenda-container">
    <h3>Mon Agenda</h3>

    <div class="events-flow">
      <div v-if="events.length === 0" class="empty-events">Aucun événement de prévu</div>
      <div class="events-list" v-else>
        <div 
          v-for="event in events" 
          :key="event.id" 
          class="event-card"
          @click="startEdit(event)"
          title="Cliquer pour modifier"
          :class="{ 'is-editing': editingEventId === event.id }"
        >
          <div class="event-date" :style="{ backgroundColor: event.color }">
            <span class="day">{{ event.day }}</span>
            <span class="month">{{ event.month }}</span>
          </div>
          <div class="event-details">
            <div class="event-header-row">
              <h4>{{ event.title }}</h4>
              <div class="actions-wrapper">
                <span class="author-tag" :style="{ borderColor: event.color, color: event.color }">
                  👤 {{ event.author === 'les deux' ? 'Nous deux' : (event.author === 'thomas' ? 'Thomas' : 'Zoé') }}
                </span>
                <button class="delete-btn" @click="deleteEvent(event.id, $event)">✕</button>
              </div>
            </div>
            <p v-if="event.desc">{{ event.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="agenda-input-zone">
      <div class="form-row">
        <span v-if="editingEventId" class="edit-indicator">Modification en cours...</span>
        <input 
          v-model="newTitle" 
          type="text" 
          :placeholder="editingEventId ? 'Modifier le titre...' : 'Nouvelle activité...'" 
          class="input-main"
        />
        <button class="add-btn" @click="handleSubmit">
          {{ editingEventId ? '✓' : '+' }}
        </button>
      </div>
      
      <div class="form-options">
        <input 
          v-model="newDesc" 
          type="text" 
          placeholder="Description (optionnel)..." 
          class="input-sub"
          @keydown.enter="handleSubmit"
        />
        
        <select v-model="newAuthor" class="select-author">
          <option value="thomas">Thomas</option>
          <option value="zoe">Zoé</option>
          <option value="les deux">Nous deux 👩‍❤️‍👨</option>
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
.agenda-container { display: flex; flex-direction: column; height: 100%; justify-content: space-between; }
h3 { margin: 0 0 0.8rem 0; font-size: 1.1rem; color: #5c4d42; font-family: 'Georgia', serif; }
.events-flow { display: flex; flex-direction: column; flex: 1; overflow-y: auto; margin-bottom: 10px; padding-right: 4px; }
.events-list { display: flex; flex-direction: column; gap: 12px; }

.event-card { 
  display: flex; 
  background: #fffdfa; 
  border: 1px solid #e3ded7; 
  border-radius: 12px; 
  overflow: hidden; 
  box-shadow: 0 2px 6px rgba(92, 77, 66, 0.03); 
  cursor: pointer;
  transition: all 0.2s ease;
}
.event-card:hover { border-color: #bdafa4; background: #fffbf7; }
.event-card.is-editing { border: 2px dashed #d47a6a; }

.event-date { color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px; min-width: 55px; font-weight: bold; }
.event-date .day { font-size: 1.2rem; }
.event-date .month { font-size: 0.7rem; text-transform: uppercase; }
.event-details { padding: 8px 12px; flex: 1; display: flex; flex-direction: column; justify-content: center; }
.event-header-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.event-details h4 { margin: 0; font-size: 0.95rem; color: #5c4d42; }
.event-details p { margin: 4px 0 0 0; font-size: 0.8rem; color: #8c7e74; }

.actions-wrapper { display: flex; align-items: center; gap: 6px; }
.author-tag { font-size: 0.7rem; font-weight: bold; padding: 1px 6px; border-radius: 10px; border: 1px solid; background: #fffdfa; white-space: nowrap; }

.delete-btn {
  background: transparent;
  border: none;
  color: #c2b5aa;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 2px 6px;
}
.delete-btn:hover { color: #d47a6a; }

.empty-events { text-align: center; color: #bdafa4; font-size: 0.85rem; font-style: italic; margin-top: 20px; }

/* --- ZONE DE FORMULAIRE EN BAS --- */
.agenda-input-zone { 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
  border-top: 1px solid #f1eeeb; 
  padding: 12px 0 4px 0; 
  background: #fffdfa; 
  position: relative; 
  z-index: 10; /* Baissé pour éviter les conflits de clics */
}

/* AJOUT : Force le navigateur à capter les clics sur chaque ligne */
.form-row, .form-options { 
  display: flex; 
  align-items: center;
  position: relative;
  z-index: 15; 
}

.form-row { 
  gap: 8px; 
}

.form-options { 
  gap: 8px; 
  width: 100%;
}

/* --- ENTRÉES TEXTE (INPUTS) --- */
.input-main, .input-sub { 
  border: 1px solid #e3ded7; 
  border-radius: 20px; 
  padding: 8px 14px; 
  font-size: 0.85rem; 
  background: #fffdfa; 
  color: #5c4d42; 
  outline: none; 
  box-sizing: border-box;
  position: relative;
  z-index: 20; /* Priorité maximale au clic */
}

.input-main { 
  flex: 1; 
  font-weight: bold; 
}

.input-sub { 
  flex: 1.2; 
  font-size: 0.8rem; 
}

/* --- LE SÉLECTEUR D'AUTEUR --- */
.select-author { 
  flex: 0.8;
  min-width: 95px;
  border: 1px solid #e3ded7; 
  border-radius: 20px; 
  padding: 6px 24px 6px 12px; 
  font-size: 0.8rem; 
  background: #fffdfa url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%238c7e74' viewBox='0 0 16 16'><path d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/></svg>") no-repeat;
  background-position: calc(100% - 10px) center;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  color: #5c4d42; 
  outline: none; 
  cursor: pointer; 
  position: relative;
  z-index: 20; /* Priorité maximale au clic */
}

/* --- BOUTON PIPETTE (PALETTE COULEUR) --- */
.color-picker-wrapper { 
  position: relative; 
  width: 32px; 
  height: 32px; 
  flex-shrink: 0;
  cursor: pointer; 
  z-index: 20;
}

.color-picker { 
  position: absolute; 
  opacity: 0; 
  width: 100%; 
  height: 100%; 
  cursor: pointer; 
  z-index: 22; 
}

.color-preview { 
  position: absolute; 
  width: 100%; 
  height: 100%; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 0.85rem; 
  border: 1px solid #e3ded7; 
  box-shadow: 0 1px 4px rgba(0,0,0,0.05); 
  z-index: 21; 
  box-sizing: border-box;
  background-color: #fffdfa;
}

/* --- BOUTON AJOUTER --- */
.add-btn { 
  background: #d47a6a; 
  color: white; 
  border: none; 
  border-radius: 50%; 
  width: 32px; 
  height: 32px; 
  flex-shrink: 0;
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-weight: bold; 
  box-shadow: 0 2px 6px rgba(212, 122, 106, 0.2);
  position: relative;
  z-index: 20;
}
</style>