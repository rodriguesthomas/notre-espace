<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import CalendrierJour from '../components/CalendrierJour.vue';
import Notes from '../components/Notes.vue';
import Message from '../components/Message.vue';
import Calendrier from '../components/Calendrier.vue';
import Jeu from '../components/Jeu.vue';

const router = useRouter();
const activeTab = ref('notes'); 


const goToAlbum = (owner) => {
  router.push(`/album/${owner}`);
};
</script>

<template>
  <div class="phone-container">
    
    <CalendrierJour />

    <main class="middle-tabs" :class="{ 'expanded-view': activeTab === 'messages' || activeTab === 'notes' }">
      <div class="clover-grid">
        <button class="clover-leaf leaf-tl" :class="{ active: activeTab === 'notes' }" @click="activeTab = 'notes'">
          <span>Notes</span>
        </button>
        <button class="clover-leaf leaf-tr" :class="{ active: activeTab === 'messages' }" @click="activeTab = 'messages'">
          <span>Message</span>
        </button>
        <button class="clover-leaf leaf-bl" :class="{ active: activeTab === 'calendrier' }" @click="activeTab = 'calendrier'">
          <span>Agenda</span>
        </button>
        <button class="clover-leaf leaf-br" :class="{ active: activeTab === 'jeu' }" @click="activeTab = 'jeu'">
          <span>Jeu</span>
        </button>
      </div>

      <div class="tab-display-zone">
        <Notes v-if="activeTab === 'notes'" />
        <Message v-if="activeTab === 'messages'" />
        <Calendrier v-if="activeTab === 'calendrier'" />
        <Jeu v-if="activeTab === 'jeu'" />
      </div>
    </main>

    <footer class="bottom-camera-zone" :class="{ 'shifted-down': activeTab === 'messages' || activeTab === 'notes' || activeTab === 'calendrier' || activeTab === 'jeu'}">
      <div class="photo-deck my-photos" @click="goToAlbum('moi')">
        <div class="stacked-card card-3"></div>
        <div class="stacked-card card-2"></div>
        <div class="stacked-card card-1"></div>
      </div>

      <button class="camera-btn" @click="alert('Photo prise !')">
        <span class="camera-icon"></span>
      </button>

      <div class="photo-deck her-photos" @click="goToAlbum('elle')">
        <div class="stacked-card card-3"></div>
        <div class="stacked-card card-2"></div>
        <div class="stacked-card card-1"></div>
      </div>
    </footer>
    
  </div>
</template>

<style scoped>

.phone-container {
  width: 100vw;
  height: 100vh;
  background-color: #f7f4ef !important;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden; 
  font-family: 'Georgia', Cambria, serif;
  margin: 0;
}

.middle-tabs { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  padding: 2vh; 
}

.clover-grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 12px; 
  width: 180px; 
  height: 180px; 
  margin-bottom: 25px; 
}

