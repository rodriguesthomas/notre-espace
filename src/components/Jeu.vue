<script setup>
import { ref, computed } from 'vue';

// Qui joue actuellement ? (À lier plus tard avec ton système de login)
const currentUser = ref('Julien'); 

// Les mots secrets définis l'un pour l'autre
const secretWords = ref({
  Julien: '', // Le mot que ELLE a préparé pour Julien
  Elle: ''    // Le mot que JULIEN a préparé pour Elle
});

// Variables pour la préparation du mot
const inputSecret = ref('');
const playerTarget = ref('Elle'); // Julien choisit pour qui il écrit

// Variables pour la partie en cours
const currentGuess = ref('');
const guesses = ref([]); // Historique des essais
const maxAttempts = 6;
const gameWon = ref(false);
const gameGameOver = ref(false);

// Le mot que le joueur actuel doit deviner
const wordToFind = computed(() => {
  return secretWords.value[currentUser.value].toUpperCase();
});

// Définir le mot pour son partenaire
const saveSecretWord = () => {
  const word = inputSecret.value.trim().toUpperCase();
  if (word.length < 3 || word.length > 8) {
    alert('Le mot doit faire entre 3 et 8 lettres !');
    return;
  }
  secretWords.value[playerTarget.value] = word;
  inputSecret.value = '';
  alert(`Mot secret enregistré pour ${playerTarget.value} ! 🤫`);
};

// Valider un essai
const submitGuess = () => {
  const guess = currentGuess.value.trim().toUpperCase();
  
  if (guess.length !== wordToFind.value.length) {
    alert(`Le mot doit faire exactement ${wordToFind.value.length} lettres !`);
    return;
  }

  // Analyse des lettres (Bien placé / Mal placé)
  const analysis = [];
  const targetWordArray = wordToFind.value.split('');
  const guessArray = guess.split('');

  // Premier passage : détecter les lettres bien placées
  guessArray.forEach((letter, i) => {
    if (letter === targetWordArray[i]) {
      analysis.push({ letter, status: 'correct' }); // Bien placé (Rouge)
      targetWordArray[i] = null; // Consommé
      guessArray[i] = null;
    } else {
      analysis.push({ letter, status: 'absent' }); // Par défaut absent, on vérifie après
    }
  });

  // Deuxième passage : détecter les lettres mal placées
  guessArray.forEach((letter, i) => {
    if (letter !== null) {
      const targetIndex = targetWordArray.indexOf(letter);
      if (targetIndex !== -1) {
        analysis[i].status = 'present'; // Mal placé (Jaune)
        targetWordArray[targetIndex] = null; // Consommé
      }
    }
  });

  guesses.value.push(analysis);
  currentGuess.value = '';

  // Vérifier la victoire ou défaite
  if (guess === wordToFind.value) {
    gameWon.value = true;
  } else if (guesses.value.length >= maxAttempts) {
    gameGameOver.value = true;
  }
};

// Recommencer
const resetGame = () => {
  guesses.value = [];
  gameWon.value = false;
  gameGameOver.value = false;
};
</script>

