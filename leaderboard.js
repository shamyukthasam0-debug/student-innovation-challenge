// Leaderboard Module

window.LeaderboardModule = {
  activeTab: 'allTime',
  searchQuery: '',

  init() {
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    document.querySelectorAll('.lb-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.lb-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.activeTab = e.target.dataset.tab;
        this.render();
      });
    });

    const searchInput = document.getElementById('searchLeaderboard');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }
  },

  render() {
    const tableBody = document.getElementById('leaderboardTableBody');
    if (!tableBody) return;

    let list = [...window.AppInitialData.leaderboard];

    // If user submitted an idea, add user to leaderboard
    const userSubmissions = window.getAppState().userState.mySubmissions || [];
    if (userSubmissions.length > 0) {
      const userTotalVotes = userSubmissions.reduce((sum, s) => sum + s.likes, 0);
      const userEntry = {
        rank: 0,
        name: window.getAppState().userState.studentName || "You (Innovator)",
        school: window.getAppState().userState.schoolName || "Student Academy",
        toyName: userSubmissions[0].title,
        points: window.getAppState().userState.points || 450,
        votes: userTotalVotes || 1,
        badgesCount: (window.getAppState().userState.badges || []).filter(b => b.unlocked).length,
        avatar: "🚀",
        isCurrentUser: true
      };

      // Check if user already in list
      const existingIdx = list.findIndex(item => item.isCurrentUser);
      if (existingIdx > -1) {
        list[existingIdx] = userEntry;
      } else {
        list.push(userEntry);
      }
    }

    // Sort by points descending
    list.sort((a, b) => b.points - a.points);

    // Re-assign ranks
    list.forEach((item, idx) => item.rank = idx + 1);

    // Filter by search
    if (this.searchQuery) {
      list = list.filter(item => 
        item.name.toLowerCase().includes(this.searchQuery) ||
        item.school.toLowerCase().includes(this.searchQuery) ||
        item.toyName.toLowerCase().includes(this.searchQuery)
      );
    }

    if (list.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4">No student innovators found matching your search.</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = list.map(student => {
      const rankBadgeClass = student.rank === 1 ? 'rank-gold' : student.rank === 2 ? 'rank-silver' : student.rank === 3 ? 'rank-bronze' : '';
      const rankSymbol = student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : `#${student.rank}`;

      return `
        <tr class="${student.isCurrentUser ? 'current-user-row' : ''}">
          <td class="rank-cell">
            <span class="rank-badge ${rankBadgeClass}">${rankSymbol}</span>
          </td>
          <td class="student-cell">
            <div class="student-info-flex">
              <span class="student-avatar">${student.avatar}</span>
              <div>
                <strong class="student-name">${student.name} ${student.isCurrentUser ? '<span class="you-badge">(You)</span>' : ''}</strong>
                <div class="student-school">${student.school}</div>
              </div>
            </div>
          </td>
          <td class="toy-cell">
            <span class="toy-title-chip">💡 ${student.toyName}</span>
          </td>
          <td class="center-cell">
            <span class="votes-badge">❤️ ${student.votes}</span>
          </td>
          <td class="center-cell">
            <span class="badges-count-chip">🏆 ${student.badgesCount} Badges</span>
          </td>
          <td class="right-cell">
            <strong class="points-val">⭐️ ${student.points} Pts</strong>
          </td>
        </tr>
      `;
    }).join('');
  }
};