.clover-leaf { 
  background: #fffdfa; 
  border: 2px solid #8c7e74; 
  cursor: pointer; 
  box-shadow: 3px 3px 0px #bdafa4; 
  font-weight: bold; 
  color: #5c4d42; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-family: sans-serif;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

/* Arrondis asymétriques pour faire les feuilles du trèfle */
.leaf-tl { border-radius: 30px 30px 5px 30px; }
.leaf-tr { border-radius: 30px 30px 30px 5px; }
.leaf-bl { border-radius: 30px 5px 30px 30px; }
.leaf-br { border-radius: 5px 30px 30px 30px; }

.clover-leaf.active { 
  background-color: #d47a6a; 
  color: white; 
  border-color: #a65244; 
  box-shadow: 3px 3px 0px #6e3127;
  transform: scale(1.05); 
}

/* ZONE D'AFFICHAGE DU CONTENU COMPOSANT */
.tab-display-zone { 
  width: 90%; 
  max-width: 420px;
  background: #fffdfa; 
  border: 1px solid #e3ded7;
  border-radius: 15px; 
  padding: 20px; 
  height: 220px; 
  overflow-y: auto; 
  box-shadow: 0 4px 12px rgba(92, 77, 66, 0.06); 
  color: #4a3e3d; 
}

/* STRUCTURE HORIZONTALE DU BAS */
.bottom-camera-zone { 
  width: 100%;
  padding-bottom: 2vh;
  display: flex; 
  justify-content: space-between; 
  align-items: flex-end; 
  box-sizing: border-box;
  transform: translateY(-60px);
}

/* BOUTON APPAREIL PHOTO CENTRAL */
.camera-btn { 
  width: 80px; 
  height: 80px; 
  border-radius: 50%; 
  background: #fffdfa; 
  border: 3px solid #dddcdc; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  margin-bottom: 20px; /* Aligné proprement avec les decks relevés */
  box-shadow: 0 6px 14px rgba(92, 77, 66, 0.15);
  z-index: 10;
}
.camera-icon { font-size: 2rem; }

/* PAQUETS DE CARTES PHOTOS LATÉRAUX */
.photo-deck { 
  position: relative; 
  width: 150px;  
  height: 120px; 
  cursor: pointer; 
}

/* Sortie extérieure et élévation indépendante du bouton */
.my-photos { 
  margin-left: -60px; 
  transform: translateY(-20px);
} 
.her-photos { 
  margin-right: -60px; 
  transform: translateY(-20px);
} 

.stacked-card { 
  position: absolute; 
  width: 100%; 
  height: 100%; 
  background: #fffdfa; 
  border: 1.5px solid #e3ded7; 
  border-radius: 16px; 
  box-shadow: -2px 4px 12px rgba(92, 77, 66, 0.1); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 0.9rem; 
  font-weight: bold; 
  color: #8c7e74; 
}

/* Effets de rotation des cartes pour le style dessiné */
.my-photos .card-3 { transform: rotate(-12deg) translate(-8px, -4px); background-color: #f5f1ea; }
.my-photos .card-2 { transform: rotate(-6deg) translate(-4px, -2px); background-color: #faf7f2; }
.my-photos .card-1 { transform: rotate(-2deg); }

.her-photos .card-3 { transform: rotate(12deg) translate(8px, -4px); background-color: #f5f1ea; }
.her-photos .card-2 { transform: rotate(6deg) translate(4px, -2px); background-color: #faf7f2; }
.her-photos .card-1 { transform: rotate(2deg); }

.placeholder-content { text-align: center; padding-top: 40px; color: #bdafa4; }

/* --- LE FONDU CACHÉ QUI MARCHE POUR LES DEUX --- */

/* 1. On prépare la transition sur les deux decks et le bouton */
.my-photos, .her-photos, .camera-btn {
  transition: transform 0.3s ease-in-out, opacity 0.3s ease;
}

/* 2. Quand on est dans Message, on applique l'effet à MOI */
.shifted-down .my-photos {
  transform: translateY(80px) rotate(-12deg); /* Descend un peu et pivote */
  opacity: 0.15; /* Joli fondu transparent */
}

/* 3. Et on applique EXACTEMENT le même effet à ELLE (en miroir) */
.shifted-down .her-photos {
  transform: translateY(80px) rotate(12deg); /* Descend aussi et pivote de son côté */
  opacity: 0.15; /* Le même fondu transparent ! */
}

/* 4. On adoucit aussi l'appareil photo central */
.shifted-down .camera-btn {
  transform: translateY(60px) scale(0.8);
  opacity: 0.2;
}

/* --- TRANSITIONS POUR UN EFFET FLUIDE --- */
.clover-grid, .tab-display-zone, .clover-leaf {
  transition: all 0.3s ease-in-out;
}

/* --- QUAND L'ONGLET MESSAGE OU NOTE EST ACTIF --- */

/* 1. Le trèfle passe en mode miniature mais RESTE cliquable et visible */
.expanded-view .clover-grid {
  height: 120px !important; /* Taille miniature parfaite */
  width: 120px !important;
  gap: 6px;                  /* Espacement réduit */
  margin-bottom: 15px !important;
  overflow: visible;         /* On empêche le trèfle d'être coupé */
}

/* On réduit la police et les arrondis du mini-trèfle pour que ce soit très propre */
.expanded-view .clover-leaf {
  font-size: 0.7rem !important;
}
.expanded-view .leaf-tl { border-radius: 18px 18px 4px 18px; }
.expanded-view .leaf-tr { border-radius: 18px 18px 18px 4px; }
.expanded-view .leaf-bl { border-radius: 18px 4px 18px 18px; }
.expanded-view .leaf-br { border-radius: 4px 18px 18px 18px; }

/* 2. La boîte s'agrandit de manière équilibrée pour ne pas écraser le bas */
.expanded-view .tab-display-zone {
  height: 380px !important; /* Hauteur ajustée pour libérer le bas de l'écran */
  width: 92%; 
  border-color: #d47a6a; 
}
</style>