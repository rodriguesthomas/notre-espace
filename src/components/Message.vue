<script setup>
import { ref, computed } from 'vue';

// 1. Liste dynamique des thèmes (catégories)
const topics = ref([
  { id: 'admin', name: '💡 Administratif' },
  { id: 'droles', name: '😂 Moments drôles' }
]);

// Thème sélectionné par défaut (on stocke l'id)
const activeTopicId = ref('admin');

// 2. Base de données locale des messages, triée par l'id du thème
const messagesByTopic = ref({
  admin: [
    { sender: 'Lui', text: 'Tu as pensé à réserver le resto pour ce soir ? 🤔', isMe: true },
    { sender: 'Elle', text: 'Oui c\'est fait ! Table réservée pour 20h pile ❤️', isMe: false }
  ],
  droles: [
    { sender: 'Elle', text: 'Tu as encore mis tes chaussettes à côté du bac ! 🧺', isMe: false },
    { sender: 'Lui', text: 'C\'était pour décorer le salon... 😇', isMe: true }
  ]
});

// Variable pour l'input d'envoi d'un nouveau message
const newMessageText = ref('');

// Calcul automatique pour récupérer les messages du thème actif
const currentMessages = computed(() => {
  return messagesByTopic.value[activeTopicId.value] || [];
});

// 3. Fonction pour ajouter une nouvelle messagerie (+)
const createNewTopic = () => {
  const name = prompt('Quel est le nom de la nouvelle messagerie ?');
  
  if (name && name.trim() !== '') {
    // Génère un ID unique simple basé sur le timestamp
    const newId = 'topic_' + Date.now();
    
    // Ajoute le thème dans la liste du haut
    topics.value.push({
      id: newId,
      name: name.trim()
    });
    
    // Initialise un tableau de messages vide pour cette nouvelle catégorie
    messagesByTopic.value[newId] = [];
    
    // Bascule automatiquement sur la nouvelle messagerie créée
    activeTopicId.value = newId;
  }
};

// Fonction bonus : Envoyer un message dans le thème actif
const sendMessage = () => {
  if (newMessageText.value.trim() === '') return;

  currentMessages.value.push({
    sender: 'Lui', // Par défaut "Lui", à lier plus tard avec l'utilisateur connecté
    text: newMessageText.value.trim(),
    isMe: true
  });

  newMessageText.value = ''; // Vide la barre d'envoi
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
        :class="msg.isMe ? 'me' : 'her'"
      >
        <span class="sender">{{ msg.sender }}</span>
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
  flex-wrap: wrap; /* Permet aux thèmes de passer à la ligne s'il y en a beaucoup */
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
  color: #8c7e74;
}
.bubble.me {
  background-color: #f5f1ea;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
  color: #5c4d42;
}
.bubble.her {
  background-color: #fbeee9;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
  color: #5c4d42;
}
.bubble.her .sender {
  color: #d47a6a;
  text-align: right;
}
.empty-chat {
  text-align: center;
  color: #bdafa4;
  font-size: 0.85rem;
  font-style: italic;
  margin-top: 20px;
}

/* STYLE DU BLOC D'ENVOI MIS À JOUR */
.chat-input-zone {
  display: flex;
  gap: 6px;
  border-top: 1px solid #f1eeeb;
  padding-top: 8px;
  background: #fffdfa; /* On force le fond blanc pour l'input */
  position: relative;
  z-index: 999; /* Force l'input à passer AU-DESSUS de tout le monde pour capter les clics */
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