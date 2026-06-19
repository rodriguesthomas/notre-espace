<script setup>
import { ref, computed, onMounted } from 'vue';

// Gestion de la session de l'utilisateur connecté ('thomas' ou 'zoe')
const currentUser = ref('thomas');

// Récupération de l'autre profil
const alternateUser = computed(() => {
  return currentUser.value === 'thomas' ? 'zoe' : 'thomas';
});

// Les mots secrets chargés depuis le localStorage
const secretWords = ref({
  thomas: '', // Le mot secret que Zoé prépare pour Thomas
  zoe: ''     // Le mot secret que Thomas prépare pour Zoé
});

// Variables de préparation
const inputSecret = ref('');

// Variables de jeu pour la partie en cours
const currentGuess = ref('');
const guesses = ref([]); // Historique des essais
const maxAttempts = 6;
const gameWon = ref(false);
const gameGameOver = ref(false);

// Charger les données de session et les mots sauvegardés
const initGameStorage = () => {
  currentUser.value = localStorage.getItem('currentUser') || 'thomas';
  
  const savedWords = localStorage.getItem('game_secret_words');
  if (savedWords) {
    secretWords.value = JSON.parse(savedWords);
  }
};

// Sauvegarder les mots secrets
const saveSecretWordsToStorage = () => {
  localStorage.setItem('game_secret_words', JSON.stringify(secretWords.value));
};

// Le mot que l'utilisateur connecté doit deviner
const wordToFind = computed(() => {
  return secretWords.value[currentUser.value] ? secretWords.value[currentUser.value].toUpperCase() : '';
});

// Enregistrer le mot secret créé pour l'autre
const saveSecretWord = () => {
  const word = inputSecret.value.trim().toUpperCase();
  if (word.length < 3 || word.length > 8) {
    alert('Le mot doit faire entre 3 et 8 lettres !');
    return;
  }
  
  // On assigne le mot à l'autre joueur
  secretWords.value[alternateUser.value] = word;
  saveSecretWordsToStorage();
  inputSecret.value = '';
  alert(`🤫 Mot secret bien enregistré ! Il est prêt pour ${alternateUser.value === 'thomas' ? 'Thomas' : 'Zoé'}.`);
};

// Valider une tentative
const submitGuess = () => {
  const guess = currentGuess.value.trim().toUpperCase();
  
  if (guess.length !== wordToFind.value.length) {
    alert(`Le mot doit faire exactement ${wordToFind.value.length} lettres !`);
    return;
  }

  const analysis = [];
  const targetWordArray = wordToFind.value.split('');
  const guessArray = guess.split('');

  // 1er passage : Lettres bien placées
  guessArray.forEach((letter, i) => {
    if (letter === targetWordArray[i]) {
      analysis.push({ letter, status: 'correct' });
      targetWordArray[i] = null;
      guessArray[i] = null;
    } else {
      analysis.push({ letter, status: 'absent' });
    }
  });

  // 2e passage : Lettres mal placées
  guessArray.forEach((letter, i) => {
    if (letter !== null) {
      const targetIndex = targetWordArray.indexOf(letter);
      if (targetIndex !== -1) {
        analysis[i].status = 'present';
        targetWordArray[targetIndex] = null;
      }
    }
  });

  guesses.value.push(analysis);
  currentGuess.value = '';

  if (guess === wordToFind.value) {
    gameWon.value = true;
  } else if (guesses.value.length >= maxAttempts) {
    gameGameOver.value = true;
  }
};

// Supprime ton mot actuel pour en demander un nouveau
const resetGame = (clearWord = false) => {
  guesses.value = [];
  gameWon.value = false;
  gameGameOver.value = false;
  if (clearWord) {
    secretWords.value[currentUser.value] = '';
    saveSecretWordsToStorage();
  }
};

onMounted(() => {
  initGameStorage();
});
</script>

