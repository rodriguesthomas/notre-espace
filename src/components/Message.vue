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

// 2. Base de données locale
const messagesByTopic = ref({
  admin: [
    { id: 1, sender: 'thomas', text: 'Tu as pensé à réserver le resto pour ce soir ? 🤔' },
    { id: 2, sender: 'zoe', text: 'Oui c\'est fait ! Table réservée pour 20h pile ❤️' }
  ],
  droles: [
    { id: 3, sender: 'zoe', text: 'Tu as encore mis tes chaussettes à côté du bac ! 🧺' },
    { id: 4, sender: 'thomas', text: 'C\'était pour décorer le salon... 😇' }
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

// 🔔 Fonction d'envoi de notification Push via OneSignal
const sendPushNotification = async (messageText) => {
  const partnerUser = currentUser.value === 'thomas' ? 'zoe' : 'thomas';
  const senderName = currentUser.value === 'thomas' ? 'Thomas' : 'Zoé';

  try {
    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // 🔑 REMPLACE 'TA_REST_API_KEY_ICI' PAR TA VRAIE CLE ONE SIGNAL !
        'Authorization': 'Key os_v2_app_zof7p5sksfgizkwmrfgrnkmjshu5f252nvweg7vs7dnz4c4uk3v2nhp5y6vaywc4jtf7cuey5k3m2pbtbiklzehckgbyqoidxuh7sma' 
      },
      body: JSON.stringify({
        app_id: "cb8bf7f6-4a91-4c8c-aacc-894d16a98991",
        include_external_user_ids: [partnerUser], // Envoie uniquement au téléphone de l'autre !
        headings: { fr: `Nouveau message de ${senderName} 💌` },
        contents: { fr: messageText }
      })
    });
  } catch (err) {
    console.error("Erreur d'envoi de la notification :", err);
  }
};

// Envoi du message avec déclenchement de la notification
const sendMessage = () => {
  const text = newMessageText.value.trim();
  if (text === '') return;

  const newMsg = {
    id: Date.now(),
    sender: currentUser.value,
    text: text
  };

  currentMessages.value.push(newMsg);
  newMessageText.value = '';

  // Déclenche l'envoi de la notification Push
  sendPushNotification(text);
};

// 🗑️ Fonction de suppression d'un message
const deleteMessage = (msgId) => {
  messagesByTopic.value[activeTopicId.value] = currentMessages.value.filter(
    (msg) => msg.id !== msgId
  );
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
        v-for="msg in currentMessages" 
        :key="msg.id"
        class="bubble" 
        :class="[
          msg.sender === currentUser ? 'me' : 'other',
          msg.sender === 'thomas' ? 'bg-thomas' : 'bg-zoe'
        ]"
      >
        <div class="bubble-header">
          <span class="sender">
            {{ msg.sender === currentUser ? 'Moi' : (msg.sender === 'thomas' ? 'Thomas' : 'Zoé') }}
          </span>
          <!-- Bouton de suppression (uniquement pour ses propres messages) -->
          <button 
            v-if="msg.sender === currentUser" 
            class="delete-btn" 
            title="Supprimer le message"
            @click="deleteMessage(msg.id)"
          >
            ✕
          </button>
        </div>
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
  position: relative;
}
.bubble p {
  margin: 0;
  word-break: break-word;
}
.bubble-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}
.sender {
  font-size: 0.7rem;
  font-weight: bold;
}
.delete-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0 0 0 8px;
  line-height: 1;
}
.delete-btn:hover {
  color: #ffffff;
}

/* --- ALIGNEMENT DES BULLES --- */
.bubble.me {
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}
.bubble.other {
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

/* --- DESIGN DES COULEURS --- */
.bg-thomas {
  background-color: #7fa4c4 !important;
  color: white !important;
}
.bg-thomas .sender {
  color: #e2e8f0 !important;
}

.bg-zoe {
  background-color: #d47a6a !important;
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