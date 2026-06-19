<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase'; 
import CalendrierJour from '../components/CalendrierJour.vue';
import Notes from '../components/Notes.vue';
import Message from '../components/Message.vue';
import Calendrier from '../components/Calendrier.vue';
import Jeu from '../components/Jeu.vue';

const router = useRouter();
const activeTab = ref('notes'); 

// Récupération de la session utilisateur
const currentUser = localStorage.getItem('currentUser') || 'thomas';

// URLs pour stocker l'aperçu de la dernière photo de chaque deck
const lastPhotoMoi = ref('');
const lastPhotoElle = ref('');

const goToAlbum = (target) => {
  if (target === 'moi') {
    router.push(`/album/${currentUser}`);
  } else {
    const alternateUser = currentUser === 'thomas' ? 'zoe' : 'thomas';
    router.push(`/album/${alternateUser}`);
  }
};

// Aller chercher la dernière photo de Thomas et de Zoé sur Supabase
const fetchLatestPhotos = async () => {
  try {
    const alternateUser = currentUser === 'thomas' ? 'zoe' : 'thomas';

    // 1. Dernière photo pour "Moi"
    const { data: dataMoi } = await supabase
      .from('photos')
      .select('url')
      .eq('owner', currentUser)
      .limit(1); // On prend la première sans trier
    
    if (dataMoi && dataMoi.length > 0) lastPhotoMoi.value = dataMoi[0].url;

    // 2. Dernière photo pour l'autre (Bloquée avant 20h00 !)
    const currentHour = new Date().getHours();
    if (currentHour >= 20) {
      const { data: dataElle } = await supabase
        .from('photos')
        .select('url')
        .eq('owner', alternateUser)
        .limit(1);

      if (dataElle && dataElle.length > 0) lastPhotoElle.value = dataElle[0].url;
    }
  } catch (err) {
    console.error("Erreur aperçu photos :", err.message);
  }
};

// --- GESTION DE L'APPAREIL PHOTO PLEIN ÉCRAN ---
const isCameraOpen = ref(false);
const videoPlayer = ref(null);
const fileInput = ref(null);
const currentFacingMode = ref('environment');
const stream = ref(null);

const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

const uploadPhotoToSupabase = async (photoBase64) => {
  try {
    const fileName = `photo_${currentUser}_${Date.now()}.jpg`;
    const blob = base64ToBlob(photoBase64, 'image/jpeg');

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos-album')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('photos-album')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    const { error: dbError } = await supabase
      .from('photos')
      .insert([
        { 
          url: publicUrl,
          owner: currentUser
        }
      ]);

    if (dbError) throw dbError;

    stopCamera();
    // Re-charge immédiatement les aperçus mis à jour
    await fetchLatestPhotos();
    goToAlbum('moi');
    
  } catch (err) {
    alert("Erreur lors de l'enregistrement de la photo : " + err.message);
    console.error(err);
  }
};

const openCamera = async () => {
  isCameraOpen.value = true;
  try {
    if (stream.value) stopCamera();
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacingMode.value },
      audio: false
    });
    if (videoPlayer.value) {
      videoPlayer.value.srcObject = stream.value;
    }
  } catch (err) {
    alert("Impossible d'accéder à la caméra : " + err.message);
    isCameraOpen.value = false;
  }
};

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
  }
  isCameraOpen.value = false;
};

const switchCamera = () => {
  currentFacingMode.value = currentFacingMode.value === 'environment' ? 'user' : 'environment';
  openCamera();
};

const capturePhoto = () => {
  const video = videoPlayer.value;
  if (!video) return;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  const photoBase64 = canvas.toDataURL('image/jpeg');
  uploadPhotoToSupabase(photoBase64);
};

const triggerFileSelect = () => {
  fileInput.value.click();
};

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadPhotoToSupabase(e.target.result);
    };
    reader.readAsDataURL(file);
  }
};

onMounted(() => {
  fetchLatestPhotos();
});

onUnmounted(() => { stopCamera(); });
</script>