<template>
  <div class="game-wrapper">
    
    <div class="setup-zone">
      <h3>🔑 Choisir un mot pour {{ alternateUser === 'thomas' ? 'Thomas' : 'Zoé' }}</h3>
      <div class="form-group row">
        <input 
          v-model="inputSecret" 
          type="password" 
          placeholder="Entrer le mot secret..." 
          maxlength="8"
          class="game-input"
          @keydown.enter="saveSecretWord"
        />
        <button @click="saveSecretWord" class="game-btn">Enregistrer</button>
      </div>
      <p class="hint">Entre 3 et 8 lettres. Ton partenaire devra le deviner de son côté !</p>
    </div>

    <hr class="separator" />

    <div class="play-zone">
      <h3>🧩 Devine le mot choisi par {{ alternateUser === 'thomas' ? 'Thomas' : 'Zoé' }}</h3>

      <div v-if="!wordToFind" class="no-word-message">
        <p>🌱 Aucun mot secret ne t'attend pour l'instant... Demande à ton partenaire d'en créer un !</p>
      </div>

      <div v-else class="board-wrapper">
        <div class="grid-board">
          <div v-for="(row, rIdx) in guesses" :key="rIdx" class="grid-row">
            <span 
              v-for="(cell, cIdx) in row" 
              :key="cIdx" 
              class="grid-cell" 
              :class="cell.status"
            >
              {{ cell.letter }}
            </span>
          </div>
        </div>

        <div v-if="gameWon" class="end-msg win">
          🎉 Bravo ! Tu as trouvé le mot ! ❤️
          <button @click="resetGame(true)" class="reset-btn">Nouveau mot</button>
        </div>
        
        <div v-else-if="gameGameOver" class="end-msg loss">
          😢 Dommage ! Le mot était : <strong>{{ wordToFind }}</strong>
          <button @click="resetGame(false)" class="reset-btn">Réessayer</button>
        </div>

        <div v-else class="game-input-zone">
          <input 
            v-model="currentGuess" 
            type="text" 
            :maxlength="wordToFind.length" 
            :placeholder="`${wordToFind.length} lettres...`"
            @keydown.enter="submitGuess"
          />
          <button @click="submitGuess">➔</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.game-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
  color: #5c4d42;
  gap: 10px;
}
h3 { margin: 0 0 0.5rem 0; font-size: 0.95rem; font-family: 'Georgia', serif; color: #5c4d42; font-weight: bold; }
p { margin: 0 0 0.5rem 0; font-size: 0.8rem; color: #8c7e74; }

.separator {
  border: 0;
  border-top: 1px solid #f1eeeb;
  margin: 5px 0;
}

/* ZONE DE SÉLECTION / CRÉATION */
.setup-zone { padding: 2px 0; }
.form-group.row { display: flex; gap: 8px; align-items: center; }
.game-input {
  border: 1px solid #e3ded7;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 0.85rem;
  background: #fffdfa;
  color: #5c4d42;
  outline: none;
  flex: 1;
}
.game-btn {
  background: #d47a6a; color: white; border: none; border-radius: 20px;
  padding: 6px 15px; font-weight: bold; cursor: pointer; font-size: 0.8rem;
  height: 33px;
}
.hint { font-size: 0.72rem; font-style: italic; color: #bdafa4; margin-top: 4px; }

/* ZONE DE JEU ACTIVÉE */
.play-zone { display: flex; flex-direction: column; flex: 1; justify-content: space-between; }
.no-word-message {
  text-align: center;
  padding: 20px 10px;
  background: #fffdfa;
  border: 1px dashed #e3ded7;
  border-radius: 12px;
  margin-top: 5px;
}
.no-word-message p { font-style: italic; color: #bdafa4; }

.board-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

.grid-board { display: flex; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto; margin: 8px 0; padding-right: 4px; }
.grid-row { display: flex; gap: 4px; justify-content: center; }
.grid-cell {
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  border-radius: 6px; font-weight: bold; font-size: 1rem; text-transform: uppercase;
  background: #fffdfa; border: 1px solid #e3ded7; color: #5c4d42;
}

/* GRILLE ET ETATS DE LETTRES */
.grid-cell.correct { background-color: #d47a6a !important; color: white; border-color: #a65244; }
.grid-cell.present { background-color: #f5d181 !important; color: white; border-color: #e2ba63; }
.grid-cell.absent { background-color: #cbd5e1; color: #475569; border-color: #cbd5e1; }

/* ZONE COMPOSER / INPUT JEU */
.game-input-zone, .end-msg { display: flex; gap: 6px; border-top: 1px solid #f1eeeb; padding-top: 8px; position: relative; z-index: 10; }
.game-input-zone input {
  flex: 1; border: 1px solid #e3ded7; border-radius: 20px; padding: 6px 14px;
  font-size: 0.85rem; background: #fffdfa; color: #5c4d42; outline: none; text-transform: uppercase;
}
.game-input-zone button {
  background: #d47a6a; color: white; border: none; border-radius: 50%;
  width: 32px; height: 32px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center;
}
.end-msg { flex-direction: column; align-items: center; gap: 4px; font-size: 0.85rem; font-weight: bold; text-align: center; }
.end-msg.win { color: #d47a6a; }
.reset-btn { background: #5c4d42; color: white; border: none; padding: 5px 12px; border-radius: 12px; font-size: 0.75rem; cursor: pointer; margin-top: 2px; }
</style>