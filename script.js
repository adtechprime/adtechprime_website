/* ═══════════════════════════════════════════════════
   AdTech Prime Solution — Coming Soon  •  script.js
   Particle network, countdown, form handler, scroll reveals
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // 1.  PARTICLE NETWORK CANVAS
  // ─────────────────────────────────────────────
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null };
  let animFrame;

  const PARTICLE_CONFIG = {
    count: 75,
    maxDist: 150,
    speed: 0.2,
    sizeMin: 1,
    sizeMax: 2.2,
    // Branded blue tones for particles
    colors: [
      'rgba(59,130,246,',   // accent-light
      'rgba(37,99,235,',    // accent-bright
      'rgba(96,165,250,',   // accent-glow
      'rgba(147,197,253,',  // accent-pale
      'rgba(23,67,151,',    // accent (primary blue)
    ],
    lineColor: 'rgba(59,130,246,',
    mouseRadius: 170,
  };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * PARTICLE_CONFIG.speed;
      this.vy = (Math.random() - 0.5) * PARTICLE_CONFIG.speed;
      this.r = Math.random() * (PARTICLE_CONFIG.sizeMax - PARTICLE_CONFIG.sizeMin) + PARTICLE_CONFIG.sizeMin;
      this.colorBase = PARTICLE_CONFIG.colors[Math.floor(Math.random() * PARTICLE_CONFIG.colors.length)];
      this.alpha = Math.random() * 0.45 + 0.2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PARTICLE_CONFIG.mouseRadius) {
          const force = (PARTICLE_CONFIG.mouseRadius - dist) / PARTICLE_CONFIG.mouseRadius;
          this.vx += (dx / dist) * force * 0.12;
          this.vy += (dy / dist) * force * 0.12;
        }
      }

      // Damping
      this.vx *= 0.997;
      this.vy *= 0.997;

      // Wrap edges
      if (this.x < -20) this.x = canvas.width + 20;
      if (this.x > canvas.width + 20) this.x = -20;
      if (this.y < -20) this.y = canvas.height + 20;
      if (this.y > canvas.height + 20) this.y = -20;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.colorBase + this.alpha + ')';
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = window.innerWidth < 640
      ? Math.floor(PARTICLE_CONFIG.count * 0.4)
      : PARTICLE_CONFIG.count;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PARTICLE_CONFIG.maxDist) {
          const opacity = (1 - dist / PARTICLE_CONFIG.maxDist) * 0.14;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = PARTICLE_CONFIG.lineColor + opacity + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animFrame = requestAnimationFrame(animateParticles);
  }

  // Init canvas
  resizeCanvas();
  initParticles();
  animateParticles();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      initParticles();
    }, 150);
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // ─────────────────────────────────────────────
  // 2.  COUNTDOWN TIMER
  // ─────────────────────────────────────────────
  // Target: 90 days from now (customise as needed)
  const LAUNCH_DATE = new Date();
  LAUNCH_DATE.setDate(LAUNCH_DATE.getDate() + 15);

  const $days = document.querySelector('[data-unit="days"]');
  const $hours = document.querySelector('[data-unit="hours"]');
  const $minutes = document.querySelector('[data-unit="minutes"]');
  const $seconds = document.querySelector('[data-unit="seconds"]');

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateCountdown() {
    const now = new Date();
    let diff = LAUNCH_DATE - now;
    if (diff < 0) diff = 0;

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    animateDigit($days, pad(d));
    animateDigit($hours, pad(h));
    animateDigit($minutes, pad(m));
    animateDigit($seconds, pad(s));
  }

  function animateDigit(el, value) {
    if (!el || el.textContent === value) return;

    el.style.transition = 'transform .3s cubic-bezier(.34,1.56,.64,1), opacity .3s';
    el.style.transform = 'translateY(-5px)';
    el.style.opacity = '0';

    setTimeout(() => {
      el.textContent = value;
      el.style.transform = 'translateY(5px)';
      requestAnimationFrame(() => {
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
      });
    }, 160);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);



  // ─────────────────────────────────────────────
  // 4.  SCROLL-REVEAL FOR PILLARS (Intersection Observer)
  // ─────────────────────────────────────────────
  const pillars = document.querySelectorAll('.pillar');

  if ('IntersectionObserver' in window && pillars.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    pillars.forEach((p, i) => {
      p.style.opacity = '0';
      p.style.transform = 'translateY(28px)';
      p.style.transition = `opacity .7s ${i * 0.12}s cubic-bezier(.16,1,.3,1), transform .7s ${i * 0.12}s cubic-bezier(.16,1,.3,1)`;
      observer.observe(p);
    });
  }

  // ─────────────────────────────────────────────
  // 5.  SUBTLE PARALLAX ON HERO ELEMENTS
  // ─────────────────────────────────────────────
  const heroTitle = document.getElementById('heroTitle');
  const heroSubtitle = document.getElementById('heroSubtitle');

  if (heroTitle && heroSubtitle && window.innerWidth > 768) {
    window.addEventListener('mousemove', (e) => {
      const cx = (e.clientX / window.innerWidth - 0.5) * 2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;

      heroTitle.style.transform = `translate(${cx * 4}px, ${cy * 3}px)`;
      heroSubtitle.style.transform = `translate(${cx * 2}px, ${cy * 1.5}px)`;
    });
  }

})();