<template>
  <div class="phone-container">
    
    <div v-if="isCameraOpen" class="camera-fullscreen-overlay">
      <button @click="stopCamera" class="close-camera-btn">✕</button>
      
      <video ref="videoPlayer" autoplay playsinline class="camera-stream"></video>

      <div class="camera-controls-bar">
        <button @click="triggerFileSelect" class="control-btn gallery-btn">🖼️ Galerie</button>
        
        <div @click="capturePhoto" class="shutter-button-outer">
          <div class="shutter-button-inner"></div>
        </div>
        
        <button @click="switchCamera" class="control-btn switch-btn">🔄 Caméra</button>
      </div>

      <input 
        type="file" 
        ref="fileInput" 
        accept="image/*" 
        style="display: none" 
        @change="onFileSelected"
      />
    </div>
    
    <CalendrierJour />

    <main class="middle-tabs" :class="{ 'expanded-view': activeTab === 'messages' || activeTab === 'jeu' }">
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
        <div 
          class="stacked-card card-1"
          :style="lastPhotoMoi ? { backgroundImage: `url(${lastPhotoMoi})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}"
        >
          <span v-if="!lastPhotoMoi"></span>
        </div>
      </div>

      <button class="camera-btn" @click="openCamera">
        <span class="camera-icon"></span>
      </button>

      <div class="photo-deck her-photos" @click="goToAlbum('elle')">
        <div class="stacked-card card-3"></div>
        <div class="stacked-card card-2"></div>
        <div 
          class="stacked-card card-1"
          :style="lastPhotoElle ? { backgroundImage: `url(${lastPhotoElle})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}"
        >
          <span v-if="!lastPhotoElle"></span>
        </div>
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

.bottom-camera-zone { 
  width: 100%;
  padding-bottom: 2vh;
  display: flex; 
  justify-content: space-between; 
  align-items: flex-end; 
  box-sizing: border-box;
  transform: translateY(-60px);
}

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
  margin-bottom: 20px; 
  box-shadow: 0 6px 14px rgba(92, 77, 66, 0.15);
  z-index: 10;
}
.camera-icon { font-size: 2rem; }

.photo-deck { 
  position: relative; 
  width: 150px;  
  height: 120px; 
  cursor: pointer; 
}

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

.my-photos .card-3 { transform: rotate(-12deg) translate(-8px, -4px); background-color: #f5f1ea; }
.my-photos .card-2 { transform: rotate(-6deg) translate(-4px, -2px); background-color: #faf7f2; }
.my-photos .card-1 { transform: rotate(-2deg); }

.her-photos .card-3 { transform: rotate(12deg) translate(8px, -4px); background-color: #f5f1ea; }
.her-photos .card-2 { transform: rotate(6deg) translate(4px, -2px); background-color: #faf7f2; }
.her-photos .card-1 { transform: rotate(2deg); }

.my-photos, .her-photos, .camera-btn {
  transition: transform 0.3s ease-in-out;
}

/* NETTOYAGE : Plus aucune propriété 'opacity' ne vient ternir ou effacer l'affichage ici */
.shifted-down .my-photos {
  transform: translateY(80px) rotate(-12deg); 
}

.shifted-down .her-photos {
  transform: translateY(80px) rotate(12deg); 
}

.shifted-down .camera-btn {
  transform: translateY(60px) scale(0.8);
}

.clover-grid, .tab-display-zone, .clover-leaf {
  transition: all 0.3s ease-in-out;
}

.expanded-view .clover-grid {
  height: 120px !important; 
  width: 120px !important;
  gap: 6px;                  
  margin-bottom: 15px !important;
  overflow: visible;         
}

.expanded-view .clover-leaf {
  font-size: 0.7rem !important;
}
.expanded-view .leaf-tl { border-radius: 18px 18px 4px 18px; }
.expanded-view .leaf-tr { border-radius: 18px 18px 18px 4px; }
.expanded-view .leaf-bl { border-radius: 18px 4px 18px 18px; }
.expanded-view .leaf-br { border-radius: 4px 18px 18px 18px; }

.expanded-view .tab-display-zone {
  height: 380px !important; 
  width: 92%; 
  border-color: #d47a6a; 
}

/* --- DESIGN APPAREIL PHOTO PLEIN ÉCRAN --- */
.camera-fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000000;
  z-index: 99999; 
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.camera-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.close-camera-btn {
  position: absolute;
  top: 25px;
  right: 25px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 10;
}

.camera-controls-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 130px;
  background: linear-gradient(transparent, rgba(0,0,0,0.85));
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: 25px;
  box-sizing: border-box;
}

.control-btn {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  backdrop-filter: blur(5px);
  cursor: pointer;
}

.shutter-button-outer {
  width: 76px;
  height: 76px;
  border: 4px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.shutter-button-inner {
  width: 60px;
  height: 60px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.1s;
}

.shutter-button-outer:active .shutter-button-inner {
  transform: scale(0.85);
}
</style>