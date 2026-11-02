// Движущиеся эффекты: падающие лепестки, сердечки, искры за курсором,
// взрывы сердечек на кликах, переходы между страницами, параллакс.
// Выключаются кнопкой «✦ эффекты» (запоминается) и системной настройкой «уменьшить движение».
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let on = store.get('fx', true) && !reduce;
  const home = document.body.classList.contains('home');

  const PINKS = ['#ffd1df', '#ffc0d3', '#f9a8c2', '#ffe4ec', '#f48fb1', '#fff0f5'];
  const GOLD = ['#e8cf9f', '#c39a55', '#fff3d6'];

  function makeCanvas(cls) {
    const c = document.createElement('canvas');
    c.className = 'fx-canvas ' + cls;
    document.body.appendChild(c);
    return c;
  }
  const bg = makeCanvas('fx-back');
  const fg = makeCanvas('fx-front');
  const bctx = bg.getContext('2d');
  const fctx = fg.getContext('2d');
  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    [bg, fg].forEach((c) => { c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px'; });
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  // ---------- Падающие лепестки (фон) ----------
  const petals = [];
  const PETALS = home ? (W < 700 ? 26 : 46) : (W < 700 ? 10 : 18);
  function newPetal(top) {
    return {
      x: rnd(-40, W + 40), y: top ? rnd(-H, 0) : rnd(0, H),
      s: rnd(7, home ? 17 : 13), vy: rnd(0.35, 1.1), vx: rnd(-0.2, 0.5),
      rot: rnd(0, Math.PI * 2), vr: rnd(-0.03, 0.03), sway: rnd(0, Math.PI * 2),
      flip: rnd(0, Math.PI * 2), col: pick(PINKS), a: rnd(0.55, 0.95)
    };
  }
  for (let i = 0; i < PETALS; i++) petals.push(newPetal(false));

  function drawPetal(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, Math.abs(Math.cos(p.flip)) * 0.7 + 0.3);
    ctx.globalAlpha = p.a;
    const g = ctx.createLinearGradient(0, -p.s, 0, p.s);
    g.addColorStop(0, '#fff');
    g.addColorStop(1, p.col);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -p.s);
    ctx.bezierCurveTo(p.s * 0.9, -p.s * 0.6, p.s * 0.7, p.s * 0.7, 0, p.s);
    ctx.bezierCurveTo(-p.s * 0.7, p.s * 0.7, -p.s * 0.9, -p.s * 0.6, 0, -p.s);
    ctx.fill();
    ctx.restore();
  }

  // ---------- Сердечки, поднимающиеся снизу (только на главной) ----------
  const floaters = [];
  function heartPath(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.45, -s, 0, -s * 0.45);
    ctx.bezierCurveTo(s * 0.45, -s, s, -s * 0.3, 0, s * 0.35);
  }
  function drawHeart(ctx, x, y, s, col, a, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.globalAlpha = a;
    ctx.fillStyle = col;
    ctx.shadowColor = 'rgba(255,255,255,.8)';
    ctx.shadowBlur = 6;
    heartPath(ctx, s);
    ctx.fill();
    ctx.restore();
  }
  function drawStar(ctx, x, y, s, col, a, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.globalAlpha = a;
    ctx.fillStyle = col;
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 2;
      ctx.lineTo(Math.cos(ang) * s, Math.sin(ang) * s);
      ctx.lineTo(Math.cos(ang + Math.PI / 4) * s * 0.28, Math.sin(ang + Math.PI / 4) * s * 0.28);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ---------- Частицы переднего плана: искры курсора и взрывы ----------
  const parts = [];
  function spawn(x, y, n, opts) {
    if (!on) return;
    opts = opts || {};
    for (let i = 0; i < n; i++) {
      const ang = rnd(0, Math.PI * 2), sp = rnd(opts.min || 1.5, opts.max || 5);
      parts.push({
        x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - (opts.lift || 1.5),
        s: rnd(opts.smin || 4, opts.smax || 9), life: 1, decay: rnd(0.012, 0.025),
        kind: opts.kind || (Math.random() < 0.55 ? 'heart' : 'star'),
        col: Math.random() < 0.3 ? pick(GOLD) : pick(PINKS.concat(['#e05a8a', '#c2446e'])),
        rot: rnd(-0.5, 0.5), vr: rnd(-0.08, 0.08), g: opts.gravity == null ? 0.08 : opts.gravity
      });
    }
  }

  let lastTrail = 0;
  addEventListener('pointermove', (e) => {
    if (!on || e.pointerType === 'touch') return;
    const now = performance.now();
    if (now - lastTrail < 28) return;
    lastTrail = now;
    parts.push({
      x: e.clientX + rnd(-4, 4), y: e.clientY + rnd(-4, 4), vx: rnd(-0.4, 0.4), vy: rnd(0.2, 0.9),
      s: rnd(3, 6.5), life: 1, decay: rnd(0.025, 0.04), kind: Math.random() < 0.25 ? 'heart' : 'star',
      col: Math.random() < 0.4 ? pick(GOLD) : pick(PINKS), rot: 0, vr: rnd(-0.1, 0.1), g: 0.01
    });
  }, { passive: true });

  // ---------- Главный цикл ----------
  let t0 = performance.now();
  function frame(now) {
    const dt = Math.min(3, (now - t0) / 16.7);
    t0 = now;
    bctx.clearRect(0, 0, W, H);
    fctx.clearRect(0, 0, W, H);
    if (on) {
      petals.forEach((p, i) => {
        p.sway += 0.02 * dt;
        p.flip += 0.03 * dt;
        p.x += (p.vx + Math.sin(p.sway) * 0.6) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        if (p.y > H + 30 || p.x > W + 60 || p.x < -60) petals[i] = newPetal(true), (petals[i].y = -20);
        drawPetal(bctx, p);
      });

      if (home && Math.random() < 0.04 * dt && floaters.length < 14) {
        floaters.push({ x: rnd(0, W), y: H + 20, s: rnd(6, 14), vy: rnd(0.5, 1.2), sway: rnd(0, 6), col: pick(['#f48fb1', '#ffc0d3', '#e05a8a', '#fff0f5']), a: rnd(0.5, 0.85) });
      }
      for (let i = floaters.length - 1; i >= 0; i--) {
        const f = floaters[i];
        f.y -= f.vy * dt;
        f.sway += 0.03 * dt;
        const a = f.a * Math.min(1, (f.y) / (H * 0.4));
        drawHeart(bctx, f.x + Math.sin(f.sway) * 18, f.y, f.s, f.col, Math.max(0, a), Math.sin(f.sway) * 0.2);
        if (f.y < -20 || a <= 0) floaters.splice(i, 1);
      }
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy += p.g * dt;
      p.vx *= 0.985;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      (p.kind === 'heart' ? drawHeart : drawStar)(fctx, p.x, p.y, p.s * (0.6 + p.life * 0.4), p.col, Math.min(1, p.life * 1.4), p.rot);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---------- Взрывы на кликах ----------
  const centerOf = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  document.addEventListener('click', (e) => {
    const el = e.target.closest('button, a, .petal-hit, .flash');
    if (!el) return;
    const big = el.matches('.btn, .petal-hit, .trainer-btn');
    spawn(e.clientX || centerOf(el)[0], e.clientY || centerOf(el)[1], big ? 22 : 9, big ? {} : { max: 3, smax: 6 });
  }, true);

  document.addEventListener('change', (e) => {
    if (e.target.matches('input[type=checkbox]') && e.target.checked) {
      const [x, y] = centerOf(e.target);
      spawn(x, y, 18, { kind: 'heart' });
    }
  }, true);

  // Большой салют: для «Знаю», верного ответа и т. п.
  function celebrate(x, y) {
    if (!on) return;
    x = x == null ? W / 2 : x;
    y = y == null ? H * 0.45 : y;
    spawn(x, y, 45, { min: 3, max: 9, smax: 12, lift: 3, gravity: 0.12 });
  }

  // ---------- Переходы между страницами ----------
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || !on || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (!/^(index|section|trainer)\.html/.test(href)) return;
    e.preventDefault();
    if (a.classList.contains('petal-hit')) celebrate(e.clientX, e.clientY);
    document.body.classList.add('fx-leaving');
    setTimeout(() => { location.href = href; }, 420);
  });
  addEventListener('pageshow', () => document.body.classList.remove('fx-leaving'));

  // ---------- Параллакс картинки на главной ----------
  if (home) {
    const img = document.querySelector('.stage image');
    const petalsG = document.getElementById('petals');
    let tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener('pointermove', (e) => {
      tx = (e.clientX / W - 0.5) * -18;
      ty = (e.clientY / H - 0.5) * -12;
    }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      const v = on ? `translate(${cx.toFixed(2)} ${cy.toFixed(2)})` : '';
      img.setAttribute('transform', v ? v + ' scale(1.02) translate(-16 -9)' : '');
      petalsG.setAttribute('transform', v);
      requestAnimationFrame(loop);
    })();
  }

  // ---------- Появление карточек при прокрутке ----------
  function revealCards() {
    const cards = document.querySelectorAll('.card');
    if (!('IntersectionObserver' in window) || !on) { cards.forEach((c) => c.classList.add('fx-in')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('fx-in'); io.unobserve(en.target); }
    }), { threshold: 0.08 });
    cards.forEach((c, i) => { c.style.setProperty('--d', (i % 6) * 0.08 + 's'); c.classList.add('fx-reveal'); io.observe(c); });
  }

  // ---------- Кнопка вкл/выкл ----------
  function applyState() {
    document.documentElement.classList.toggle('fx-off', !on);
    if (toggle) toggle.textContent = on ? '✦ эффекты: вкл' : '✧ эффекты: выкл';
  }
  let toggle = null;
  function init() {
    const bar = document.querySelector('.home-bar, .foot');
    if (bar && !reduce) {
      toggle = document.createElement('button');
      toggle.className = 'pill';
      toggle.addEventListener('click', () => { on = !on; store.set('fx', on); applyState(); });
      bar.appendChild(toggle);
    }
    applyState();
    setTimeout(revealCards, 30);
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();

  window.fx = { burst: (x, y) => spawn(x, y, 20), celebrate, revealCards };
})();