<template>
  <div class="game-container">
    
    <div v-if="!wordToFind" class="setup-zone">
      <h3>🔑 Préparer un mot secret</h3>
      <p>Tu es connecté en tant que <strong>{{ currentUser }}</strong>.</p>
      
      <div class="form-group">
        <label>Créer un mot pour :</label>
        <select v-model="playerTarget" class="game-select">
          <option value="Elle">Elle</option>
          <option value="Julien">Julien</option>
        </select>
      </div>

      <div class="form-group row">
        <input 
          v-model="inputSecret" 
          type="password" 
          placeholder="Le mot secret..." 
          maxlength="8"
          class="game-input"
        />
        <button @click="saveSecretWord" class="game-btn">Enregistrer</button>
      </div>
      <p class="hint">Entre 3 et 8 lettres. L'autre devra le deviner !</p>
      
      <div class="toggle-user">
        <button @click="currentUser = currentUser === 'Julien' ? 'Elle' : 'Julien'" class="sub-btn">
          🔄 Simuler la connexion de : {{ currentUser === 'Julien' ? 'Elle' : 'Julien' }}
        </button>
      </div>
    </div>

    <div v-else class="play-zone">
      <div class="game-header">
        <h3>🧩 Mot de passe ({{ wordToFind.length }} lettres)</h3>
        <span class="player-badge">Joueur : {{ currentUser }}</span>
      </div>

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
        <button @click="secretWords[currentUser] = ''; resetGame()" class="reset-btn">Nouveau mot</button>
      </div>
      <div v-else-if="gameGameOver" class="end-msg loss">
        😢 Dommage ! Le mot était : <strong>{{ wordToFind }}</strong>
        <button @click="resetGame()" class="reset-btn">Réessayer</button>
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
</template>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  color: #5c4d42;
}
h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; font-family: 'Georgia', serif; }
p { margin: 0 0 1rem 0; font-size: 0.85rem; color: #8c7e74; }

/* CONFIGURATION DU MOT */
.setup-zone { padding: 5px 0; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.form-group.row { flex-direction: row; gap: 6px; }
.game-select, .game-input {
  border: 1px solid #e3ded7;
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 0.85rem;
  background: #fffdfa;
  color: #5c4d42;
  outline: none;
}
.game-input { flex: 1; }
.game-btn {
  background: #d47a6a; color: white; border: none; border-radius: 20px;
  padding: 0 15px; font-weight: bold; cursor: pointer; font-size: 0.85rem;
}
.hint { font-size: 0.75rem; font-style: italic; color: #bdafa4; margin-top: -6px; }
.toggle-user { margin-top: 25px; border-top: 1px dashed #e3ded7; padding-top: 15px; text-align: center; }
.sub-btn { background: #cbd5e1; border: none; padding: 6px 12px; border-radius: 12px; font-size: 0.75rem; cursor: pointer; color: #475569; }

/* ZONE DE JEU (PLATEAU) */
.play-zone { display: flex; flex-direction: column; height: 100%; justify-content: space-between; }
.game-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1eeeb; padding-bottom: 4px; }
.player-badge { font-size: 0.75rem; background: #f1eeeb; padding: 2px 8px; border-radius: 10px; font-weight: bold; }

.grid-board { display: flex; flex-direction: column; gap: 6px; flex: 1; overflow-y: auto; margin: 10px 0; padding-right: 4px; }
.grid-row { display: flex; gap: 6px; justify-content: center; }
.grid-cell {
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  border-radius: 6px; font-weight: bold; font-size: 1.1rem; text-transform: uppercase;
  background: #fffdfa; border: 1px solid #e3ded7; color: #5c4d42;
}

/* CODE COULEUR */
.grid-cell.correct { background-color: #d47a6a !important; color: white; border-color: #a65244; } /* Rouge/Terracotta = Bien placé */
.grid-cell.present { background-color: #f5d181 !important; color: white; border-color: #e2ba63; } /* Jaune = Mal placé */
.grid-cell.absent { background-color: #cbd5e1; color: #94a3b8; border-color: #cbd5e1; }          /* Gris = Absent */

/* ZONE D'ÉCRITURE */
.game-input-zone, .end-msg { display: flex; gap: 6px; border-top: 1px solid #f1eeeb; padding-top: 8px; position: relative; z-index: 999; }
.game-input-zone input {
  flex: 1; border: 1px solid #e3ded7; border-radius: 20px; padding: 8px 14px;
  font-size: 0.9rem; background: #fffdfa; color: #5c4d42; outline: none; text-transform: uppercase;
}
.game-input-zone button {
  background: #d47a6a; color: white; border: none; border-radius: 50%;
  width: 32px; height: 32px; cursor: pointer; font-weight: bold;
}
.end-msg { flex-direction: column; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: bold; text-align: center; }
.end-msg.win { color: #d47a6a; }
.reset-btn { background: #5c4d42; color: white; border: none; padding: 6px 14px; border-radius: 12px; font-size: 0.8rem; cursor: pointer; margin-top: 4px; }
</style>