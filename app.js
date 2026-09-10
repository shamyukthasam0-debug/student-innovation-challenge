// Main Application Controller & Global Audio Synth

(function() {
  // Global State Initialization
  const STORAGE_KEY = 'STUDENT_INNOVATION_APP_STATE_V1';

  function loadAppState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Merge initial fallback data for ideas & quiz if needed
        return parsed;
      } catch (e) {
        console.error("Error parsing stored app state", e);
      }
    }

    // Default initial state
    return {
      ideas: window.AppInitialData.ideas,
      userState: {
        studentName: "Alex Innovator",
        schoolName: "Global Heritage Academy",
        points: 450,
        likedIdeas: ["idea-1", "idea-3"],
        bookmarks: ["idea-2"],
        mySubmissions: [],
        badges: window.AppInitialData.badges
      }
    };
  }

  let appState = loadAppState();

  window.getAppState = function() {
    return appState;
  };

  window.saveAppState = function() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  };

  // Toast notification helper
  window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">${message}</div>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // Unlock badge helper
  window.unlockBadge = function(badgeId) {
    const badge = appState.userState.badges.find(b => b.id === badgeId);
    if (badge && !badge.unlocked) {
      badge.unlocked = true;
      appState.userState.points += 150;
      window.saveAppState();
      window.showToast(`🏆 Badge Unlocked: "${badge.name}"! +150 Pts`, 'success');
      window.playAudioFx('badge');
      if (window.DashboardModule) window.DashboardModule.render();
      window.updateHeaderStats();
    }
  };

  // Update Header Stats
  window.updateHeaderStats = function() {
    const ptsTicker = document.getElementById('headerPointsCount');
    if (ptsTicker) {
      ptsTicker.innerText = appState.userState.points;
    }
  };

  // Modal helpers
  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = function() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
  };

  // Web Audio Synth for interactive sound feedback
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  window.playAudioFx = function(type) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'pop') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'quiz-correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'quiz-wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'dice') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(250, now + 0.04);
        osc.frequency.setValueAtTime(600, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'fanfare' || type === 'badge') {
        // Play quick fanfare triad
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + i * 0.1);
          g.connect(ctx.destination);
          o.connect(g);
          g.gain.setValueAtTime(0.2, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.25);
          o.start(now + i * 0.1);
          o.stop(now + i * 0.1 + 0.25);
        });
      }
    } catch (e) {
      // Ignore audio context errors silently
    }
  };

  // Tab Switching Logic
  window.switchTab = function(tabName) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.tab === tabName);
    });

    document.querySelectorAll('.app-page').forEach(page => {
      page.classList.toggle('active', page.id === `page-${tabName}`);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh specific section views on navigation
    if (tabName === 'explore' && window.GalleryModule) window.GalleryModule.render();
    if (tabName === 'leaderboard' && window.LeaderboardModule) window.LeaderboardModule.render();
    if (tabName === 'dashboard' && window.DashboardModule) window.DashboardModule.render();
    if (tabName === 'quests' && window.MiniGamesModule) {
      window.MiniGamesModule.renderQuizQuestion();
      window.MiniGamesModule.renderArtifactGame();
    }

    window.playAudioFx('click');
  };

  // Initialize Application on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    // Navigation link clicks
    document.querySelectorAll('.nav-link, [data-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.dataset.tab;
        if (targetTab) {
          window.switchTab(targetTab);
        }
      });
    });

    // Mobile nav toggle
    const mobileBtn = document.getElementById('mobileNavToggle');
    const mainNav = document.getElementById('mainNavLinks');
    if (mobileBtn && mainNav) {
      mobileBtn.addEventListener('click', () => {
        mainNav.classList.toggle('mobile-open');
      });
    }

    // Modal click backdrop close
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          window.closeModal();
        }
      });
    });

    // ESC key close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.closeModal();
      }
    });

    // Sub-modules initialization
    if (window.initHeroCanvas) window.initHeroCanvas();
    if (window.GalleryModule) window.GalleryModule.init();
    if (window.FormWizardModule) window.FormWizardModule.init();
    if (window.MiniGamesModule) window.MiniGamesModule.init();
    if (window.LeaderboardModule) window.LeaderboardModule.init();
    if (window.DashboardModule) window.DashboardModule.init();

    window.updateHeaderStats();
  });
})();
