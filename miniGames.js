// Mini-Games & Cultural Heritage Quest Module

window.MiniGamesModule = {
  currentQuizIndex: 0,
  quizScore: 0,
  quizAnswered: false,

  // Mini Game Artifact Tile Board State
  artifactGrid: [
    { id: 1, symbol: '🏺', name: 'Terracotta Pot', targetPos: 0, currentPos: 2 },
    { id: 2, symbol: '🐚', name: 'Cowrie Shell', targetPos: 1, currentPos: 0 },
    { id: 3, symbol: '🌞', name: 'Sun Cipher', targetPos: 2, currentPos: 3 },
    { id: 4, symbol: '📜', name: 'Papyrus Scroll', targetPos: 3, currentPos: 1 }
  ],

  init() {
    this.bindQuizEvents();
    this.bindArtifactGameEvents();
    this.renderQuizQuestion();
    this.renderArtifactGame();
  },

  bindQuizEvents() {
    const nextBtn = document.getElementById('btnNextQuizQuestion');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentQuizIndex++;
        if (this.currentQuizIndex >= window.AppInitialData.quizQuestions.length) {
          this.finishQuiz();
        } else {
          this.renderQuizQuestion();
        }
      });
    }

    const restartBtn = document.getElementById('btnRestartQuiz');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.currentQuizIndex = 0;
        this.quizScore = 0;
        this.renderQuizQuestion();
      });
    }
  },

  renderQuizQuestion() {
    const questions = window.AppInitialData.quizQuestions;
    const container = document.getElementById('quizContainer');
    if (!container) return;

    if (this.currentQuizIndex >= questions.length) {
      this.finishQuiz();
      return;
    }

    this.quizAnswered = false;
    const q = questions[this.currentQuizIndex];

    container.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-header">
          <span class="quiz-progress-badge">Question ${this.currentQuizIndex + 1} of ${questions.length}</span>
          <span class="quiz-score-badge">Current Score: ${this.quizScore} Pts</span>
        </div>

        <h3 class="quiz-question">${q.question}</h3>

        <div class="quiz-options">
          ${q.options.map((opt, idx) => `
            <button class="quiz-option-btn" data-index="${idx}" onclick="window.MiniGamesModule.selectQuizAnswer(${idx})">
              <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
              <span class="option-text">${opt}</span>
            </button>
          `).join('')}
        </div>

        <div id="quizLoreBox" class="quiz-lore-box hidden">
          <div class="lore-title">💡 Cultural Heritage Lore:</div>
          <div class="lore-text">${q.lore}</div>
        </div>

        <div class="quiz-footer">
          <button id="btnNextQuizQuestion" class="btn btn-primary hidden">
            ${this.currentQuizIndex + 1 === questions.length ? 'See Final Score 🏆' : 'Next Question ➡️'}
          </button>
        </div>
      </div>
    `;

    // Re-bind next button inside dynamically rendered card
    const nextBtn = container.querySelector('#btnNextQuizQuestion');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentQuizIndex++;
        this.renderQuizQuestion();
      });
    }
  },

  selectQuizAnswer(selectedIndex) {
    if (this.quizAnswered) return;
    this.quizAnswered = true;

    const q = window.AppInitialData.quizQuestions[this.currentQuizIndex];
    const optionBtns = document.querySelectorAll('.quiz-option-btn');

    optionBtns.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correctIndex) {
        btn.classList.add('correct');
      }
      if (idx === selectedIndex && selectedIndex !== q.correctIndex) {
        btn.classList.add('incorrect');
      }
    });

    const loreBox = document.getElementById('quizLoreBox');
    if (loreBox) loreBox.classList.remove('hidden');

    const nextBtn = document.getElementById('btnNextQuizQuestion');
    if (nextBtn) nextBtn.classList.remove('hidden');

    if (selectedIndex === q.correctIndex) {
      this.quizScore += 25;
      window.playAudioFx('quiz-correct');
      window.showToast("Correct Answer! +25 Heritage Pts ⭐️", "success");
    } else {
      window.playAudioFx('quiz-wrong');
      window.showToast("Not quite right, check out the historical lore!", "info");
    }
  },

  finishQuiz() {
    const container = document.getElementById('quizContainer');
    if (!container) return;

    const maxScore = window.AppInitialData.quizQuestions.length * 25;
    const percentage = Math.round((this.quizScore / maxScore) * 100);

    // Award points to app state
    const appState = window.getAppState();
    appState.userState.points += this.quizScore;

    // Check if 100% scored for quiz master badge
    if (percentage === 100) {
      window.unlockBadge('quiz_master');
    }

    window.saveAppState();
    window.updateHeaderStats();

    container.innerHTML = `
      <div class="quiz-card quiz-results">
        <div class="quiz-trophy">🏆</div>
        <h2>Cultural Quest Completed!</h2>
        <p class="quiz-final-score">Your Score: <strong>${this.quizScore} / ${maxScore} Pts</strong> (${percentage}%)</p>

        <p>${percentage >= 80 ? '🌟 Outstanding work! You are a true Cultural Heritage Champion!' : 'Great effort! Review the historical lore and try again to boost your score!'}</p>

        <div class="results-actions">
          <button class="btn btn-outline" id="btnRestartQuiz" onclick="window.MiniGamesModule.restartQuiz()">Retake Quiz 🔄</button>
          <button class="btn btn-primary" onclick="window.switchTab('explore')">Explore Toy Blueprints 🚀</button>
        </div>
      </div>
    `;
  },

  restartQuiz() {
    this.currentQuizIndex = 0;
    this.quizScore = 0;
    this.renderQuizQuestion();
  },

  // ----------------------------------------------------
  // Mini Game: Ancient Artifact & Game Board Builder
  // ----------------------------------------------------
  bindArtifactGameEvents() {
    const resetBtn = document.getElementById('btnResetArtifactGame');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetArtifactGame();
      });
    }
  },

  renderArtifactGame() {
    const gridEl = document.getElementById('artifactGameGrid');
    if (!gridEl) return;

    // Sort items by current position
    const sorted = [...this.artifactGrid].sort((a, b) => a.currentPos - b.currentPos);

    gridEl.innerHTML = sorted.map((tile, index) => {
      const isCorrect = tile.currentPos === tile.targetPos;
      return `
        <div class="artifact-tile ${isCorrect ? 'matched' : ''}" data-id="${tile.id}" onclick="window.MiniGamesModule.swapArtifactTile(${index})">
          <div class="tile-icon">${tile.symbol}</div>
          <div class="tile-label">${tile.name}</div>
          <div class="tile-status">${isCorrect ? '✅ Placed' : '🔄 Click to Swap'}</div>
        </div>
      `;
    }).join('');

    this.checkArtifactGameVictory();
  },

  swapArtifactTile(clickedIndex) {
    // Swap tile with adjacent tile (cycling position)
    const nextIndex = (clickedIndex + 1) % this.artifactGrid.length;
    const sorted = [...this.artifactGrid].sort((a, b) => a.currentPos - b.currentPos);

    const temp = sorted[clickedIndex].currentPos;
    sorted[clickedIndex].currentPos = sorted[nextIndex].currentPos;
    sorted[nextIndex].currentPos = temp;

    window.playAudioFx('pop');
    this.renderArtifactGame();
  },

  resetArtifactGame() {
    this.artifactGrid = [
      { id: 1, symbol: '🏺', name: 'Terracotta Pot', targetPos: 0, currentPos: 2 },
      { id: 2, symbol: '🐚', name: 'Cowrie Shell', targetPos: 1, currentPos: 0 },
      { id: 3, symbol: '🌞', name: 'Sun Cipher', targetPos: 2, currentPos: 3 },
      { id: 4, symbol: '📜', name: 'Papyrus Scroll', targetPos: 3, currentPos: 1 }
    ];
    this.renderArtifactGame();
    window.showToast("Artifact Board reset!", "info");
  },

  checkArtifactGameVictory() {
    const isWin = this.artifactGrid.every(tile => tile.currentPos === tile.targetPos);
    const winMsg = document.getElementById('artifactWinMessage');
    if (!winMsg) return;

    if (isWin) {
      winMsg.classList.remove('hidden');
      window.unlockBadge('artifact_builder');
      window.getAppState().userState.points += 50;
      window.saveAppState();
      window.updateHeaderStats();
    } else {
      winMsg.classList.add('hidden');
    }
  }
};
