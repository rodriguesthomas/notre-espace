<script setup>
import { ref, computed, onMounted } from 'vue';
// 1. On connecte notre client Supabase
import { supabase } from '../supabase';

// Listes dynamiques synchronisées avec Supabase
const noteCategories = ref([]);
const activeCategoryId = ref('');
const allNotes = ref([]);

// Variable pour le champ d'écriture
const newTaskText = ref('');

// Récupération automatique des notes de la catégorie sélectionnée
const currentTasks = computed(() => {
  return allNotes.value.filter(note => note.category_id === activeCategoryId.value);
});

// --- FONCTIONS CLOUD SUPABASE ---

// Charger toutes les données depuis Supabase au démarrage
const loadData = async () => {
  // 1. On récupère les catégories
  const { data: categories } = await supabase
    .from('note_categories') // Assure-toi que le nom de ta table correspond bien sur Supabase
    .select('*');
    
  if (categories && categories.length > 0) {
    noteCategories.value = categories;
    // Si aucune catégorie n'est active, on prend la première par défaut
    if (!activeCategoryId.value) {
      activeCategoryId.value = categories[0].id;
    }
  }

  // 2. On récupère toutes les notes
  const { data: notes } = await supabase
    .from('notes')
    .select('*');
    
  if (notes) {
    // On re-mappe les données pour correspondre à ton affichage textuel
    allNotes.value = notes.map(n => ({
      id: n.id,
      text: n.content, // convertit le champ 'content' de Supabase en 'text'
      category_id: n.category_id
    }));
  }
};

// Ajouter une NOUVELLE PAGE/CATÉGORIE de notes (+)
const createNewCategory = async () => {
  const name = prompt('Quel est le nom de ta nouvelle page de notes ?');
  
  if (name && name.trim() !== '') {
    const cleanName = name.trim();
    
    // Insertion dans Supabase
    const { data, error } = await supabase
      .from('note_categories')
      .insert([{ name: cleanName }])
      .select();

    if (!error && data) {
      // On recharge tout pour avoir les derniers IDs générés par Supabase
      await loadData();
      activeCategoryId.value = data[0].id; // Bascule sur la nouvelle
    }
  }
};

// Ajouter une note sur la page actuelle
const addTask = async () => {
  if (newTaskText.value.trim() === '' || !activeCategoryId.value) return;

  const textToSend = newTaskText.value.trim();
  newTaskText.value = ''; // Vide l'input immédiatement pour le confort visuel

  // Insertion directe dans la table 'notes' sur Supabase
  const { error } = await supabase
    .from('notes')
    .insert([
      { 
        content: textToSend, 
        category_id: activeCategoryId.value 
      }
    ]);

  if (!error) {
    // On rafraîchit les notes locales depuis le cloud
    await loadData();
  }
};

// Lancer le chargement des données quand le composant apparaît
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="notes-container">
    <div class="notes-header">
      <span 
        v-for="cat in noteCategories" 
        :key="cat.id"
        class="category-tab" 
        :class="{ active: activeCategoryId === cat.id }" 
        @click="activeCategoryId = cat.id"
      >
        {{ cat.name }}
      </span>
      <span class="category-tab add-btn" @click="createNewCategory">+</span>
    </div>
    
    <div class="tasks-flow">
      <div v-for="(note, index) in currentTasks" :key="index" class="note-block">
        <p class="note-text">{{ note.text }}</p>
      </div>
      
      <p v-if="currentTasks.length === 0" class="empty-notes">
        Cette page de notes est vide. Écris un petit mot en bas ! 📝
      </p>
    </div>

    <div class="notes-input-zone">
      <input 
        v-model="newTaskText" 
        type="text" 
        placeholder="Écrire une note..." 
        @keydown.enter="addTask"
      />
      <button @click="addTask">➔</button>
    </div>
  </div>
</template>

<style scoped>
.notes-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}
.notes-header {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
  border-bottom: 1px solid #f1eeeb;
  padding-bottom: 0.5rem;
  flex-wrap: wrap;
}
.category-tab {
  font-size: 0.8rem;
  padding: 4px 10px;
  background: #f1eeeb;
  color: #8c7e74;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  user-select: none;
}
.category-tab.active {
  background: #d47a6a;
  color: white;
}
.add-btn {
  background: #cbd5e1;
  color: #475569;
}

/* DESIGN DES BLOCS DE NOTES COCON */
.tasks-flow {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
  padding-right: 4px;
}
.note-block {
  background: #fffdfa;
  border-left: 4px solid #d47a6a; /* Petit liseré terracotta chaleureux */
  padding: 10px 14px;
  border-radius: 4px 12px 12px 4px;
  box-shadow: 0 2px 8px rgba(92, 77, 66, 0.04);
  border-top: 1px solid #f6f2ec;
  border-right: 1px solid #f6f2ec;
  border-bottom: 1px solid #e3ded7;
}
.note-text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #4a3e3d;
}
.empty-notes {
  text-align: center;
  color: #bdafa4;
  font-size: 0.85rem;
  font-style: italic;
  margin-top: 20px;
}

/* BARRE EN BAS POUR AJOUTER UNE NOTE */
.notes-input-zone {
  display: flex;
  gap: 6px;
  border-top: 1px solid #f1eeeb;
  padding-top: 8px;
  background: #fffdfa;
  position: relative;
  z-index: 999;
}
.notes-input-zone input {
  flex: 1;
  border: 1px solid #e3ded7;
  border-radius: 20px;
  padding: 8px 14px;
  font-size: 0.9rem;
  background: #fffdfa;
  color: #5c4d42;
  outline: none;
}
.notes-input-zone input:focus {
  border-color: #d47a6a;
}
.notes-input-zone button {
  background: #d47a6a;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
</style>