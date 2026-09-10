// Submission Wizard & Real-time Live Blueprint Card Preview

window.FormWizardModule = {
  currentStep: 1,

  init() {
    this.bindEvents();
    this.updatePreviewCard();
  },

  bindEvents() {
    const wizardForm = document.getElementById('innovationForm');
    if (!wizardForm) return;

    // Step Next / Prev navigation buttons
    document.querySelectorAll('.btn-next-step').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.validateStep(this.currentStep)) {
          this.goToStep(this.currentStep + 1);
        }
      });
    });

    document.querySelectorAll('.btn-prev-step').forEach(btn => {
      btn.addEventListener('click', () => {
        this.goToStep(this.currentStep - 1);
      });
    });

    // Real-time input listeners to update preview card
    const inputs = wizardForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => this.updatePreviewCard());
      input.addEventListener('change', () => this.updatePreviewCard());
    });

    // Custom Icon selection
    document.querySelectorAll('.icon-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
        const target = e.currentTarget;
        target.classList.add('selected');
        const hiddenIcon = document.getElementById('selectedToyIcon');
        if (hiddenIcon) hiddenIcon.value = target.dataset.icon;
        this.updatePreviewCard();
      });
    });

    // Color theme picker
    document.querySelectorAll('.theme-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('selected'));
        const target = e.currentTarget;
        target.classList.add('selected');
        const hiddenTheme = document.getElementById('selectedColorTheme');
        if (hiddenTheme) hiddenTheme.value = target.dataset.theme;
        this.updatePreviewCard();
      });
    });

    // Form submit event
    wizardForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitInnovation();
    });
  },

  validateStep(step) {
    if (step === 1) {
      const name = document.getElementById('toyName').value.trim();
      const author = document.getElementById('authorName').value.trim();
      const culture = document.getElementById('toyCulture').value.trim();
      if (!name || !author || !culture) {
        window.showToast("Please complete Toy Name, Creator Name, and Inspired Culture!", "warning");
        return false;
      }
    } else if (step === 2) {
      const summary = document.getElementById('toySummary').value.trim();
      const rules = document.getElementById('toyRules').value.trim();
      if (!summary || !rules) {
        window.showToast("Please provide a summary concept and gameplay rules!", "warning");
        return false;
      }
    }
    return true;
  },

  goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > 4) return;
    this.currentStep = stepNumber;

    // Update Step Indicator UI
    document.querySelectorAll('.wizard-step-indicator').forEach((ind, index) => {
      ind.classList.toggle('active', index + 1 === stepNumber);
      ind.classList.toggle('completed', index + 1 < stepNumber);
    });

    // Update Fieldset/Step Visibility
    document.querySelectorAll('.wizard-step-panel').forEach((panel, index) => {
      panel.classList.toggle('active', index + 1 === stepNumber);
    });

    window.playAudioFx('click');
  },

  updatePreviewCard() {
    const name = document.getElementById('toyName')?.value || 'Your Toy Title';
    const author = document.getElementById('authorName')?.value || 'Student Innovator';
    const school = document.getElementById('schoolName')?.value || 'Heritage Academy';
    const category = document.getElementById('toyCategory')?.value || 'History';
    const culture = document.getElementById('toyCulture')?.value || 'Ancient Culture';
    const era = document.getElementById('toyEra')?.value || 'Historic Era';
    const ageGroup = document.getElementById('toyAgeGroup')?.value || '10-14';
    const summary = document.getElementById('toySummary')?.value || 'Your creative toy or game concept preview will appear here as you type in the wizard.';
    const iconName = document.getElementById('selectedToyIcon')?.value || 'chess-board';
    const themeName = document.getElementById('selectedColorTheme')?.value || 'gold';

    const cardVisual = document.getElementById('previewCardVisual');
    if (cardVisual) {
      cardVisual.className = `card-header-visual theme-${themeName}`;
    }

    const previewIcon = document.getElementById('previewCardIcon');
    if (previewIcon && window.GalleryModule) {
      previewIcon.innerHTML = window.GalleryModule.getIconSymbol(iconName);
    }

    const previewCulture = document.getElementById('previewCardCulture');
    if (previewCulture) previewCulture.innerText = culture;

    const previewCategory = document.getElementById('previewCardCategory');
    if (previewCategory) {
      previewCategory.innerText = category;
      previewCategory.className = `card-category-badge badge-${category.toLowerCase()}`;
    }

    const previewTitle = document.getElementById('previewCardTitle');
    if (previewTitle) previewTitle.innerText = name;

    const previewAuthor = document.getElementById('previewCardAuthor');
    if (previewAuthor) previewAuthor.innerHTML = `By <strong>${author}</strong> (${school})`;

    const previewSummary = document.getElementById('previewCardSummary');
    if (previewSummary) previewSummary.innerText = summary;

    const previewAge = document.getElementById('previewCardAge');
    if (previewAge) previewAge.innerText = `👶 Age ${ageGroup}`;

    const previewEra = document.getElementById('previewCardEra');
    if (previewEra) previewEra.innerText = `📜 ${era}`;
  },

  submitInnovation() {
    const name = document.getElementById('toyName').value.trim();
    const author = document.getElementById('authorName').value.trim();
    const school = document.getElementById('schoolName').value.trim() || 'Innovation Academy';
    const category = document.getElementById('toyCategory').value;
    const culture = document.getElementById('toyCulture').value.trim();
    const era = document.getElementById('toyEra').value.trim() || 'Ancient Times';
    const ageGroup = document.getElementById('toyAgeGroup').value;
    const summary = document.getElementById('toySummary').value.trim();
    const rules = document.getElementById('toyRules').value.trim().split('\n').filter(r => r.trim());
    const materials = document.getElementById('toyMaterials').value.trim().split(',').map(m => m.trim()).filter(Boolean);
    const learningObjectives = document.getElementById('toyLearning').value.trim().split('\n').filter(o => o.trim());
    const icon = document.getElementById('selectedToyIcon').value || 'chess-board';
    const colorTheme = document.getElementById('selectedColorTheme').value || 'gold';

    const newIdea = {
      id: "user-idea-" + Date.now(),
      title: name,
      author: author,
      school: school,
      ageGroup: ageGroup,
      category: category,
      culture: culture,
      era: era,
      likes: 1,
      bookmarks: 0,
      views: 12,
      rating: 5.0,
      featured: false,
      summary: summary,
      materials: materials.length ? materials : ["Eco-friendly Wood", "Cardstock", "Craft Tokens"],
      rules: rules.length ? rules : ["Set up game board and place player tokens.", "Draw heritage riddle cards.", "Reach the victory space first!"],
      learningObjectives: learningObjectives.length ? learningObjectives : ["Teaches historical awareness and creative design thinking."],
      icon: icon,
      colorTheme: colorTheme,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    const appState = window.getAppState();
    appState.ideas.unshift(newIdea);
    appState.userState.mySubmissions.push(newIdea);
    appState.userState.points += 100;
    
    // Unlock Innovation Pioneer badge
    window.unlockBadge('innovation_pioneer');

    window.saveAppState();

    // Trigger Canvas Confetti Celebration!
    this.launchConfetti();
    window.playAudioFx('fanfare');

    window.showToast("🎉 Congratulations! Your Toy Idea has been published to the Challenge! +100 Pts", "success");

    // Reset Form & Switch to Gallery/Explore or Dashboard
    document.getElementById('innovationForm').reset();
    this.goToStep(1);
    this.updatePreviewCard();

    if (window.GalleryModule) window.GalleryModule.render();
    if (window.DashboardModule) window.DashboardModule.render();
    if (window.LeaderboardModule) window.LeaderboardModule.render();
    window.updateHeaderStats();

    setTimeout(() => {
      window.switchTab('explore');
    }, 1500);
  },

  launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiPieces = [];
    const colors = ['#F59E0B', '#E11D48', '#7C3AED', '#059669', '#0EA5E9', '#FFD700'];

    for (let i = 0; i < 120; i++) {
      confettiPieces.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    function animateConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      confettiPieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.opacity -= 0.012;
        p.rotation += p.vRot;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        requestAnimationFrame(animateConfetti);
      } else {
        canvas.remove();
      }
    }

    animateConfetti();
  }
};
