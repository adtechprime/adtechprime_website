/* Prime Play™ page: playable demos + Explorer pass.
   Four demos (loop builder, sync wall, emergency stop, setup quiz) each earn a badge.
   All four unlock a Priority demo pass that is carried into the demo form. */
(function () {
  'use strict';
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- storage (per visitor, optional) ---------- */
  var KEY = 'pp-explorer-pass';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ } }
  var state = load();
  state.badges = state.badges || [];

  /* ---------- Explorer pass ---------- */
  var BADGES = ['loop', 'sync', 'stop', 'quiz'];
  var NAMES = { loop: 'Perfect loop', sync: 'In sync', stop: 'Stopped it', quiz: 'Setup found' };
  var pass = $('[data-pass]');
  var toastEl = $('[data-pp-toast]');
  var toastTimer;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.querySelector('span').textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  function renderPass() {
    if (!pass) return;
    var n = state.badges.length;
    $('[data-pass-count]', pass).textContent = n + ' of ' + BADGES.length;
    $('[data-pass-meter]', pass).style.width = (n / BADGES.length * 100) + '%';
    BADGES.forEach(function (id) {
      var b = $('[data-badge="' + id + '"]', pass);
      if (b) b.classList.toggle('on', state.badges.indexOf(id) > -1);
    });
    pass.classList.toggle('complete', n === BADGES.length);
    $('[data-pass-hint]', pass).textContent = n === BADGES.length
      ? 'Priority demo unlocked · ' + state.code
      : 'Try ' + (BADGES.length - n) + ' more to unlock a Priority demo';
  }

  function earn(id) {
    if (state.badges.indexOf(id) > -1) return;
    state.badges.push(id);
    save(state);
    renderPass();
    var b = pass && $('[data-badge="' + id + '"]', pass);
    if (b) { b.classList.add('pop'); setTimeout(function () { b.classList.remove('pop'); }, 400); }
    if (state.badges.length === BADGES.length) unlock(true);
    else toast('Badge earned: ' + NAMES[id] + ' · ' + state.badges.length + ' of 4');
  }

  /* ---------- Reward: Priority demo pass ---------- */
  function makeCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return 'PP-' + s;
  }

  function applyToForm() {
    var form = $('[data-contact-form]');
    if (!form || !state.code) return;
    var field = $('[name="explorer_pass"]', form);
    if (field) field.value = 'Completed · ' + state.code + (state.setup ? ' · ' + state.setup : '');
    form.setAttribute('data-subject-prefix', 'Prime Play™ PRIORITY demo request [' + state.code + ']');
    form.setAttribute('data-submit-label', 'Claim my priority demo');
    var label = $('[data-submit] .btn-label', form);
    if (label) label.textContent = 'Claim my priority demo';
    var banner = $('[data-pass-banner]');
    if (banner) { banner.hidden = false; $('[data-pass-code]', banner).textContent = state.code; }
  }

  function unlock(celebrate) {
    if (!state.code) { state.code = makeCode(); save(state); }
    renderPass();
    applyToForm();
    if (!celebrate) return;
    var modal = $('[data-reward]');
    if (modal) {
      $('[data-reward-code]', modal).textContent = state.code;
      if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    }
    // Confetti renders inside the dialog so it shows above the backdrop.
    setTimeout(function () { confetti(modal && modal.open ? modal : document.body); }, 350);
  }

  var modal = $('[data-reward]');
  if (modal) {
    $$('[data-reward-close]', modal).forEach(function (btn) {
      btn.addEventListener('click', function () { modal.close ? modal.close() : modal.removeAttribute('open'); });
    });
    modal.addEventListener('click', function (e) { if (e.target === modal && modal.close) modal.close(); });
    var claim = $('[data-reward-claim]', modal);
    if (claim) claim.addEventListener('click', function () {
      if (modal.close) modal.close();
      var demo = $('#demo');
      if (demo) demo.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      setTimeout(function () { var f = $('#demo input[name="name"]'); if (f) f.focus({ preventScroll: true }); }, 600);
    });
  }

  function confetti(parent) {
    if (reduceMotion) return;
    var c = document.createElement('canvas');
    c.className = 'pp-confetti';
    parent.appendChild(c);
    var ctx = c.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = c.width = innerWidth * dpr, H = c.height = innerHeight * dpr;
    var colors = ['#1A6BD4', '#5AA8FF', '#04A9F4', '#3DD68C', '#F5B84A', '#FFFFFF'];
    var parts = [];
    for (var i = 0; i < 140; i++) {
      parts.push({
        x: W / 2 + (Math.random() - .5) * W * .3, y: H * .45,
        vx: (Math.random() - .5) * 22 * dpr, vy: (-Math.random() * 18 - 6) * dpr,
        w: (4 + Math.random() * 6) * dpr, h: (8 + Math.random() * 8) * dpr,
        r: Math.random() * Math.PI, vr: (Math.random() - .5) * .3, c: colors[i % colors.length]
      });
    }
    var start = performance.now();
    (function frame(t) {
      var k = (t - start) / 2400;
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (p) {
        p.vy += .55 * dpr; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      if (k < 1) requestAnimationFrame(frame); else c.remove();
    })(start);
  }

  /* ---------- 1. Loop builder ---------- */
  (function () {
    var root = $('[data-loop]');
    if (!root) return;
    var LOOP = 120, MAX = 12;
    var COLORS = ['#1A6BD4', '#0B1733', '#04A9F4', '#23406F', '#0E9F8E', '#5AA8FF', '#12264F', '#3B82C4', '#0F4FA3', '#33507F', '#1B9AAA', '#2A5BA8'];
    var track = $('[data-loop-track]', root), note = $('[data-loop-note]', root);
    var spots = [], brandNo = 0;

    function render() {
      var total = spots.reduce(function (a, s) { return a + s.d; }, 0);
      var over = total > LOOP, scale = Math.max(total, LOOP);
      track.innerHTML = spots.map(function (s, i) {
        var share = s.d / scale;
        return '<button type="button" class="pp-slot' + (over ? ' over' : '') + '" data-i="' + i + '" style="flex:0 0 ' + (share * 100) + '%;background:' + s.c + '" aria-label="Brand ' + s.n + ', ' + s.d + ' seconds. Remove">' +
          (share > .09 ? 'B' + s.n + ' · ' + s.d + 's' : s.d + 's') + '</button>';
      }).join('');
      $('[data-loop-brands]', root).textContent = spots.length + ' / ' + MAX;
      $('[data-loop-len]', root).textContent = total + 's';
      $('[data-loop-free]', root).textContent = over ? '−' + (total - LOOP) + 's' : (LOOP - total) + 's';
      track.classList.toggle('full', total === LOOP);
      note.className = 'pp-note';
      if (total === LOOP) { note.textContent = 'Perfect loop: ' + spots.length + ' brands, 120 seconds, no wasted airtime.'; note.classList.add('good'); earn('loop'); }
      else if (over) { note.textContent = 'Over by ' + (total - LOOP) + 's. Prime Play™ warns you before you publish. Remove a spot.'; note.classList.add('bad'); }
      else if (spots.length >= MAX) { note.textContent = 'All 12 brand slots are used. Remove one to change the mix.'; note.classList.add('bad'); }
      else note.textContent = (LOOP - total) + 's free. Keep adding until the loop is exactly full.';
    }
    function add(d) {
      if (spots.length >= MAX) return render();
      brandNo++;
      spots.push({ d: d, n: brandNo, c: COLORS[(brandNo - 1) % COLORS.length] });
      render();
    }
    $$('[data-add]', root).forEach(function (b) { b.addEventListener('click', function () { add(+b.getAttribute('data-add')); }); });
    track.addEventListener('click', function (e) {
      var s = e.target.closest('.pp-slot'); if (!s) return;
      spots.splice(+s.getAttribute('data-i'), 1); render();
    });
    $('[data-loop-clear]', root).addEventListener('click', function () { spots = []; brandNo = 0; render(); });
    [30, 20, 15].forEach(add);
  })();

  /* ---------- 2 & 3. Sync wall + emergency stop ---------- */
  (function () {
    var root = $('[data-wall]');
    if (!root) return;
    var wall = $('[data-wall-screens]', root), note = $('[data-wall-note]', root), stopBtn = $('[data-wall-stop]', root);
    var html = '';
    for (var i = 0; i < 9; i++) html += '<div class="pp-scr"><span class="pp-scr-dot"></span><div class="pp-ad"></div><div class="pp-bar"></div><div class="pp-off mono">STOPPED</div></div>';
    wall.innerHTML = html;
    var ads = $$('.pp-ad', wall), bars = $$('.pp-bar', wall);
    var BRANDS = [['BRAND A', '#1A6BD4'], ['BRAND B', '#0E9F8E'], ['BRAND C', '#C2410C']];
    var MIXED = [0, 1, 2, 2, 0, 1, 1, 2, 0];
    var offsets = MIXED.slice(), tick = 0, stopped = false, timer = null;

    function paint() {
      ads.forEach(function (a, i) { var b = BRANDS[(tick + offsets[i]) % 3]; a.textContent = b[0]; a.style.background = b[1]; });
      bars.forEach(function (b) { b.classList.remove('run'); void b.offsetWidth; b.classList.add('run'); });
    }
    function setNote(text, kind) { note.textContent = text; note.className = 'pp-note' + (kind ? ' ' + kind : ''); }
    function setStopped(on) {
      stopped = on;
      wall.classList.toggle('stopped', on);
      stopBtn.classList.toggle('resume', on);
      stopBtn.textContent = on ? 'GO' : 'STOP';
      stopBtn.setAttribute('aria-label', on ? 'Resume all screens' : 'Emergency stop: stop all screens');
    }
    // Only animate while the wall is on screen.
    function run(on) {
      clearInterval(timer); timer = null;
      if (on) timer = setInterval(function () { if (!stopped) { tick++; paint(); } }, 2000);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { run(es[0].isIntersecting); }).observe(wall);
    } else run(true);

    $('[data-wall-sync]', root).addEventListener('click', function () {
      offsets = offsets.map(function () { return 0; });
      if (stopped) setStopped(false);
      paint();
      setNote('In sync: all nine screens change brand at the same moment. Now try the emergency stop.', 'good');
      earn('sync');
    });
    $('[data-wall-unsync]', root).addEventListener('click', function () {
      offsets = MIXED.slice();
      if (stopped) setStopped(false);
      paint();
      setNote('Out of sync: each screen shows a different brand.');
    });
    stopBtn.addEventListener('click', function () {
      setStopped(!stopped);
      if (stopped) { setNote('All screens stopped in one click. Press GO to resume.', 'bad'); earn('stop'); }
      else setNote('Screens resumed.');
    });
    paint();
  })();

  /* ---------- 4. Setup quiz ---------- */
  (function () {
    var root = $('[data-quiz]');
    if (!root) return;
    var QS = [
      { q: 'Who are you?', o: ['Media owner', 'Mall or retail chain', 'Agency', 'Reseller'] },
      { q: 'How many screens do you run?', o: ['1–10', '11–50', '51–200', 'More than 200'] },
      { q: 'What matters most to you?', o: ['Proving plays to advertisers', 'Selling more brand slots', 'Fewer site visits', 'My own brand on the software'] }
    ];
    var SCREENS = { '1–10': '1–10 screens', '11–50': '11–50 screens', '51–200': '51–200 screens', 'More than 200': '200+ screens' };
    var FEATURES = {
      'Media owner': 'Brand slots with their own dates, days and hours',
      'Mall or retail chain': 'Perfect sync across screens and video walls',
      'Agency': 'Client-ready reports in PDF and PowerPoint',
      'Reseller': 'Set screens, users and features for each client',
      'Proving plays to advertisers': 'Signed proof of play and a daily play check',
      'Selling more brand slots': 'Loop length and free capacity shown before you publish',
      'Fewer site visits': 'Remote screenshot, restart and update for any screen',
      'My own brand on the software': 'Full white label: your name, logo, colours and web address'
    };
    var answers = [];
    var body = $('[data-quiz-body]', root);

    function render() {
      var step = answers.length;
      if (step < QS.length) {
        var q = QS[step];
        body.innerHTML = '<p class="pp-qstep mono">Question ' + (step + 1) + ' of ' + QS.length + '</p>' +
          '<p class="pp-q">' + q.q + '</p><div class="pp-opts">' +
          q.o.map(function (x) { return '<button type="button" class="pp-opt" aria-pressed="false" data-v="' + x + '">' + x + '</button>'; }).join('') + '</div>' +
          (step ? '<button type="button" class="pp-back" data-quiz-back>← Back</button>' : '');
        return;
      }
      var feats = [FEATURES[answers[0]], FEATURES[answers[2]], 'Keeps playing offline when the internet drops'];
      feats = feats.filter(function (f, i) { return feats.indexOf(f) === i; });
      state.setup = answers[0] + ', ' + SCREENS[answers[1]] + ', wants: ' + answers[2];
      save(state);
      body.innerHTML = '<div class="pp-result"><p class="mono">Your Prime Play™ setup</p>' +
        '<h3>' + answers[0] + ' · ' + answers[1] + ' screens</h3><ul>' +
        feats.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul>' +
        '<div class="pp-row"><a class="btn btn-primary" href="#demo" data-quiz-use>Use this in my demo request</a>' +
        '<button type="button" class="btn btn-ghost" data-quiz-again>Start over</button></div></div>';
      var select = $('#demo select[name="screens"]');
      if (select) select.value = SCREENS[answers[1]];
      applyToForm();
      earn('quiz');
    }
    body.addEventListener('click', function (e) {
      var o = e.target.closest('.pp-opt');
      if (o) { o.setAttribute('aria-pressed', 'true'); setTimeout(function () { answers.push(o.getAttribute('data-v')); render(); }, 160); return; }
      if (e.target.closest('[data-quiz-back]')) { answers.pop(); render(); return; }
      if (e.target.closest('[data-quiz-again]')) { answers = []; render(); }
    });
    render();
  })();

  /* ---------- restore a pass earned on an earlier visit ---------- */
  renderPass();
  if (state.badges.length === BADGES.length) unlock(false);
})();
