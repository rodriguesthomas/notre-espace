<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { supabase } from '../supabase';

const canvas = ref(null);
let ctx = null;
const isDrawing = ref(false);
const color = ref('#d47a6a'); // Couleur par défaut (Terracotta)
const lineWidth = ref(4);
const lastDrawingUrl = ref('');
const currentUser = ref(localStorage.getItem('currentUser') || 'thomas');

// Couleurs pré-définies
const palette = ['#5c4d42', '#d47a6a', '#7fa4c4', '#81a986', '#eab308', '#000000'];

onMounted(() => {
  const cvs = canvas.value;
  ctx = cvs.getContext('2d');
  
  // Ajuster la résolution du canvas
  cvs.width = cvs.parentElement.clientWidth - 20;
  cvs.height = 320;
  
  // Fond blanc de départ
  clearCanvas();
  loadLatestDrawing();
});

// Effacer le canvas
const clearCanvas = () => {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
};

// Obtenir les coordonnées (tactile + souris)
const getPos = (e) => {
  const rect = canvas.value.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
};

const startDrawing = (e) => {
  isDrawing.value = true;
  const { x, y } = getPos(e);
  ctx.beginPath();
  ctx.moveTo(x, y);
};

const draw = (e) => {
  if (!isDrawing.value) return;
  e.preventDefault(); // Empêche le scroll sur mobile
  const { x, y } = getPos(e);
  ctx.lineTo(x, y);
  ctx.strokeStyle = color.value;
  ctx.lineWidth = lineWidth.value;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
};

const stopDrawing = () => {
  isDrawing.value = false;
};

// Charger le dernier dessin enregistré
const loadLatestDrawing = async () => {
  const { data, error } = await supabase
    .from('whiteboard')
    .select('*')
    .order('id', { ascending: false })
    .limit(1);

  if (data && data.length > 0) {
    lastDrawingUrl.value = data[0].image_url;
  }
};

// Sauvegarder et publier le dessin
const saveDrawing = async () => {
  // Convertir le canvas en blob (image PNG)
  canvas.value.toBlob(async (blob) => {
    if (!blob) return;

    const fileName = `drawing_${Date.now()}.png`;

    // 1. Envoyer dans Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('drawings')
      .upload(fileName, blob, { contentType: 'image/png' });

    if (storageError) {
      alert('Erreur upload image : ' + storageError.message);
      return;
    }

    // 2. Obtenir l'URL publique de l'image
    const { data: publicUrlData } = supabase.storage
      .from('drawings')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // 3. Enregistrer l'entrée dans la BDD
    const { error: dbError } = await supabase
      .from('whiteboard')
      .insert([{ image_url: imageUrl, created_by: currentUser.value }]);

    if (dbError) {
      alert('Erreur BDD : ' + dbError.message);
    } else {
      lastDrawingUrl.value = imageUrl;
      alert('Dessin publié avec succès ! 🎨');
    }
  }, 'image/png');
};
</script>

<template>
  <div class="whiteboard-container">
    <h3>🎨 Tableau Blanc</h3>

    <!-- Zone de dessin -->
    <div class="canvas-wrapper">
      <canvas
        ref="canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="startDrawing"
        @touchmove="draw"
        @touchend="stopDrawing"
      ></canvas>
    </div>

    <!-- Outils (Palette de couleurs & boutons) -->
    <div class="tools-bar">
      <div class="palette">
        <span
          v-for="c in palette"
          :key="c"
          class="color-dot"
          :style="{ backgroundColor: c }"
          :class="{ active: color === c }"
          @click="color = c"
        ></span>
      </div>

      <div class="actions">
        <button class="btn-clear" @click="clearCanvas">🗑️ Effacer</button>
        <button class="btn-save" @click="saveDrawing">✨ Valider & Envoyer</button>
      </div>
    </div>

    <!-- Aperçu du dernier dessin partagé -->
    <div v-if="lastDrawingUrl" class="last-drawing">
      <h4>Dernier petit mot partagé :</h4>
      <img :src="lastDrawingUrl" alt="Dernier dessin" />
    </div>
  </div>
</template>

<style scoped>
.whiteboard-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.canvas-wrapper {
  background: white;
  border: 2px dashed #e3ded7;
  border-radius: 16px;
  padding: 8px;
  display: flex;
  justify-content: center;
  touch-action: none; /* Empêche le scroll au doigt pendant le dessin */
}

canvas {
  border-radius: 12px;
  cursor: crosshair;
}

.tools-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.palette {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.2s;
}

.color-dot.active {
  transform: scale(1.2);
  border-color: #5c4d42;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

button {
  padding: 8px 14px;
  border-radius: 20px;
  border: none;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-clear {
  background: #f1eeeb;
  color: #8c7e74;
}

.btn-save {
  background: #d47a6a;
  color: white;
}

.last-drawing {
  margin-top: 15px;
  text-align: center;
}

.last-drawing img {
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  border: 1px solid #e3ded7;
}
</style>