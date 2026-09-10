// Gallery module for filtering, card rendering, modal blueprints & mini simulator

window.GalleryModule = {
  activeCategory: 'All',
  activeAge: 'All',
  searchQuery: '',
  sortBy: 'featured',

  init() {
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    // Category pill filters
    document.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.activeCategory = e.target.dataset.category || 'All';
        this.render();
      });
    });

    // Age filter dropdown
    const ageSelect = document.getElementById('filterAge');
    if (ageSelect) {
      ageSelect.addEventListener('change', (e) => {
        this.activeAge = e.target.value;
        this.render();
      });
    }

    // Sort dropdown
    const sortSelect = document.getElementById('filterSort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.render();
      });
    }

    // Search bar input
    const searchInput = document.getElementById('searchIdeas');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    // Modal Close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        window.closeModal();
      });
    });
  },

  getFilteredIdeas() {
    let ideas = window.getAppState().ideas || [];

    // Filter by Category
    if (this.activeCategory !== 'All') {
      ideas = ideas.filter(item => item.category === this.activeCategory);
    }

    // Filter by Age
    if (this.activeAge !== 'All') {
      ideas = ideas.filter(item => item.ageGroup === this.activeAge);
    }

    // Search filter
    if (this.searchQuery) {
      ideas = ideas.filter(item => 
        item.title.toLowerCase().includes(this.searchQuery) ||
        item.culture.toLowerCase().includes(this.searchQuery) ||
        item.summary.toLowerCase().includes(this.searchQuery) ||
        item.author.toLowerCase().includes(this.searchQuery)
      );
    }

    // Sorting
    if (this.sortBy === 'featured') {
      ideas.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.likes - a.likes);
    } else if (this.sortBy === 'likes') {
      ideas.sort((a, b) => b.likes - a.likes);
    } else if (this.sortBy === 'newest') {
      ideas.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }

    return ideas;
  },

  render() {
    const grid = document.getElementById('ideasGrid');
    if (!grid) return;

    const ideas = this.getFilteredIdeas();
    const bookmarks = window.getAppState().userState.bookmarks || [];
    const likedIdeas = window.getAppState().userState.likedIdeas || [];

    if (ideas.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No toy concepts found</h3>
          <p>Try clearing your search query or selecting a different category filter!</p>
          <button class="btn btn-outline" onclick="window.GalleryModule.resetFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = ideas.map(idea => {
      const isBookmarked = bookmarks.includes(idea.id);
      const isLiked = likedIdeas.includes(idea.id);

      return `
        <div class="idea-card ${idea.featured ? 'featured-card' : ''}" data-id="${idea.id}">
          ${idea.featured ? '<div class="featured-badge">🌟 Featured Winner</div>' : ''}
          <div class="card-header-visual theme-${idea.colorTheme || 'gold'}">
            <div class="card-culture-tag">${idea.culture}</div>
            <div class="card-icon">${this.getIconSymbol(idea.icon)}</div>
            <div class="card-category-badge badge-${idea.category.toLowerCase()}">${idea.category}</div>
          </div>

          <div class="card-body">
            <div class="card-meta">
              <span class="meta-item">👶 Age ${idea.ageGroup}</span>
              <span class="meta-item">📜 ${idea.era || 'Historical'}</span>
            </div>

            <h3 class="card-title">${idea.title}</h3>
            <p class="card-author">By <strong>${idea.author}</strong> (${idea.school})</p>
            <p class="card-summary">${idea.summary}</p>

            <div class="card-tags">
              ${(idea.learningObjectives || []).slice(0, 2).map(obj => `<span class="tag-chip">💡 ${obj.split(' ')[0]} Focus</span>`).join('')}
            </div>
          </div>

          <div class="card-footer">
            <div class="card-stats">
              <button class="action-btn like-btn ${isLiked ? 'active' : ''}" onclick="window.GalleryModule.toggleLike('${idea.id}')">
                <span class="heart-icon">${isLiked ? '❤️' : '🤍'}</span> ${idea.likes}
              </button>
              <button class="action-btn bookmark-btn ${isBookmarked ? 'active' : ''}" onclick="window.GalleryModule.toggleBookmark('${idea.id}')">
                <span class="bookmark-icon">${isBookmarked ? '🔖' : '📑'}</span>
              </button>
            </div>
            <button class="btn btn-sm btn-primary" onclick="window.GalleryModule.openBlueprint('${idea.id}')">
              Explore Blueprint 🚀
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  resetFilters() {
    this.activeCategory = 'All';
    this.activeAge = 'All';
    this.searchQuery = '';
    document.querySelectorAll('.filter-pill').forEach(b => {
      b.classList.toggle('active', b.dataset.category === 'All');
    });
    const ageSel = document.getElementById('filterAge');
    if (ageSel) ageSel.value = 'All';
    const searchInp = document.getElementById('searchIdeas');
    if (searchInp) searchInp.value = '';
    this.render();
  },

  getIconSymbol(iconName) {
    const icons = {
      'chess-board': '♟️',
      'droplet': '💧',
      'map-pin': '🐫',
      'shapes': '📐',
      'sun': '🌞',
      'smile': '🎭',
      'grid': '🐚',
      'compass': '🏛️',
      'dice': '🎲',
      'puzzle': '🧩'
    };
    return icons[iconName] || '🎁';
  },

  toggleLike(ideaId) {
    const appState = window.getAppState();
    const likedIdeas = appState.userState.likedIdeas || [];
    const index = likedIdeas.indexOf(ideaId);

    const idea = appState.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    if (index > -1) {
      likedIdeas.splice(index, 1);
      idea.likes = Math.max(0, idea.likes - 1);
      window.showToast("Removed like", "info");
    } else {
      likedIdeas.push(ideaId);
      idea.likes += 1;
      appState.userState.points += 5;
      window.showToast("Liked! +5 Heritage Points ⭐️", "success");
      window.playAudioFx('pop');
    }

    appState.userState.likedIdeas = likedIdeas;
    window.saveAppState();
    this.render();
    window.updateHeaderStats();
  },

  toggleBookmark(ideaId) {
    const appState = window.getAppState();
    const bookmarks = appState.userState.bookmarks || [];
    const index = bookmarks.indexOf(ideaId);

    if (index > -1) {
      bookmarks.splice(index, 1);
      window.showToast("Bookmark removed", "info");
    } else {
      bookmarks.push(ideaId);
      window.showToast("Concept saved to Dashboard! 🔖", "success");
      window.playAudioFx('click');

      // Check silk road trader badge condition (5+ bookmarks)
      if (bookmarks.length >= 5) {
        window.unlockBadge('silk_road_trader');
      }
    }

    appState.userState.bookmarks = bookmarks;
    window.saveAppState();
    this.render();
    if (window.DashboardModule) window.DashboardModule.render();
  },

  openBlueprint(ideaId) {
    const idea = window.getAppState().ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const modalBody = document.getElementById('blueprintModalContent');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="blueprint-detail-header theme-${idea.colorTheme || 'gold'}">
        <div class="blueprint-tag">${idea.culture} • ${idea.era || 'Heritage'}</div>
        <h2>${idea.title}</h2>
        <p class="blueprint-author">Created by <strong>${idea.author}</strong> (${idea.school})</p>
      </div>

      <div class="blueprint-grid">
        <div class="blueprint-column">
          <div class="blueprint-section">
            <h3>📖 Historical Lore & Inspiration</h3>
            <p>${idea.summary}</p>
          </div>

          <div class="blueprint-section">
            <h3>📜 Step-by-Step Gameplay Rules</h3>
            <ol class="rules-list">
              ${(idea.rules || []).map(r => `<li>${r}</li>`).join('')}
            </ol>
          </div>

          <div class="blueprint-section">
            <h3>🎓 Educational & Skill Objectives</h3>
            <ul class="objectives-list">
              ${(idea.learningObjectives || []).map(o => `<li>✨ ${o}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="blueprint-column">
          <div class="blueprint-section card-box">
            <h3>🛠️ Materials Needed</h3>
            <div class="materials-tags">
              ${(idea.materials || []).map(m => `<span class="material-chip">📦 ${m}</span>`).join('')}
            </div>
          </div>

          <div class="blueprint-section card-box">
            <h3>🎮 Interactive Toy Simulator</h3>
            <p>Try a miniature live test of the gameplay mechanics:</p>
            <div id="toySimulatorArea" class="toy-simulator-box">
              ${this.generateSimulatorHTML(idea)}
            </div>
          </div>

          <div class="blueprint-footer-actions">
            <button class="btn btn-outline" onclick="window.GalleryModule.toggleBookmark('${idea.id}')">
              🔖 ${window.getAppState().userState.bookmarks.includes(idea.id) ? 'Bookmarked' : 'Save to Dashboard'}
            </button>
            <button class="btn btn-primary" onclick="window.GalleryModule.toggleLike('${idea.id}')">
              ❤️ Upvote (${idea.likes})
            </button>
          </div>
        </div>
      </div>
    `;

    window.openModal('blueprintModal');
    this.initSimulatorEvents(idea);
  },

  generateSimulatorHTML(idea) {
    if (idea.id === 'idea-1') {
      return `
        <div class="senet-simulator">
          <h4>Pharaoh's Fate Stick Roller</h4>
          <div class="sticks-display" id="sticksResult">🪵 🪵 🪵 🪵</div>
          <button class="btn btn-sm btn-accent" id="btnRollSticks">Throw Fate Sticks!</button>
          <div id="senetMoveMsg" class="sim-msg">Click button to roll for movement steps.</div>
        </div>
      `;
    } else if (idea.id === 'idea-2') {
      return `
        <div class="harappa-simulator">
          <h4>Drainage Tile Flow Tester</h4>
          <div class="tile-flow-grid">
            <button class="sim-tile" data-state="0">🧱 Dry Channel</button>
            <button class="sim-tile" data-state="0">🧱 Dry Channel</button>
            <button class="sim-tile" data-state="0">🧱 Dry Channel</button>
          </div>
          <div id="waterMsg" class="sim-msg">Click tiles to connect Indus water pipelines!</div>
        </div>
      `;
    } else {
      return `
        <div class="generic-simulator">
          <h4>Interactive Prototype Demo</h4>
          <div class="demo-toy-view">
            <div class="floating-toy-icon">${this.getIconSymbol(idea.icon)}</div>
            <p>Interactive testing mode for "${idea.title}"</p>
          </div>
          <button class="btn btn-sm btn-accent" id="btnTestMechanism">Test Mechanics 🎯</button>
          <div id="genericSimMsg" class="sim-msg">Click to trigger action roll.</div>
        </div>
      `;
    }
  },

  initSimulatorEvents(idea) {
    const rollBtn = document.getElementById('btnRollSticks');
    if (rollBtn) {
      rollBtn.addEventListener('click', () => {
        const outcomes = ['Light (1 Step)', 'Light (2 Steps)', 'Light (3 Steps)', 'House of Rebirth (4 Steps)', 'Fate of Ra (5 Steps)'];
        const rolled = outcomes[Math.floor(Math.random() * outcomes.length)];
        document.getElementById('sticksResult').innerText = '🎲 ' + rolled;
        document.getElementById('senetMoveMsg').innerText = `Your Scarab token advances: ${rolled}!`;
        window.playAudioFx('dice');
      });
    }

    const simTiles = document.querySelectorAll('.sim-tile');
    if (simTiles.length) {
      simTiles.forEach(tile => {
        tile.addEventListener('click', () => {
          tile.classList.toggle('connected');
          tile.innerText = tile.classList.contains('connected') ? '💧 Water Flowing!' : '🧱 Dry Channel';
          const connectedCount = document.querySelectorAll('.sim-tile.connected').length;
          document.getElementById('waterMsg').innerText = connectedCount === 3 ? '🎉 Irrigation System Complete! Citadel Saved!' : `Connected ${connectedCount}/3 channels.`;
          window.playAudioFx('pop');
        });
      });
    }

    const testBtn = document.getElementById('btnTestMechanism');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        const msgs = ['Dice landed on 6! Bonus turn!', 'Card drawn: Heritage Lore unlocked!', 'Strategy score: +50 points!'];
        const chosen = msgs[Math.floor(Math.random() * msgs.length)];
        document.getElementById('genericSimMsg').innerText = chosen;
        window.playAudioFx('click');
      });
    }
  }
};
