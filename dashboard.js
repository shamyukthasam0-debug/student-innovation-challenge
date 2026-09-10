// Student Dashboard Module & Certificate Generator

window.DashboardModule = {
  init() {
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    const editBtn = document.getElementById('btnEditProfile');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.openEditProfileModal();
      });
    }

    const certBtn = document.getElementById('btnViewCertificate');
    if (certBtn) {
      certBtn.addEventListener('click', () => {
        this.openCertificateModal();
      });
    }

    const printBtn = document.getElementById('btnPrintCert');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  },

  render() {
    const appState = window.getAppState();
    const userState = appState.userState;

    // Student Header Stats
    const nameEl = document.getElementById('dashStudentName');
    if (nameEl) nameEl.innerText = userState.studentName || 'Alex Innovator';

    const schoolEl = document.getElementById('dashStudentSchool');
    if (schoolEl) schoolEl.innerText = userState.schoolName || 'Global Heritage School';

    const pointsEl = document.getElementById('dashPointsCount');
    if (pointsEl) pointsEl.innerText = userState.points || 450;

    const rankEl = document.getElementById('dashRankTitle');
    if (rankEl) {
      const p = userState.points || 0;
      const rankTitle = p > 1000 ? '👑 Master Heritage Innovator' : p > 500 ? '🌟 Senior Craft Architect' : '🚀 Pioneer Innovator';
      rankEl.innerText = rankTitle;
    }

    // Render Badges Gallery
    const badgesGrid = document.getElementById('dashBadgesGrid');
    if (badgesGrid) {
      const allBadges = appState.userState.badges || window.AppInitialData.badges;
      badgesGrid.innerHTML = allBadges.map(badge => `
        <div class="badge-item ${badge.unlocked ? 'unlocked' : 'locked'}">
          <div class="badge-icon-box theme-${badge.color || 'gold'}">
            ${this.getBadgeSymbol(badge.icon)}
          </div>
          <div class="badge-name">${badge.name}</div>
          <div class="badge-desc">${badge.description}</div>
          <div class="badge-status-tag">${badge.unlocked ? '✅ Unlocked' : '🔒 Locked'}</div>
        </div>
      `).join('');
    }

    // Render My Submissions
    const submissionsList = document.getElementById('dashSubmissionsList');
    if (submissionsList) {
      const subs = userState.mySubmissions || [];
      if (subs.length === 0) {
        submissionsList.innerHTML = `
          <div class="empty-state">
            <p>You haven't submitted any toy concepts yet!</p>
            <button class="btn btn-primary" onclick="window.switchTab('submit')">Submit Toy Idea 🚀</button>
          </div>
        `;
      } else {
        submissionsList.innerHTML = subs.map(sub => `
          <div class="sub-item-card">
            <div class="sub-item-header">
              <span class="card-category-badge badge-${sub.category.toLowerCase()}">${sub.category}</span>
              <span class="sub-date">Submitted on ${sub.dateAdded}</span>
            </div>
            <h4>${sub.title}</h4>
            <p class="sub-culture-line">Culture Inspiration: <strong>${sub.culture}</strong></p>
            <div class="sub-stats-row">
              <span>❤️ ${sub.likes} Upvotes</span>
              <span>👁️ ${sub.views || 12} Views</span>
              <span class="sub-status-verified">Verified Concept</span>
            </div>
            <div class="sub-item-actions">
              <button class="btn btn-sm btn-outline" onclick="window.GalleryModule.openBlueprint('${sub.id}')">View Blueprint 📜</button>
              <button class="btn btn-sm btn-danger" onclick="window.DashboardModule.deleteSubmission('${sub.id}')">Delete 🗑️</button>
            </div>
          </div>
        `).join('');
      }
    }

    // Render Bookmarks
    const bookmarksGrid = document.getElementById('dashBookmarksGrid');
    if (bookmarksGrid) {
      const bookmarkedIds = userState.bookmarks || [];
      const savedIdeas = appState.ideas.filter(i => bookmarkedIds.includes(i.id));

      if (savedIdeas.length === 0) {
        bookmarksGrid.innerHTML = `<p class="empty-text">No saved concepts yet. Browse the Explore Gallery to bookmark your favorites!</p>`;
      } else {
        bookmarksGrid.innerHTML = savedIdeas.map(idea => `
          <div class="saved-bookmark-chip" onclick="window.GalleryModule.openBlueprint('${idea.id}')">
            <span>${idea.title}</span>
            <small>(${idea.culture})</small>
            <button class="btn-remove-bm" onclick="event.stopPropagation(); window.GalleryModule.toggleBookmark('${idea.id}')">✕</button>
          </div>
        `).join('');
      }
    }
  },

  getBadgeSymbol(iconName) {
    const map = {
      'rocket': '🚀',
      'castle': '🏰',
      'award': '🏆',
      'hammer': '🔨',
      'globe': '🌍',
      'heart': '❤️'
    };
    return map[iconName] || '🌟';
  },

  deleteSubmission(ideaId) {
    if (!confirm("Are you sure you want to delete this submission?")) return;

    const appState = window.getAppState();
    appState.userState.mySubmissions = appState.userState.mySubmissions.filter(i => i.id !== ideaId);
    appState.ideas = appState.ideas.filter(i => i.id !== ideaId);

    window.saveAppState();
    this.render();
    if (window.GalleryModule) window.GalleryModule.render();
    if (window.LeaderboardModule) window.LeaderboardModule.render();
    window.showToast("Submission deleted", "info");
  },

  openEditProfileModal() {
    const userState = window.getAppState().userState;
    const nameInput = document.getElementById('editStudentName');
    const schoolInput = document.getElementById('editSchoolName');

    if (nameInput) nameInput.value = userState.studentName || 'Alex Innovator';
    if (schoolInput) schoolInput.value = userState.schoolName || 'Global Heritage School';

    window.openModal('editProfileModal');

    const saveBtn = document.getElementById('btnSaveProfile');
    if (saveBtn) {
      saveBtn.onclick = () => {
        userState.studentName = nameInput.value.trim() || 'Alex Innovator';
        userState.schoolName = schoolInput.value.trim() || 'Global Heritage School';
        window.saveAppState();
        window.closeModal();
        this.render();
        window.updateHeaderStats();
        window.showToast("Profile updated successfully! ✨", "success");
      };
    }
  },

  openCertificateModal() {
    const userState = window.getAppState().userState;
    const certName = document.getElementById('certStudentName');
    const certSchool = document.getElementById('certSchoolName');
    const certDate = document.getElementById('certIssueDate');
    const certProject = document.getElementById('certProjectTitle');

    const mySubs = userState.mySubmissions || [];
    const topProject = mySubs.length > 0 ? mySubs[0].title : 'Cultural Heritage Toy Innovation';

    if (certName) certName.innerText = userState.studentName || 'Alex Innovator';
    if (certSchool) certSchool.innerText = userState.schoolName || 'Global Heritage School';
    if (certDate) certDate.innerText = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (certProject) certProject.innerText = `For Designing: "${topProject}"`;

    window.openModal('certificateModal');
  }
};
