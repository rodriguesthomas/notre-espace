<script setup>
import { ref, computed, onMounted } from 'vue';

// Récupération de la session utilisateur
const currentUser = ref('thomas');

onMounted(() => {
  currentUser.value = localStorage.getItem('currentUser') || 'thomas';
});

// 1. Liste dynamique des thèmes (catégories)
const topics = ref([
  { id: 'admin', name: '💡 Administratif' },
  { id: 'droles', name: '😂 Moments drôles' }
]);

const activeTopicId = ref('admin');

// 2. Base de données locale synchronisée avec les identifiants réels
const messagesByTopic = ref({
  admin: [
    { sender: 'thomas', text: 'Tu as pensé à réserver le resto pour ce soir ? 🤔' },
    { sender: 'zoe', text: 'Oui c\'est fait ! Table réservée pour 20h pile ❤️' }
  ],
  droles: [
    { sender: 'zoe', text: 'Tu as encore mis tes chaussettes à côté du bac ! 🧺' },
    { sender: 'thomas', text: 'C\'était pour décorer le salon... 😇' }
  ]
});

const newMessageText = ref('');

// Filtre automatique des messages selon l'onglet actif
const currentMessages = computed(() => {
  return messagesByTopic.value[activeTopicId.value] || [];
});

// Création d'une nouvelle catégorie
const createNewTopic = () => {
  const name = prompt('Quel est le nom de la nouvelle messagerie ?');
  
  if (name && name.trim() !== '') {
    const newId = 'topic_' + Date.now();
    topics.value.push({ id: newId, name: name.trim() });
    messagesByTopic.value[newId] = [];
    activeTopicId.value = newId;
  }
};

// Envoi du message avec l'auteur dynamique de la session
const sendMessage = () => {
  if (newMessageText.value.trim() === '') return;

  currentMessages.value.push({
    sender: currentUser.value,
    text: newMessageText.value.trim()
  });

  newMessageText.value = ''; 
};
</script>

<template>
  <div class="chat-container">
    
    <div class="chat-header">
      <span 
        v-for="topic in topics" 
        :key="topic.id"
        class="topic" 
        :class="{ active: activeTopicId === topic.id }" 
        @click="activeTopicId = topic.id"
      >
        {{ topic.name }}
      </span>
      <span class="topic add-btn" @click="createNewTopic">+</span>
    </div>
    
    <div class="messages-flow">
      <div 
        v-for="(msg, index) in currentMessages" 
        :key="index"
        class="bubble" 
        :class="[
          msg.sender === currentUser ? 'me' : 'other',
          msg.sender === 'thomas' ? 'bg-thomas' : 'bg-zoe'
        ]"
      >
        <span class="sender">
          {{ msg.sender === currentUser ? 'Moi' : (msg.sender === 'thomas' ? 'Thomas' : 'Zoé') }}
        </span>
        <p>{{ msg.text }}</p>
      </div>
      
      <p v-if="currentMessages.length === 0" class="empty-chat">
        Aucun message ici pour le moment... Écris le premier ! 🌱
      </p>
    </div>

    <div class="chat-input-zone">
      <input 
        v-model="newMessageText" 
        type="text" 
        placeholder="Écrire un message..." 
        @keydown.enter="sendMessage"
      />
      <button @click="sendMessage">➔</button>
    </div>

  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}
.chat-header {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
  border-bottom: 1px solid #f1eeeb;
  padding-bottom: 0.5rem;
  flex-wrap: wrap;
}
.topic {
  font-size: 0.8rem;
  padding: 4px 10px;
  background: #f1eeeb;
  color: #8c7e74;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  user-select: none;
}
.topic.active {
  background: #d47a6a;
  color: white;
}
.add-btn {
  background: #cbd5e1;
  color: #475569;
}
.messages-flow {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
}
.bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 0.9rem;
  line-height: 1.4;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}
.bubble p {
  margin: 0;
}
.sender {
  font-size: 0.7rem;
  font-weight: bold;
  display: block;
  margin-bottom: 2px;
}

/* --- ALIGNEMENT DES BULLES (POSITION) --- */
.bubble.me {
  align-self: flex-end; /* Mes messages vont à droite */
  border-bottom-right-radius: 4px;
}
.bubble.other {
  align-self: flex-start; /* Les messages de l'autre vont à gauche */
  border-bottom-left-radius: 4px;
}

/* --- DESIGN DES COULEURS ATTRIBUÉES AUX PRÉNOMS --- */
.bg-thomas {
  background-color: #7fa4c4 !important; /* Bleu Thomas fixe */
  color: white !important;
}
.bg-thomas .sender {
  color: #e2e8f0 !important;
}

.bg-zoe {
  background-color: #d47a6a !important; /* Terracotta Zoé fixe */
  color: white !important;
}
.bg-zoe .sender {
  color: #fbeee9 !important;
}

.empty-chat {
  text-align: center;
  color: #bdafa4;
  font-size: 0.85rem;
  font-style: italic;
  margin-top: 20px;
}

/* ZONE D'INPUT */
.chat-input-zone {
  display: flex;
  gap: 6px;
  border-top: 1px solid #f1eeeb;
  padding-top: 8px;
  background: #fffdfa;
  position: relative;
  z-index: 999;
}
.chat-input-zone input {
  flex: 1;
  border: 1px solid #e3ded7;
  border-radius: 20px;
  padding: 8px 14px;
  font-size: 0.9rem;
  background: #fffdfa;
  color: #5c4d42;
  outline: none;
}
.chat-input-zone input:focus {
  border-color: #d47a6a;
}
.chat-input-zone button {
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