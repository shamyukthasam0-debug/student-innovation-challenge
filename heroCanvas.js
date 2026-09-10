// Animated Hero Background Canvas

window.initHeroCanvas = function() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 120 };

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    createParticles();
  }

  window.addEventListener('resize', resize);
  
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  const symbols = ['▲', '◆', '●', '★', '🏛️', '🏺', '👑', '📜', '🎲', '🧩', '✦'];

  function createParticles() {
    particles = [];
    const particleCount = Math.floor(Math.min(width, 1400) / 25);
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.2,
        size: Math.random() * 16 + 10,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        opacity: Math.random() * 0.35 + 0.15,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.015,
        color: getRandomColor()
      });
    }
  }

  function getRandomColor() {
    const colors = [
      'rgba(245, 158, 11, ',  // Gold
      'rgba(225, 29, 72, ',   // Crimson
      'rgba(124, 58, 237, ',  // Purple
      'rgba(5, 150, 105, ',   // Emerald
      'rgba(14, 165, 233, '   // Sky
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting background network lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(245, 158, 11, ${0.12 * (1 - dist / 110)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Render each particle symbol
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;

      // Wrap edges
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      // Mouse push interaction
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const angle = Math.atan2(dy, dx);
          const force = (mouse.radius - dist) / mouse.radius;
          p.x += Math.cos(angle) * force * 2.5;
          p.y += Math.sin(angle) * force * 2.5;
        }
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.font = `${p.size}px 'Outfit', sans-serif`;
      ctx.fillStyle = p.color + p.opacity + ')';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.symbol, 0, 0);
      ctx.restore();
    });

    requestAnimationFrame(animate);
  }

  resize();
  animate();
};
