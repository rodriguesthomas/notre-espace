<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { supabase } from '../supabase'; 

// Session utilisateur
const currentUser = ref('thomas');

// Thèmes (catégories)
const topics = ref([
  { id: 'admin', name: '💡 Administratif' },
  { id: 'droles', name: '😂 Moments drôles' }
]);

const activeTopicId = ref('admin');
const messages = ref([]);
const newMessageText = ref('');
let realtimeSubscription = null;

// Filtrer les messages selon la catégorie active
const currentMessages = computed(() => {
  return messages.value.filter(msg => msg.topic_id === activeTopicId.value);
});

// 1. Charger les messages depuis Supabase
const fetchMessages = async () => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Erreur chargement messages :', error);
  } else {
    messages.value = data || [];
  }
};

// 2. Écouter les nouveaux messages en temps réel (Realtime)
const subscribeToMessages = () => {
  realtimeSubscription = supabase
    .channel('public:messages')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
      if (payload.eventType === 'INSERT') {
        if (!messages.value.some(m => m.id === payload.new.id)) {
          messages.value.push(payload.new);
        }
      } else if (payload.eventType === 'DELETE') {
        messages.value = messages.value.filter(m => m.id !== payload.old.id);
      }
    })
    .subscribe();
};

onMounted(() => {
  currentUser.value = localStorage.getItem('currentUser') || 'thomas';
  fetchMessages();
  subscribeToMessages();
});

onUnmounted(() => {
  if (realtimeSubscription) {
    supabase.removeChannel(realtimeSubscription);
  }
});

// 🔔 Envoi de la notification Push via OneSignal
const sendPushNotification = async (messageText) => {
  const partnerUser = currentUser.value === 'thomas' ? 'zoe' : 'thomas';
  const senderName = currentUser.value === 'thomas' ? 'Thomas' : 'Zoé';

  try {
    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Key ${import.meta.env.VITE_ONESIGNAL_REST_KEY}`
      },
      body: JSON.stringify({
        app_id: 'cb8bf7f6-4a91-4c8c-aacc-894d16a98991',
        include_external_user_ids: [partnerUser],
        headings: { fr: `Nouveau message de ${senderName} 💌` },
        contents: { fr: messageText }
      })
    });
  } catch (err) {
    console.error("Erreur d'envoi notification :", err);
  }
};

// ✉️ Envoi d'un message dans Supabase (Noms des colonnes corrigés !)
const sendMessage = async () => {
  const text = newMessageText.value.trim();
  if (text === '') return;

  const newMsg = {
    topic_id: activeTopicId.value,
    sender_name: currentUser.value, // <-- Corrigé selon ta BDD
    content: text                    // <-- Corrigé selon ta BDD
  };

  newMessageText.value = '';

  // Insertion dans Supabase
  const { data, error } = await supabase
    .from('messages')
    .insert([newMsg])
    .select();

  if (error) {
    console.error('Erreur lors de l\'envoi :', error);
  } else if (data && data[0]) {
    messages.value.push(data[0]);
    // Déclenche la notification Push
    sendPushNotification(text);
  }
};

// 🗑️ Suppression d'un message dans Supabase
const deleteMessage = async (msgId) => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', msgId);

  if (error) {
    console.error('Erreur lors de la suppression :', error);
  } else {
    messages.value = messages.value.filter(msg => msg.id !== msgId);
  }
};

// Ajouter une catégorie
const createNewTopic = () => {
  const name = prompt('Nom de la nouvelle catégorie :');
  if (name && name.trim() !== '') {
    const newId = 'topic_' + Date.now();
    topics.value.push({ id: newId, name: name.trim() });
    activeTopicId.value = newId;
  }
};
</script>

<template>
  <div class="chat-container">
    
    <!-- En-tête des catégories -->
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
    
    <!-- Flux des messages -->
    <div class="messages-flow">
      <div 
        v-for="msg in currentMessages" 
        :key="msg.id"
        class="bubble" 
        :class="[
          msg.sender_name === currentUser ? 'me' : 'other',
          msg.sender_name === 'thomas' ? 'bg-thomas' : 'bg-zoe'
        ]"
      >
        <div class="bubble-header">
          <span class="sender">
            {{ msg.sender_name === currentUser ? 'Moi' : (msg.sender_name === 'thomas' ? 'Thomas' : 'Zoé') }}
          </span>
          <button 
            v-if="msg.sender_name === currentUser" 
            class="delete-btn" 
            title="Supprimer"
            @click="deleteMessage(msg.id)"
          >
            ✕
          </button>
        </div>
        <p>{{ msg.content }}</p>
      </div>
      
      <p v-if="currentMessages.length === 0" class="empty-chat">
        Aucun message ici pour le moment... Écris le premier ! 🌱
      </p>
    </div>

    <!-- Zone de saisie -->
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

/* Alignement */
.bubble.me {
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}
.bubble.other {
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

/* Couleurs */
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

/* Zone d'input */
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