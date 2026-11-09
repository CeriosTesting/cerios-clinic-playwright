(() => {
  'use strict';

  // ------------------------------------------------------------------ helpers
  const DATA = JSON.parse(document.getElementById('site-data').textContent);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const page = $('#page');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem('pwt:' + k);
        return v === null ? d : JSON.parse(v);
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try { localStorage.setItem('pwt:' + k, JSON.stringify(v)); } catch (e) { /* private mode */ }
    },
    del(k) {
      try { localStorage.removeItem('pwt:' + k); } catch (e) { /* private mode */ }
    },
  };
  const h = (html) => {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };

  // ------------------------------------------------------------------ code highlighting
  function highlight(code, lang) {
    if (!/^(ts|js|typescript|javascript|json)$/i.test(lang || '')) return esc(code);
    const re = /(\/\/[^\n]*)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(await|async|const|let|var|import|from|export|default|class|readonly|private|new|return|this|constructor|true|false|null|function|type|string|number)\b|\b(\d+(?:\.\d+)?)\b|\b(test|expect|defineConfig)\b(?=\s*[.(])/g;
    let out = '';
    let last = 0;
    let m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : m[4] ? 'n' : 'f';
      out += `<span class="tok-${cls}">${esc(m[0])}</span>`;
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove();
      return ok;
    }
  }

  function enhanceCode(scope) {
    $$('.code pre > code', scope).forEach((code) => {
      if (code.dataset.ready) return;
      code.dataset.ready = '1';
      const lang = code.dataset.lang || 'text';
      const raw = code.textContent;
      code.parentElement.dataset.lang = lang;
      code.innerHTML = highlight(raw, lang);
      const btn = h('<button class="copy-btn" type="button">Kopieer</button>');
      btn.setAttribute('aria-label', `Kopieer ${lang}-code`);
      btn.addEventListener('click', async () => {
        const ok = await copyText(raw);
        btn.textContent = ok ? 'Gekopieerd ✓' : 'Lukt niet';
        setTimeout(() => { btn.textContent = 'Kopieer'; }, 1600);
      });
      code.closest('.code').appendChild(btn);
    });
  }

  // ------------------------------------------------------------------ theme
  function isDark() {
    if (root.dataset.theme) return root.dataset.theme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function toggleTheme() {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    store.set('theme', root.dataset.theme);
  }

  // ------------------------------------------------------------------ toast
  const toast = $('#toast');
  let toastClose = null;
  function showToast(html, onClose) {
    toast.innerHTML = html;
    toast.hidden = false;
    toastClose = onClose || null;
    $$('[data-action="toast-close"]', toast).forEach((b) => b.addEventListener('click', hideToast));
  }
  function hideToast() {
    if (toast.hidden) return;
    toast.hidden = true;
    if (toastClose) toastClose();
    toastClose = null;
  }

  // ------------------------------------------------------------------ confetti (roses)
  const confetti = (() => {
    const c = $('#confetti');
    const ctx = c.getContext('2d');
    const colors = ['#A6E6C6', '#7CC9A5', '#2EAD33', '#E2574C', '#FFE08A', '#FFFFFF'];
    let parts = [];
    let running = false;
    let dpr = 1;
    function resize() {
      dpr = window.devicePixelRatio || 1;
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
    }
    function spawn(x, y, vx, vy) {
      parts.push({
        x, y, vx, vy,
        r: 4 + Math.random() * 5,
        rot: Math.random() * 6.3,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[(Math.random() * colors.length) | 0],
        rose: Math.random() < 0.4,
      });
    }
    function drawRose(p) {
      ctx.fillStyle = p.color === '#FFFFFF' ? '#E2574C' : p.color;
      for (let i = 0; i < 5; i++) {
        const a = p.rot + (i * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * p.r * 0.6, Math.sin(a) * p.r * 0.6, p.r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, p.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    function tick() {
      ctx.clearRect(0, 0, c.width, c.height);
      parts = parts.filter((p) => p.y < window.innerHeight + 40);
      for (const p of parts) {
        p.vy += 0.18;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr);
        ctx.rotate(p.rot);
        if (p.rose) drawRose(p);
        else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        }
        ctx.restore();
      }
      if (parts.length) requestAnimationFrame(tick);
      else {
        running = false;
        ctx.clearRect(0, 0, c.width, c.height);
      }
    }
    function start() {
      if (running) return;
      running = true;
      resize();
      requestAnimationFrame(tick);
    }
    return {
      burst(x, y, n = 26) {
        if (reduceMotion) return;
        for (let i = 0; i < n; i++) spawn(x, y, (Math.random() - 0.5) * 9, -Math.random() * 8 - 2);
        start();
      },
      rain(n = 200) {
        if (reduceMotion) return;
        for (let i = 0; i < n; i++) spawn(Math.random() * window.innerWidth, -20 - Math.random() * window.innerHeight * 0.8, (Math.random() - 0.5) * 2, Math.random() * 2);
        start();
      },
    };
  })();

  function applause() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ac = new AC();
      const dur = 2.8;
      const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let k = 0; k < 340; k++) {
        const t = Math.random() * (dur - 0.05);
        const env = Math.sin((Math.PI * t) / dur);
        const start = Math.floor(t * ac.sampleRate);
        const len = Math.floor((0.008 + Math.random() * 0.01) * ac.sampleRate);
        const amp = (0.2 + Math.random() * 0.5) * env;
        for (let i = 0; i < len && start + i < d.length; i++) d[start + i] += (Math.random() * 2 - 1) * amp * Math.exp(-i / (len / 4));
      }
      const src = ac.createBufferSource();
      src.buffer = buf;
      const f = ac.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 1500;
      f.Q.value = 0.5;
      const g = ac.createGain();
      g.gain.value = 0.45;
      src.connect(f).connect(g).connect(ac.destination);
      src.start();
      src.onended = () => ac.close();
    } catch (e) { /* no audio, no problem */ }
  }

  // ------------------------------------------------------------------ progress
  const allScenes = DATA.acts.flatMap((a) => a.scenes.map((s) => Object.assign({}, s, { act: a.n, roman: a.roman })));
  const required = allScenes.filter((s) => !s.bonus);
  const bonus = allScenes.filter((s) => s.bonus);
  const played = new Set(store.get('played', []).filter((id) => allScenes.some((s) => s.id === id)));
  let wasComplete = required.every((s) => played.has(s.id));

  const label = (s) => (s.opdracht ? `Opdracht ${s.opdracht}` : s.title);

  function renderProgress(fromUser) {
    $$('.scene').forEach((el) => el.classList.toggle('is-played', played.has(el.dataset.scene)));
    $$('[data-dot]').forEach((el) => el.classList.toggle('is-done', played.has(el.dataset.dot)));
    $$('[data-scene-check]').forEach((cb) => { cb.checked = played.has(cb.dataset.sceneCheck); });

    for (const a of DATA.acts) {
      const req = a.scenes.filter((s) => !s.bonus);
      const bon = a.scenes.filter((s) => s.bonus);
      const done = req.filter((s) => played.has(s.id)).length;
      const bonDone = bon.filter((s) => played.has(s.id)).length;
      const chip = $(`[data-chip="${a.n}"]`);
      if (chip) {
        chip.style.setProperty('--p', req.length ? done / req.length : 0);
        chip.setAttribute('aria-label', `Akte ${a.roman}: ${a.title} — ${done} van ${req.length} gespeeld`);
      }
      const prog = $(`[data-akte-progress="${a.n}"]`);
      if (prog) {
        prog.textContent = `${done} / ${req.length} ${req.length === 1 ? 'scène' : 'scènes'} gespeeld${bon.length ? ` · toegift ${bonDone}/${bon.length}` : ''}`;
        prog.classList.toggle('is-complete', done === req.length);
      }
    }

    const done = required.filter((s) => played.has(s.id)).length;
    const p = required.length ? done / required.length : 0;
    const mood = $('[data-mood]');
    const hue = Math.round(5 + p * 118);
    mood.style.setProperty('--mood', `hsl(${hue} 62% 50%)`);
    $('.mm-mouth', mood).setAttribute('d', `M30 72 Q50 ${(72 + (p - 0.5) * 40).toFixed(1)} 70 72`);
    $('.mm-eye-l', mood).style.transform = `rotate(${(-16 * (1 - p)).toFixed(1)}deg)`;
    $('.mm-eye-r', mood).style.transform = `rotate(${(16 * (1 - p)).toFixed(1)}deg)`;
    $('[data-mood-text]').textContent = `${done} / ${required.length}`;
    mood.setAttribute('aria-label', `${done} / ${required.length} scènes gespeeld, naar het slotapplaus`);
    mood.title = p === 1 ? 'Komedie! Alles gespeeld.' : p === 0 ? 'Nog een tragedie… speel je eerste scène!' : 'De tragedie wordt langzaam een komedie';

    const complete = done === required.length;
    const status = $('[data-cc-status]');
    const todo = $('[data-cc-todo]');
    const bravo = $('[data-bravo]');
    if (complete) {
      status.textContent = 'Het doek valt, de zaal staat op. Alle scènes zijn gespeeld!';
      todo.innerHTML = '';
    } else {
      const left = required.filter((s) => !played.has(s.id));
      status.textContent = `Nog ${left.length} ${left.length === 1 ? 'scène' : 'scènes'} te gaan voor het slotapplaus.`;
      todo.innerHTML = left.map((s) => `<li><a href="#${s.id}">Akte ${s.roman} · ${esc(label(s))}</a></li>`).join('');
    }
    bravo.hidden = !complete;
    const allBonus = bonus.length && bonus.every((s) => played.has(s.id));
    $('[data-bravo-encore]').textContent = allBonus ? ' — inclusief alle toegiften!' : '';

    if (fromUser && complete && !wasComplete) celebrate();
    wasComplete = complete;
  }

  function celebrate() {
    confetti.rain(240);
    showToast(
      '<h2>Bravo! 🎭</h2><p>Alle scènes gespeeld. De tragedie is een komedie geworden.</p><p><a href="#slotapplaus" data-action="toast-close">Naar het slotapplaus →</a></p>',
    );
  }

  $$('[data-scene-check]').forEach((cb) => {
    cb.addEventListener('change', () => {
      if (cb.checked) played.add(cb.dataset.sceneCheck);
      else played.delete(cb.dataset.sceneCheck);
      store.set('played', Array.from(played));
      if (cb.checked) {
        const r = cb.closest('.played').getBoundingClientRect();
        confetti.burst(r.left + r.width / 2, r.top + r.height / 2, 18);
      }
      renderProgress(true);
    });
  });

  // Bravo card
  const nameInput = $('#bravo-name');
  function renderName() {
    const n = (nameInput.value || '').trim();
    $('[data-bravo-name]').textContent = n || 'hoofdrolspeler';
  }
  nameInput.value = store.get('name', '');
  nameInput.addEventListener('input', () => {
    store.set('name', nameInput.value);
    renderName();
  });
  renderName();
  $('[data-bravo-date]').textContent = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  function printBravo() {
    let area = $('#print-area');
    if (!area) {
      area = document.createElement('div');
      area.id = 'print-area';
      document.body.appendChild(area);
    }
    area.innerHTML = '';
    const clone = $('#bravo-card').cloneNode(true);
    clone.removeAttribute('id');
    area.appendChild(clone);
    document.body.classList.add('print-bravo');
    const done = () => {
      document.body.classList.remove('print-bravo');
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(done, 1000);
  }

  // ------------------------------------------------------------------ navigation between acts
  const aktes = $$('.akte');
  function currentAct() {
    const line = 140;
    let cur = null;
    for (const a of aktes) {
      if (a.getBoundingClientRect().top <= line) cur = a;
    }
    if (cur && cur.getBoundingClientRect().bottom < line) {
      // scrolled past the last act (curtain call etc.)
      return aktes.indexOf(cur) === aktes.length - 1 ? null : cur;
    }
    return cur;
  }
  function goAct(dir) {
    const cur = currentAct();
    let idx = cur ? aktes.indexOf(cur) + dir : dir > 0 ? 0 : -1;
    if (!cur && dir < 0 && aktes[aktes.length - 1].getBoundingClientRect().top < 0) idx = aktes.length - 1;
    if (idx < 0) {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }
    if (idx >= aktes.length) {
      $('#slotapplaus').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }
    aktes[idx].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  let scrollQueued = false;
  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      const cur = currentAct();
      const n = cur ? cur.dataset.akte : null;
      $$('.rail-chip').forEach((c) => {
        const on = c.dataset.chip === n;
        c.classList.toggle('is-current', on);
        if (on) c.setAttribute('aria-current', 'true');
        else c.removeAttribute('aria-current');
      });
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ------------------------------------------------------------------ curtain
  const curtain = $('#curtain');
  let curtainTimer = null;
  function showCurtain() {
    if (reduceMotion) return;
    clearTimeout(curtainTimer);
    curtain.classList.remove('is-open');
    curtain.hidden = false;
    page.inert = true;
    setTimeout(() => $('#curtain-open').focus(), 30);
  }
  function finishCurtain() {
    curtain.hidden = true;
    curtain.classList.remove('is-open');
    page.inert = false;
    afterCurtain();
  }
  function openCurtain() {
    if (curtain.hidden || curtain.classList.contains('is-open')) return;
    store.set('curtainSeen', true);
    curtain.classList.add('is-open');
    page.inert = false;
    curtainTimer = setTimeout(finishCurtain, 1800);
  }
  function skipCurtain() {
    store.set('curtainSeen', true);
    clearTimeout(curtainTimer);
    finishCurtain();
  }
  $('#curtain-open').addEventListener('click', openCurtain);
  curtain.addEventListener('pointermove', (e) => {
    curtain.style.setProperty('--sx', `${e.clientX}px`);
    curtain.style.setProperty('--sy', `${e.clientY}px`);
  });

  let afterCurtainDone = false;
  function afterCurtain() {
    if (afterCurtainDone) return;
    afterCurtainDone = true;
    maybeCleanupToast();
  }

  function maybeCleanupToast() {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const day = now.toISOString().slice(0, 10);
    const forced = /[?&]na-de-voorstelling\b/.test(location.search);
    if (!forced && (mins < 16 * 60 + 30 || store.get('cleanup') === day)) return;
    setTimeout(
      () =>
        showToast(
          `<h2>Na de voorstelling 🧹</h2>
           <p>Laat het kantoor opgeruimd achter voor je collega’s morgen ☺</p>
           <ul><li>Vaat in de vaatwasser</li><li>Afval in de prullenbak</li><li>Blikjes en flesjes in de box in de keuken</li><li>Buffetwarmers afsluiten (deksel erop/vlam doven)</li><li>Borden en bestek opbergen in kratjes</li></ul>
           <button class="btn btn-mint" type="button" data-action="toast-close">Komt goed!</button>`,
          () => store.set('cleanup', day),
        ),
      forced ? 300 : 2500,
    );
  }

  // ------------------------------------------------------------------ presenter mode
  const presenter = $('#presenter');
  const slides = $$('.slide', presenter);
  let slideIdx = 0;
  let presenterReturn = null;
  function showSlide(i) {
    slideIdx = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((s, k) => s.classList.toggle('is-current', k === slideIdx));
    $('[data-slide-count]', presenter).textContent = `${slideIdx + 1} / ${slides.length}`;
  }
  function openPresenter() {
    const cur = currentAct();
    let idx = 0;
    if (cur) {
      const s = slides.findIndex((x) => x.dataset.slideAct === cur.dataset.akte);
      if (s >= 0) idx = s;
    }
    presenterReturn = document.activeElement;
    presenter.hidden = false;
    page.inert = true;
    showSlide(idx);
    $('[data-action="present-close"]', presenter).focus();
  }
  function closePresenter() {
    presenter.hidden = true;
    page.inert = false;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    const act = slides[slideIdx] && slides[slideIdx].dataset.slideAct;
    if (act) $(`#akte-${act}`).scrollIntoView({ behavior: 'auto' });
    if (presenterReturn && presenterReturn.focus) presenterReturn.focus({ preventScroll: true });
  }
  presenter.addEventListener('click', (e) => {
    if (e.target.closest('.presenter-ui')) return;
    showSlide(slideIdx + 1);
  });

  // ------------------------------------------------------------------ zaallicht (vision simulation)
  const SIMS = {
    blur: ['Wazig zicht', 'Zoals lezen zonder je bril.'],
    protan: ['Protanopie', 'Rood wordt donker; rood en groen lijken op elkaar.'],
    deutan: ['Deuteranopie', 'Groen-blind: de bekendste vorm van kleurenblindheid.'],
    tritan: ['Tritanopie', 'Blauw en geel zijn lastig. Zeldzaam.'],
    gray: ['Geen kleur', 'Alles in grijstinten.'],
    low: ['Weinig contrast', 'Zoals een laptop in de zon.'],
    tunnel: ['Kokerzicht', 'Je ziet alleen wat rond je muis of focus ligt.'],
    nomouse: ['Geen muis', 'Alleen Tab, Shift+Tab, Enter en spatie.'],
  };
  let sim = null;
  let tunnel = null;
  function moveTunnel(x, y) {
    if (!tunnel) return;
    tunnel.style.setProperty('--tx', `${x}px`);
    tunnel.style.setProperty('--ty', `${y}px`);
  }
  const onPointer = (e) => moveTunnel(e.clientX, e.clientY);
  const onFocus = (e) => {
    const r = e.target.getBoundingClientRect();
    moveTunnel(r.left + r.width / 2, r.top + r.height / 2);
  };
  function setSim(mode) {
    if (sim === mode) mode = null;
    Object.keys(SIMS).forEach((k) => root.classList.remove('sim-' + k));
    if (tunnel) {
      tunnel.remove();
      tunnel = null;
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('focusin', onFocus);
    }
    sim = mode;
    if (mode) {
      root.classList.add('sim-' + mode);
      if (mode === 'tunnel') {
        tunnel = h('<div class="tunnel" aria-hidden="true"></div>');
        document.body.appendChild(tunnel);
        window.addEventListener('pointermove', onPointer);
        document.addEventListener('focusin', onFocus);
        moveTunnel(window.innerWidth / 2, window.innerHeight / 2);
      }
    }
    const bar = $('#simbar');
    bar.hidden = !mode;
    if (mode) $('[data-sim-name]', bar).textContent = SIMS[mode][0];
    $$('[data-sim]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sim === mode)));
  }

  // ------------------------------------------------------------------ labs
  const labs = {};

  // Lab I — De souffleur ----------------------------------------------------
  labs.souffleur = (mount) => {
    mount.innerHTML = `
      <div class="souffleur">
        <div class="mock-browser" aria-hidden="true">
          <div class="mock-bar"><span class="mock-dots"><i></i><i></i><i></i></span><span class="mock-url" data-s="url">about:blank</span></div>
          <div class="mock-page">
            <h4>Word vriend van het theater</h4>
            <div class="mock-field">E-mail<div class="mock-input" data-s="email"></div></div>
            <div class="mock-field">Wachtwoord<div class="mock-input" data-s="password"></div></div>
            <div class="mock-btn" data-s="submit">Word vriend</div>
            <div class="mock-success" data-s="success" hidden>Welkom, romeo@verona.it!</div>
          </div>
          <div class="ghost-cursor"><svg viewBox="0 0 24 24"><path d="M4 2l16 10-7 1.5L9 21z" fill="#fff" stroke="#222B45" stroke-width="1.6" stroke-linejoin="round"/></svg></div>
          <div class="pick-tip"></div>
        </div>
        <div class="rec-code lab-panel">
          <div class="rec-head"><span class="rec-dot"></span><span data-rec-state>Klaar om op te nemen</span> · <code>tests/vrienden.spec.ts</code></div>
          <pre><code></code></pre>
        </div>
      </div>
      <div class="lab-controls lab-row">
        <button class="btn btn-mint" type="button" data-rec>▶ Neem op</button>
        <span class="lab-note">Let op: geen enkele <code>wait</code> in de code. Dat is auto-wait.</span>
      </div>`;
    const stage = $('.mock-browser', mount);
    const s = (k) => $(`[data-s="${k}"]`, stage);
    const cursor = $('.ghost-cursor', stage);
    const tip = $('.pick-tip', stage);
    const codeEl = $('.rec-code pre code', mount);
    const dot = $('.rec-dot', mount);
    const state = $('[data-rec-state]', mount);
    const btn = $('[data-rec]', mount);
    const steps = [
      { code: "import { test, expect } from '@playwright/test';" },
      { code: '' },
      { code: "test('test', async ({ page }) => {" },
      { url: 'https://theater.example/vrienden', code: "  await page.goto('https://theater.example/vrienden');" },
      { target: 'email', tip: "getByLabel('E-mail')", code: "  await page.getByLabel('E-mail').click();" },
      { target: 'email', type: 'romeo@verona.it', tip: "getByLabel('E-mail')", code: "  await page.getByLabel('E-mail').fill('romeo@verona.it');" },
      { target: 'password', type: '••••••••••', tip: "getByLabel('Wachtwoord')", code: "  await page.getByLabel('Wachtwoord').fill('Balkon123!');" },
      { target: 'submit', tip: "getByRole('button', { name: 'Word vriend' })", code: "  await page.getByRole('button', { name: 'Word vriend' }).click();", then: () => { s('success').hidden = false; } },
      { target: 'success', tip: '✓ Assert visibility', code: "  await expect(page.getByText('Welkom, romeo@verona.it!')).toBeVisible();" },
      { code: '});' },
    ];
    let run = 0;
    function reset() {
      s('url').textContent = 'about:blank';
      s('email').textContent = '';
      s('password').textContent = '';
      s('success').hidden = true;
      codeEl.innerHTML = '';
      tip.classList.remove('is-on');
      $$('.is-picked', stage).forEach((e) => e.classList.remove('is-picked'));
      cursor.style.transform = 'translate(12px, 12px)';
    }
    function addLine(code) {
      $$('.rec-line', codeEl).forEach((l) => l.classList.remove('is-new'));
      const line = document.createElement('span');
      line.className = 'rec-line is-new';
      line.innerHTML = highlight(code, 'ts') + '\n';
      codeEl.appendChild(line);
    }
    function pointAt(el) {
      const sr = stage.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const x = r.left - sr.left + Math.min(r.width / 2, 60);
      const y = r.top - sr.top + r.height / 2;
      cursor.style.transform = `translate(${x}px, ${y}px)`;
      return { x: r.left - sr.left, y: r.top - sr.top };
    }
    async function play() {
      const me = ++run;
      reset();
      dot.classList.add('is-on');
      state.textContent = 'Recording…';
      btn.disabled = true;
      for (const step of steps) {
        if (me !== run) return;
        if (step.url) {
          await sleep(300);
          s('url').textContent = step.url.replace('https://', '');
        }
        if (step.target) {
          const el = s(step.target);
          const pos = pointAt(el);
          await sleep(650);
          el.classList.add('is-picked');
          tip.textContent = step.tip;
          tip.style.left = `${Math.max(4, pos.x)}px`;
          tip.style.top = `${Math.max(4, pos.y - 26)}px`;
          tip.classList.add('is-on');
          await sleep(500);
          if (step.type) {
            for (const ch of step.type) {
              if (me !== run) return;
              el.textContent += ch;
              await sleep(45);
            }
          }
          if (step.then) step.then();
        }
        addLine(step.code);
        await sleep(step.target ? 450 : 160);
        if (step.target) {
          s(step.target).classList.remove('is-picked');
          tip.classList.remove('is-on');
        }
      }
      dot.classList.remove('is-on');
      state.textContent = 'Opname klaar';
      btn.disabled = false;
      btn.textContent = '↺ Opnieuw opnemen';
    }
    reset();
    codeEl.innerHTML = '<span class="tok-c">// Druk op ▶ Neem op en kijk wat de souffleur fluistert…</span>';
    btn.addEventListener('click', play);
  };

  // Lab II — Terugspoelen ---------------------------------------------------
  labs.trace = (mount) => {
    const base = { url: 'about:blank', email: '', pw: '', success: false };
    const actions = [
      {
        name: 'page.goto', ms: 412,
        before: base,
        after: { url: 'theater.example/vrienden', email: '', pw: '', success: false },
        details: 'Call\n  page.goto · 412ms\n  url: "https://theater.example/vrienden"\n\nLog\n  navigating to "https://theater.example/vrienden", waiting until "load"',
      },
      {
        name: "getByLabel('E-mail').fill", ms: 38, target: 'email',
        before: { url: 'theater.example/vrienden', email: '', pw: '', success: false },
        after: { url: 'theater.example/vrienden', email: 'julia@verona.it', pw: '', success: false },
        details: "Call\n  locator.fill · 38ms\n  locator: getByLabel('E-mail')\n  value: \"julia@verona.it\"\n\nLog\n  waiting for getByLabel('E-mail')\n  locator resolved to <input id=\"email\" type=\"email\">\n  fill(\"julia@verona.it\")",
      },
      {
        name: "getByLabel('Wachtwoord').fill", ms: 31, target: 'password',
        before: { url: 'theater.example/vrienden', email: 'julia@verona.it', pw: '', success: false },
        after: { url: 'theater.example/vrienden', email: 'julia@verona.it', pw: '••••••••', success: false },
        details: "Call\n  locator.fill · 31ms\n  locator: getByLabel('Wachtwoord')\n\nLog\n  waiting for getByLabel('Wachtwoord')\n  locator resolved to <input id=\"password\" type=\"password\">",
      },
      {
        name: "getByRole('button').click", ms: 96, target: 'submit', click: true,
        before: { url: 'theater.example/vrienden', email: 'julia@verona.it', pw: '••••••••', success: false },
        after: { url: 'theater.example/vrienden/welkom', email: 'julia@verona.it', pw: '••••••••', success: true },
        details: "Call\n  locator.click · 96ms\n  locator: getByRole('button', { name: 'Word vriend' })\n\nLog\n  waiting for getByRole('button', { name: 'Word vriend' })\n  attempting click action\n    waiting for element to be visible, enabled and stable\n    element is visible, enabled and stable\n    scrolling into view if needed\n    performing click action\n  click action done",
      },
      {
        name: "expect(locator('.welkom')).toHaveText", ms: 5000, target: 'success', fail: true,
        before: { url: 'theater.example/vrienden/welkom', email: 'julia@verona.it', pw: '••••••••', success: true },
        after: { url: 'theater.example/vrienden/welkom', email: 'julia@verona.it', pw: '••••••••', success: true },
        details: '<span class="t-err">Error: expect(locator).toHaveText(expected) failed</span>\n\nLocator:  locator(\'.welkom\')\n<span class="t-exp">Expected: "Welkom, Julia Capulet!"</span>\n<span class="t-rec">Received: "Welkom, julia@verona.it!"</span>\nTimeout:  5000ms\n\nCall log\n  - expect.toHaveText with timeout 5000ms\n  - waiting for locator(\'.welkom\')\n  - 9 × locator resolved to &lt;p class="welkom"&gt;Welkom, julia@verona.it!&lt;/p&gt;\n      - unexpected value "Welkom, julia@verona.it!"',
        html: true,
      },
    ];
    mount.innerHTML = `
      <div class="trace">
        <div class="trace-film lab-panel" role="group" aria-label="Tijdlijn"></div>
        <ol class="trace-actions lab-panel" aria-label="Acties"></ol>
        <div class="trace-right">
          <div class="trace-tabs" role="group" aria-label="Snapshot">
            <button type="button" data-snap="before" aria-pressed="false">Before</button>
            <button type="button" data-snap="after" aria-pressed="true">After</button>
          </div>
          <div class="mock-browser" aria-hidden="true">
            <div class="mock-bar"><span class="mock-dots"><i></i><i></i><i></i></span><span class="mock-url" data-t="url"></span></div>
            <div class="mock-page">
              <h4>Word vriend van het theater</h4>
              <div class="mock-field">E-mail<div class="mock-input" data-t="email"></div></div>
              <div class="mock-field">Wachtwoord<div class="mock-input" data-t="password"></div></div>
              <div class="mock-btn" data-t="submit">Word vriend</div>
              <div class="mock-success" data-t="success">Welkom, julia@verona.it!</div>
            </div>
          </div>
          <pre class="trace-details lab-panel" aria-live="polite"></pre>
        </div>
      </div>
      <p class="lab-note">Zie je het? Het formulier werkt prima. De fout zit in de verwachte waarde. Precies wat je in Opdracht 4 zelf gaat veroorzaken.</p>`;
    const film = $('.trace-film', mount);
    const list = $('.trace-actions', mount);
    const snap = $('.mock-browser', mount);
    const t = (k) => $(`[data-t="${k}"]`, snap);
    const details = $('.trace-details', mount);
    let idx = actions.length - 1;
    let mode = 'after';
    actions.forEach((a, i) => {
      const f = h(`<button type="button" style="--w:${Math.max(1, Math.log10(a.ms)).toFixed(2)}" class="${a.fail ? 'is-fail' : ''}" aria-label="${esc(a.name)} (${a.ms} ms)"></button>`);
      f.addEventListener('click', () => select(i));
      film.appendChild(f);
      const li = h(`<li><button type="button" class="${a.fail ? 'is-fail' : ''}"><span class="t-name">${esc(a.name)}</span><span class="t-ms">${a.ms >= 1000 ? (a.ms / 1000).toFixed(1) + 's' : a.ms + 'ms'}</span></button></li>`);
      $('button', li).addEventListener('click', () => select(i));
      list.appendChild(li);
    });
    $$('[data-snap]', mount).forEach((b) =>
      b.addEventListener('click', () => {
        mode = b.dataset.snap;
        render();
      }),
    );
    function select(i) {
      idx = i;
      render();
    }
    function render() {
      const a = actions[idx];
      const st = mode === 'before' ? a.before : a.after;
      t('url').textContent = st.url;
      t('email').textContent = st.email;
      t('password').textContent = st.pw;
      t('success').hidden = !st.success;
      $$('.is-picked', snap).forEach((e) => e.classList.remove('is-picked'));
      $$('.trace-click', snap).forEach((e) => e.remove());
      if (a.target && !t(a.target).hidden) {
        t(a.target).classList.add('is-picked');
        if (a.click && mode === 'before') {
          const sr = snap.getBoundingClientRect();
          const r = t(a.target).getBoundingClientRect();
          const dotEl = h('<span class="trace-click"></span>');
          dotEl.style.left = `${r.left - sr.left + r.width / 2}px`;
          dotEl.style.top = `${r.top - sr.top + r.height / 2}px`;
          snap.appendChild(dotEl);
        }
      }
      if (a.html) details.innerHTML = a.details;
      else details.textContent = a.details;
      $$('button', film).forEach((b, k) => b.setAttribute('aria-current', String(k === idx)));
      $$('button', list).forEach((b, k) => b.setAttribute('aria-current', String(k === idx)));
      $$('[data-snap]', mount).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.snap === mode)));
    }
    render();
    window.addEventListener('resize', render);
  };

  // Lab III — Spotlight ------------------------------------------------------
  labs.spotlight = (mount) => {
    const actors = [
      { id: 'romeo', name: 'Romeo Montague', role: 'Hoofdrol · Romeo &amp; Julia', initials: 'RM', color: '#C0392B' },
      { id: 'julia', name: 'Julia Capulet', role: 'Hoofdrol · Romeo &amp; Julia', initials: 'JC', color: '#1A6D8C' },
      { id: 'hamlet', name: 'Prins Hamlet', role: 'Titelrol · Hamlet', initials: 'PH', color: '#5B3FA8' },
    ];
    const castHtml =
      '<div class="cast">\n' +
      actors
        .map(
          (a) => `  <div class="actor-card" data-testid="actor-${a.id}">
    <div class="actor-inner">
      <div class="actor-avatar" aria-hidden="true">${a.initials}</div>
      <div class="actor-text">
        <h4 class="actor-name">${a.name}</h4>
        <p class="actor-role">${a.role}</p>
      </div>
    </div>
    <button type="button">Boek kaartje</button>
  </div>`,
        )
        .join('\n') +
      '\n</div>';
    const examples = [
      "page.locator('div').filter({ hasText: 'Julia Capulet' })",
      "page.locator('div').filter({ hasText: 'Julia Capulet' }).nth(2)",
      "page.locator('div').filter({ hasText: 'Romeo' })",
      "page.getByText('Romeo')",
      "page.getByRole('heading', { name: 'Julia Capulet' })",
      "page.getByRole('button', { name: 'Boek kaartje' })",
      "page.getByTestId('actor-romeo').getByRole('button')",
    ];
    mount.innerHTML = `
      <div class="spot">
        <form class="spot-form" novalidate>
          <label for="spot-input">Jouw locator (gewoon Playwright-syntax)</label>
          <input id="spot-input" class="spot-input" type="text" spellcheck="false" autocomplete="off" autocapitalize="off">
          <button class="btn btn-mint" type="submit">Spot aan</button>
        </form>
        <div class="spot-chips" role="group" aria-label="Voorbeelden">${examples.map((x) => `<button type="button">${esc(x)}</button>`).join('')}</div>
        <div class="spot-stage" data-stage>${castHtml}</div>
        <div class="spot-out lab-panel" role="status" aria-live="polite"></div>
        <p class="spot-challenge" data-challenge>🎯 <strong>Uitdaging:</strong> zet precies één hele acteurkaart (die van Prins Hamlet) in de spotlight, zonder <code>nth()</code>, <code>first()</code> of <code>last()</code>. Tip: begin bij de CSS-klasse van de kaart.</p>
        <details class="spot-dom"><summary>Bekijk de HTML van het toneel (zoals in DevTools)</summary><pre><code></code></pre></details>
      </div>`;
    const input = $('#spot-input', mount);
    const stageEl = $('[data-stage]', mount);
    const out = $('.spot-out', mount);
    const challenge = $('[data-challenge]', mount);
    $('.spot-dom code', mount).innerHTML = esc(castHtml);

    const norm = (s) => String(s).replace(/\s+/g, ' ').trim();
    const textOf = (el) => norm(el.textContent);
    const matches = (text, want, exact) => {
      if (want instanceof RegExp) return want.test(text);
      if (exact) return text === norm(want);
      return text.toLowerCase().includes(norm(want).toLowerCase());
    };
    const uniq = (arr) => {
      const set = new Set(arr);
      return Array.from(stageEl.querySelectorAll('*')).filter((e) => set.has(e));
    };
    class StageError extends Error {}
    const ROLE_OF = (el) => {
      if (el.closest('[aria-hidden="true"]')) return null;
      if (el.getAttribute('role')) return el.getAttribute('role');
      const tag = el.tagName.toLowerCase();
      if (tag === 'button') return 'button';
      if (tag === 'a' && el.hasAttribute('href')) return 'link';
      if (/^h[1-6]$/.test(tag)) return 'heading';
      if (tag === 'img') return el.getAttribute('alt') === '' ? 'presentation' : 'img';
      if (tag === 'ul' || tag === 'ol') return 'list';
      if (tag === 'li') return 'listitem';
      if (tag === 'p') return 'paragraph';
      return null;
    };
    const accName = (el) => el.getAttribute('aria-label') || (el.tagName === 'IMG' ? el.getAttribute('alt') || '' : textOf(el));
    const KNOWN_ROLES = ['button', 'link', 'heading', 'img', 'list', 'listitem', 'paragraph', 'textbox', 'checkbox', 'article', 'navigation', 'main', 'region', 'dialog', 'cell', 'row', 'table', 'option', 'combobox', 'tab', 'menuitem', 'generic'];

    class Loc {
      constructor(resolve) { this._resolve = resolve; }
      _all() { return this._resolve(); }
      _scope(fn) { return new Loc(() => uniq(this._all().flatMap(fn))); }
      locator(sel, opts) {
        if (typeof sel !== 'string') throw new StageError('locator() verwacht een selector als tekst, bijv. locator(\'.actor-card\').');
        let l;
        try {
          stageEl.querySelector(sel);
          l = this._scope((el) => Array.from(el.querySelectorAll(sel)));
        } catch (e) {
          if (e instanceof StageError) throw e;
          throw new StageError(`"${sel}" is geen geldige CSS-selector.`);
        }
        return opts ? l.filter(opts) : l;
      }
      getByRole(role, o = {}) {
        if (!KNOWN_ROLES.includes(role)) throw new StageError(`Onbekende rol "${role}". Probeer bijv. 'heading', 'button' of 'paragraph'.`);
        return this._scope((el) =>
          Array.from(el.querySelectorAll('*')).filter(
            (x) =>
              ROLE_OF(x) === role &&
              (o.name === undefined || matches(norm(accName(x)), o.name, o.exact)) &&
              (o.level === undefined || Number(x.tagName[1]) === o.level),
          ),
        );
      }
      getByText(t, o = {}) {
        return this._scope((el) =>
          Array.from(el.querySelectorAll('*')).filter(
            (x) => matches(textOf(x), t, o.exact) && !Array.from(x.children).some((c) => matches(textOf(c), t, o.exact)),
          ),
        );
      }
      getByTestId(id) {
        return this._scope((el) => Array.from(el.querySelectorAll('[data-testid]')).filter((x) => (id instanceof RegExp ? id.test(x.dataset.testid) : x.dataset.testid === id)));
      }
      filter(o = {}) {
        return new Loc(() =>
          this._all().filter((el) => {
            if (o.hasText !== undefined && !matches(textOf(el), o.hasText)) return false;
            if (o.hasNotText !== undefined && matches(textOf(el), o.hasNotText)) return false;
            if (o.has && !o.has._all().some((x) => x !== el && el.contains(x))) return false;
            if (o.hasNot && o.hasNot._all().some((x) => x !== el && el.contains(x))) return false;
            return true;
          }),
        );
      }
      nth(i) {
        return new Loc(() => {
          const a = this._all();
          const k = i < 0 ? a.length + i : i;
          return a[k] ? [a[k]] : [];
        });
      }
      first() { return this.nth(0); }
      last() { return this.nth(-1); }
      and(other) { return new Loc(() => { const o = new Set(other._all()); return this._all().filter((e) => o.has(e)); }); }
      or(other) { return new Loc(() => uniq(this._all().concat(other._all()))); }
    }
    ['getByLabel', 'getByPlaceholder', 'getByAltText', 'getByTitle', 'frameLocator'].forEach((m) => {
      Loc.prototype[m] = () => {
        throw new StageError(`${m}() bestaat in Playwright, maar op dit oefentoneel staan geen elementen waar die bij past.`);
      };
    });
    ['click', 'dblclick', 'fill', 'check', 'hover', 'press', 'type', 'focus', 'textContent', 'innerText', 'isVisible', 'waitFor', 'count'].forEach((m) => {
      Loc.prototype[m] = function () { return this; };
    });
    const pageLoc = new Loc(() => [stageEl]);

    function describe(el) {
      const tag = el.tagName.toLowerCase();
      const cn = el.className.replace(/\bis-lit\b/, '').trim();
      const cls = cn ? ` class="${cn}"` : '';
      const tid = el.dataset.testid ? ` data-testid="${el.dataset.testid}"` : '';
      let txt = textOf(el);
      if (txt.length > 34) txt = txt.slice(0, 33) + '…';
      return `<${tag}${cls}${tid}>${txt}</${tag}>`;
    }

    function clearLights() {
      $$('.is-lit', stageEl).forEach((e) => {
        e.classList.remove('is-lit');
        e.removeAttribute('data-hit');
        e.style.removeProperty('--hx');
      });
      stageEl.classList.remove('is-dim');
    }

    function run(src) {
      clearLights();
      out.classList.remove('is-ok', 'is-err');
      let code = String(src).trim().replace(/^await\s+/, '').replace(/;\s*$/, '');
      code = code.replace(/^(const|let|var)\s+[\w$]+\s*=\s*(await\s+)?/, '');
      const exp = code.match(/^expect\(\s*([\s\S]+?)\s*\)\s*\.\s*(not\s*\.\s*)?to\w+\([\s\S]*\)$/);
      if (exp) code = exp[1];
      if (!code) {
        out.innerHTML = 'Typ een locator, bijvoorbeeld <code>page.getByText(\'Romeo\')</code>, of kies een voorbeeld.';
        return;
      }
      let loc;
      try {
        loc = new Function('page', `"use strict"; return (${code}\n);`)(pageLoc);
      } catch (e) {
        out.classList.add('is-err');
        let msg;
        if (e instanceof StageError) msg = e.message;
        else if (e instanceof SyntaxError) msg = `Dat is nog geen geldige code: ${e.message}. Check je haakjes en quotes.`;
        else if (e instanceof TypeError && /is not a function/.test(e.message)) msg = `Die methode kent dit oefentoneel niet (${e.message}). Probeer locator, getByRole, getByText, getByTestId, filter, nth, first of last.`;
        else msg = e.message;
        out.innerHTML = `<span class="o-err">✗ ${esc(msg)}</span>`;
        return;
      }
      if (!(loc instanceof Loc)) {
        out.classList.add('is-err');
        out.innerHTML = '<span class="o-err">✗ Dit is geen locator.</span> Begin met <code>page.</code>, bijvoorbeeld <code>page.getByRole(\'heading\')</code>.';
        return;
      }
      let els;
      try {
        els = loc._all();
      } catch (e) {
        out.classList.add('is-err');
        out.innerHTML = `<span class="o-err">✗ ${esc(e.message)}</span>`;
        return;
      }
      stageEl.classList.add('is-dim');
      els.forEach((el, i) => {
        el.classList.add('is-lit');
        el.setAttribute('data-hit', els.length > 1 ? String(i + 1) : '✓');
        el.style.setProperty('--hx', `${i * 22}px`);
      });
      const tips = [];
      if (/\.nth\(/.test(code)) tips.push('nth() werkt, maar is fragiel: verandert de volgorde of de nesting, dan staat er ineens iemand anders in de spotlight. Zie Opdracht 7 😉');
      if (els.length > 1 && /locator\(\s*['"]div['"]\s*\)/.test(code)) tips.push('locator(\'div\') is heel breed: elke geneste div die de tekst bevat telt mee. Begin specifieker.');
      if (els.length > 1 && /hasText:\s*['"]Romeo['"]/.test(code)) tips.push('hasText zoekt naar een stukje tekst, niet hoofdlettergevoelig. "Romeo & Julia" staat ook op de kaart van Julia!');
      let html;
      if (els.length === 0) {
        out.classList.add('is-err');
        html = `<span class="o-err">✗ 0 elementen gevonden</span>\nPlaywright blijft nu wachten (auto-wait) tot het element verschijnt… en faalt na de timeout:\n  waiting for ${esc(code.replace(/^page\./, ''))}`;
      } else if (els.length === 1) {
        out.classList.add('is-ok');
        html = `<span class="o-ok">✓ Precies 1 element</span>\n  ${esc(describe(els[0]))}\nKlaar voor een actie zoals .click().`;
      } else {
        out.classList.add('is-err');
        html = `<span class="o-err">Error: strict mode violation: ${esc(code.replace(/^page\./, ''))} resolved to ${els.length} elements:</span>\n${els.map((el, i) => `    ${i + 1}) ${esc(describe(el))}`).join('\n')}`;
      }
      if (tips.length) html += `\n\n<span class="o-tip">💡 ${tips.map(esc).join('\n💡 ')}</span>`;
      out.innerHTML = html;

      const won = els.length === 1 && els[0].classList.contains('actor-card') && els[0].dataset.testid === 'actor-hamlet' && !/\.(nth|first|last)\(/.test(code);
      if (won && !challenge.classList.contains('is-won')) {
        challenge.classList.add('is-won');
        challenge.innerHTML = '🎉 <strong>Uitdaging gehaald!</strong> Eén hele kaart, geen nth(). Precies de techniek die je in Opdracht 7 en 8 op de Cerios Clinic loslaat.';
        const r = challenge.getBoundingClientRect();
        confetti.burst(r.left + 30, r.top + 10, 24);
      }
    }

    $('.spot-form', mount).addEventListener('submit', (e) => {
      e.preventDefault();
      run(input.value);
    });
    $$('.spot-chips button', mount).forEach((b) =>
      b.addEventListener('click', () => {
        input.value = b.textContent;
        run(input.value);
      }),
    );
    input.value = examples[0];
    run(input.value);
  };

  // Lab IV — Improvisatie vs. script ------------------------------------------
  labs.pom = (mount) => {
    const shows = [['Hamlet', 2], ['Macbeth', 4], ['Othello', 1]];
    const improv = () =>
      ["import { test, expect } from '@playwright/test';", '']
        .concat(
          ...shows.map(([show, n], i) => [
            `test('kaartjes voor ${show}', async ({ page }) => {`,
            "  await page.goto('https://theater.example/');",
            "  await page.getByRole('link', { name: 'Kaartverkoop' }).click();",
            `  await page.getByLabel('Voorstelling').selectOption('${show}');`,
            `  await page.getByLabel('Aantal').fill('${n}');`,
            "  await page.getByRole('button', { name: '@BTN@' }).click();",
            "  await expect(page.getByText('Bedankt voor je bestelling')).toBeVisible();",
            '});',
          ].concat(i < shows.length - 1 ? [''] : [])),
        );
    const pomFile = [
      "import { type Page, type Locator } from '@playwright/test';",
      '',
      'export class BoxOfficePage {',
      '  readonly show: Locator;',
      '  readonly amount: Locator;',
      '  readonly checkout: Locator;',
      '  readonly thanks: Locator;',
      '',
      '  constructor(private readonly page: Page) {',
      "    this.show = page.getByLabel('Voorstelling');",
      "    this.amount = page.getByLabel('Aantal');",
      "    this.checkout = page.getByRole('button', { name: '@BTN@' });",
      "    this.thanks = page.getByText('Bedankt voor je bestelling');",
      '  }',
      '',
      '  async open() {',
      "    await this.page.goto('https://theater.example/');",
      "    await this.page.getByRole('link', { name: 'Kaartverkoop' }).click();",
      '  }',
      '',
      '  async buyTickets(show: string, amount: number) {',
      '    await this.show.selectOption(show);',
      '    await this.amount.fill(String(amount));',
      '    await this.checkout.click();',
      '  }',
      '}',
    ];
    const scriptTests = () =>
      ["import { test, expect } from '@playwright/test';", "import { BoxOfficePage } from '../pageObjects/box-office-page';", '']
        .concat(
          ...shows.map(([show, n], i) => [
            `test('kaartjes voor ${show}', async ({ page }) => {`,
            '  const boxOffice = new BoxOfficePage(page);',
            '  await boxOffice.open();',
            `  await boxOffice.buyTickets('${show}', ${n});`,
            '  await expect(boxOffice.thanks).toBeVisible();',
            '});',
          ].concat(i < shows.length - 1 ? [''] : [])),
        );
    mount.innerHTML = `
      <div class="pom-tabs" role="tablist" aria-label="Versie">
        <button type="button" role="tab" id="pom-tab-improv" aria-controls="pom-panel" aria-selected="true">Improvisatie (opgenomen)</button>
        <button type="button" role="tab" id="pom-tab-script" aria-controls="pom-panel" aria-selected="false">Script (Page Object)</button>
      </div>
      <div class="pom-stats" aria-live="polite"></div>
      <div class="lab-row" style="margin-bottom:14px">
        <button class="btn btn-mint" type="button" data-director>🎬 Regisseur: maak van ‘Afrekenen’ ‘Betalen’</button>
      </div>
      <div class="pom-grid" id="pom-panel" role="tabpanel" aria-labelledby="pom-tab-improv"></div>
      <p class="lab-note">Zie je in het script nog herhaling (<code>new BoxOfficePage(page)</code>)? In Akte VIII zie je hoe custom fixtures in <code>my-test.ts</code> dat oplossen.</p>`;
    let view = 'improv';
    let renamed = false;
    const grid = $('.pom-grid', mount);
    const stats = $('.pom-stats', mount);
    function fileHtml(name, lines, countHeat) {
      const counts = {};
      if (countHeat) lines.forEach((l) => { if (l.trim() && l.trim() !== '});') counts[l] = (counts[l] || 0) + 1; });
      const body = lines
        .map((l) => {
          const text = l.replace('@BTN@', renamed ? 'Betalen' : 'Afrekenen');
          const heat = countHeat ? Math.min(3, counts[l] || 0) : 0;
          const changed = renamed && l.includes('@BTN@');
          return `<span class="pom-line${changed ? ' is-changed' : ''}" data-heat="${heat}">${highlight(text, 'ts') || ' '}</span>`;
        })
        .join('');
      return `<div class="pom-file lab-panel"><h4>${esc(name)}</h4><pre><code>${body}</code></pre></div>`;
    }
    function render() {
      const files = view === 'improv' ? [['tests/kaartverkoop.spec.ts', improv()]] : [['pageObjects/box-office-page.ts', pomFile], ['tests/kaartverkoop.spec.ts', scriptTests()]];
      grid.innerHTML = files.map(([n, l]) => fileHtml(n, l, view === 'improv')).join('');
      grid.setAttribute('aria-labelledby', `pom-tab-${view}`);
      const all = files.flatMap((f) => f[1]);
      const code = all.filter((l) => l.trim() && !/^\s*[})]+;?$/.test(l));
      const counts = {};
      code.forEach((l) => { counts[l] = (counts[l] || 0) + 1; });
      const repeated = code.filter((l) => counts[l] > 1).length;
      const edits = all.filter((l) => l.includes('@BTN@')).length;
      stats.innerHTML = `
        <div class="pom-stat"><strong>${code.length}</strong><span>regels code</span></div>
        <div class="pom-stat"><strong>${repeated}</strong><span>regels herhaald</span></div>
        <div class="pom-stat"><strong>${edits}</strong><span>${edits === 1 ? 'plek' : 'plekken'} aanpassen bij een nieuwe knoptekst</span></div>`;
      $$('[role="tab"]', mount).forEach((t) => t.setAttribute('aria-selected', String(t.id === `pom-tab-${view}`)));
    }
    $$('[role="tab"]', mount).forEach((t) =>
      t.addEventListener('click', () => {
        view = t.id.replace('pom-tab-', '');
        render();
      }),
    );
    const dir = $('[data-director]', mount);
    dir.addEventListener('click', () => {
      renamed = !renamed;
      dir.textContent = renamed ? '↺ Terug naar ‘Afrekenen’' : '🎬 Regisseur: maak van ‘Afrekenen’ ‘Betalen’';
      render();
    });
    render();
  };

  // Lab V — Backstage pass ---------------------------------------------------
  labs.backstage = (mount) => {
    mount.innerHTML = `
      <div class="bs">
        <div class="bs-controls lab-panel">
          <div><label for="bs-tests">Aantal UI-testen: <output id="bs-tests-out">40</output></label><input id="bs-tests" type="range" min="1" max="300" value="40"></div>
          <div><label for="bs-login">Inloggen via Keycloak duurt: <output id="bs-login-out">4 s</output></label><input id="bs-login" type="range" min="1" max="15" value="4"></div>
          <div><label for="bs-runs">Testruns per dag: <output id="bs-runs-out">6</output></label><input id="bs-runs" type="range" min="1" max="30" value="6"></div>
        </div>
        <div class="bs-bars lab-panel">
          <div class="bs-bar without"><span>Elke test logt zelf in</span><div class="track"><div class="fill"></div></div><span class="lab-note" data-o="without"></span></div>
          <div class="bs-bar with"><span>Eén keer inloggen + storage state</span><div class="track"><div class="fill"></div></div><span class="lab-note" data-o="with"></span></div>
          <p class="bs-saved"><strong data-o="saved"></strong><span data-o="week"></span></p>
        </div>
        <div class="bs-json">
          <p class="lab-note">Zo ziet de backstage pass eruit: een JSON-bestand met cookies en local storage, bijvoorbeeld <code>playwright/.auth/user.json</code>.</p>
          <div class="code"><pre><code data-lang="json">{
  "cookies": [
    { "name": "SESSION", "value": "a1b2c3…", "domain": "theater.example", "path": "/",
      "httpOnly": true, "secure": true, "sameSite": "Lax", "expires": 1798761600 }
  ],
  "origins": [
    {
      "origin": "https://theater.example",
      "localStorage": [
        { "name": "auth.token", "value": "eyJhbGciOiJSUzI1NiIs…" }
      ]
    }
  ]
}</code></pre></div>
        </div>
      </div>`;
    enhanceCode(mount);
    const fmt = (s) => {
      s = Math.round(s);
      if (s < 60) return `${s} s`;
      const m = Math.floor(s / 60);
      if (m < 60) return `${m} min ${s % 60 ? (s % 60) + ' s' : ''}`.trim();
      return `${Math.floor(m / 60)} u ${m % 60} min`;
    };
    const tests = $('#bs-tests', mount);
    const login = $('#bs-login', mount);
    const runs = $('#bs-runs', mount);
    const o = (k) => $(`[data-o="${k}"]`, mount);
    function render() {
      const n = Number(tests.value);
      const l = Number(login.value);
      const r = Number(runs.value);
      $('#bs-tests-out', mount).textContent = n;
      $('#bs-login-out', mount).textContent = `${l} s`;
      $('#bs-runs-out', mount).textContent = r;
      const without = n * l;
      const withPass = l;
      $('.without .fill', mount).style.width = '100%';
      $('.with .fill', mount).style.width = `${Math.max(1.5, (withPass / without) * 100)}%`;
      o('without').textContent = `${n} × ${l} s = ${fmt(without)} per run aan inloggen`;
      o('with').textContent = `1 × ${l} s = ${fmt(withPass)} per run (setup project)`;
      o('saved').textContent = `${fmt(without - withPass)} sneller per run`;
      o('week').textContent = `Dat is ${fmt((without - withPass) * r * 5)} per werkweek, alleen al aan inloggen.`;
    }
    [tests, login, runs].forEach((i) => i.addEventListener('input', render));
    render();
  };

  // Lab VI — Zaallicht -----------------------------------------------------------
  labs.zaallicht = (mount) => {
    mount.innerHTML = `
      <div class="zl-grid">${Object.entries(SIMS)
        .map(([k, [name, desc]]) => `<button type="button" data-sim="${k}" aria-pressed="false"><strong>${name}</strong><span>${desc}</span></button>`)
        .join('')}</div>
      <div class="zl-swatches"><span class="lab-note">Test met kleurenblindheid: zie je nog het verschil tussen <em>gefaald</em> en <em>geslaagd</em>?</span><i style="background:#E2574C" title="gefaald"></i><i style="background:#2EAD33" title="geslaagd"></i></div>
      <p class="lab-note">Daarom verandert de knop <strong>Gespeeld</strong> niet alleen van kleur, maar ook van gezicht. Kleur alleen is nooit genoeg (WCAG 1.4.1). axe vindt veel problemen automatisch, maar zo voelt het voor de bezoeker.</p>`;
    $$('[data-sim]', mount).forEach((b) => b.addEventListener('click', () => setSim(b.dataset.sim)));
  };

  // Lab VII — Ensemble ---------------------------------------------------------
  labs.ensemble = (mount) => {
    const files = [
      { name: 'kaartverkoop', tests: [4, 3, 3] },
      { name: 'foyer', tests: [2, 2] },
      { name: 'zaal', tests: [5, 2, 2, 1] },
      { name: 'garderobe', tests: [3] },
    ];
    mount.innerHTML = `
      <div class="en-controls lab-panel">
        <div><label for="en-workers">workers: <output id="en-workers-out">1</output></label><br><input id="en-workers" type="range" min="1" max="6" value="1"></div>
        <label><input type="checkbox" id="en-fully"> fullyParallel</label>
        <fieldset><legend>projects:</legend>
          <label><input type="checkbox" data-proj="chromium" checked> chromium</label>
          <label><input type="checkbox" data-proj="firefox"> firefox</label>
          <label><input type="checkbox" data-proj="webkit"> webkit</label>
        </fieldset>
        <button class="btn btn-mint" type="button" data-play>▶ Speel de voorstelling</button>
      </div>
      <div class="code en-config"><pre><code data-lang="ts"></code></pre></div>
      <div class="en-board lab-panel" aria-hidden="true"></div>
      <div class="en-total" aria-live="polite"></div>
      <div class="en-legend"><span><i style="background:#8fd6f0"></i>chromium</span><span><i style="background:#ffb38a"></i>firefox</span><span><i style="background:#c7b3ff"></i>webkit</span><span>4 testbestanden · 10 testen · 1 blokje = 1 test of 1 bestand</span></div>`;
    const workersIn = $('#en-workers', mount);
    const fully = $('#en-fully', mount);
    const board = $('.en-board', mount);
    const total = $('.en-total', mount);
    const configCode = $('.en-config code', mount);
    let playTimer = null;
    const actor = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>';
    function schedule() {
      const w = Number(workersIn.value);
      const projects = $$('[data-proj]', mount).filter((c) => c.checked).map((c) => c.dataset.proj);
      const jobs = [];
      for (const p of projects) {
        for (const f of files) {
          if (fully.checked) f.tests.forEach((d, i) => jobs.push({ p, label: `${f.name} #${i + 1}`, d }));
          else jobs.push({ p, label: f.name, d: f.tests.reduce((a, b) => a + b, 0) });
        }
      }
      const free = new Array(w).fill(0);
      const rows = Array.from({ length: w }, () => []);
      for (const j of jobs) {
        let k = 0;
        for (let i = 1; i < w; i++) if (free[i] < free[k]) k = i;
        rows[k].push({ ...j, start: free[k] });
        free[k] += j.d;
      }
      const serial = jobs.reduce((a, j) => a + j.d, 0);
      return { w, projects, rows, makespan: Math.max(0, ...free), serial };
    }
    function render() {
      const s = schedule();
      $('#en-workers-out', mount).textContent = s.w;
      configCode.innerHTML = highlight(
        `export default defineConfig({\n  fullyParallel: ${fully.checked},\n  workers: ${s.w},\n  projects: [\n${s.projects.map((p) => `    { name: '${p}', use: { ...devices['${p === 'chromium' ? 'Desktop Chrome' : p === 'firefox' ? 'Desktop Firefox' : 'Desktop Safari'}'] } },`).join('\n')}\n  ],\n});`,
        'ts',
      );
      configCode.parentElement.dataset.lang = 'playwright.config.ts';
      const scale = s.serial || 1;
      board.innerHTML = s.rows
        .map((row, i) => {
          const jobs = row
            .map((j) => `<span class="en-job ${j.p}" style="left:${(j.start / scale) * 100}%;width:${(j.d / scale) * 100}%;animation-delay:${reduceMotion ? 0 : j.start * 30}ms" title="${j.p}: ${j.label} (${j.d}s)">${j.label}</span>`)
            .join('');
          return `<div class="en-row"><span class="en-actor">${actor}Acteur ${i + 1}${row.length ? '' : ' 💤'}</span><div class="en-track">${jobs}</div></div>`;
        })
        .join('');
      if (!s.projects.length) {
        total.innerHTML = '<div class="pom-stat"><strong>0 s</strong><span>Geen project gekozen: geen voorstelling!</span></div>';
        return;
      }
      const speed = s.makespan ? s.serial / s.makespan : 1;
      const idle = s.rows.filter((r) => !r.length).length;
      total.innerHTML = `
        <div class="pom-stat"><strong>${s.makespan} s</strong><span>speelduur van de voorstelling</span></div>
        <div class="pom-stat"><strong>${s.serial} s</strong><span>als één acteur alles achter elkaar speelt</span></div>
        <div class="pom-stat"><strong>${speed.toFixed(1)}×</strong><span>sneller${idle ? ` · ${idle} ${idle === 1 ? 'acteur wacht' : 'acteurs wachten'} in de coulissen` : ''}</span></div>`;
    }
    function play() {
      const s = schedule();
      $$('.en-playhead', board).forEach((p) => p.remove());
      clearInterval(playTimer);
      const scale = s.serial || 1;
      const heads = $$('.en-track', board).map((t) => {
        const ph = document.createElement('span');
        ph.className = 'en-playhead';
        t.appendChild(ph);
        return ph;
      });
      const durMs = reduceMotion ? 0 : Math.min(5000, 300 * s.makespan);
      const t0 = performance.now();
      playTimer = setInterval(() => {
        const k = durMs ? Math.min(1, (performance.now() - t0) / durMs) : 1;
        heads.forEach((ph) => { ph.style.left = `${(k * s.makespan * 100) / scale}%`; });
        if (k >= 1) clearInterval(playTimer);
      }, 30);
    }
    [workersIn, fully, ...$$('[data-proj]', mount)].forEach((i) => i.addEventListener('input', render));
    $('[data-play]', mount).addEventListener('click', play);
    render();
  };

  // Lab VIII — De recensie -------------------------------------------------------
  labs.recensie = (mount) => {
    const items = [
      ['pageObjects/', 'Hoe zijn de Page Objects opgezet?'],
      ['tests/', 'Hoe zijn de testen gestructureerd?'],
      ['tests/my-test.ts', 'Wat zijn custom fixtures en hoe werken ze?'],
      ['enums/MenuItem.ts', 'Hoe worden navigatie-items beheerd met een enum?'],
      ['playwright.config.ts', 'Welke configuratiekeuzes zijn gemaakt?'],
    ];
    const saved = store.get('review', {});
    mount.innerHTML = `
      <ol class="rc-list">${items
        .map(
          ([file, q], i) => `<li class="rc-item lab-panel"><div><code>${file}</code><p>${q}</p></div>
          <div class="rc-choice" role="group" aria-label="Oordeel over ${file}">
            <button type="button" data-i="${i}" data-v="mine">Mijn regie</button><button type="button" data-i="${i}" data-v="tie">Gelijk</button><button type="button" data-i="${i}" data-v="trainer">De trainer</button>
          </div></li>`,
        )
        .join('')}</ol>
      <div class="rc-summary lab-panel" aria-live="polite"><div class="rc-stars"></div><div><strong data-rc-head></strong><p class="rc-quote" data-rc-quote></p></div></div>`;
    function render() {
      $$('.rc-choice button', mount).forEach((b) => b.setAttribute('aria-pressed', String(saved[b.dataset.i] === b.dataset.v)));
      const votes = Object.values(saved);
      const n = votes.length;
      const mine = votes.filter((v) => v === 'mine').length;
      const trainer = votes.filter((v) => v === 'trainer').length;
      $('.rc-stars', mount).textContent = '★'.repeat(n) + '☆'.repeat(items.length - n);
      $('.rc-stars', mount).setAttribute('aria-label', `${n} van ${items.length} onderdelen beoordeeld`);
      let head;
      let quote;
      if (!n) {
        head = 'Nog geen recensie.';
        quote = 'Elke ster staat voor een onderdeel dat je bewust hebt vergeleken.';
      } else if (trainer > mine) {
        head = '“Leerzame voorstelling. De regisseur had nog een paar trucs in petto.”';
        quote = 'Pak er één truc uit en bouw hem na in je eigen project.';
      } else if (mine > trainer) {
        head = '“Verrassende eigen interpretatie, de trainer kan hier nog wat van leren!”';
        quote = 'Vertel de trainer waarom; dat is precies het gesprek waar het om gaat.';
      } else {
        head = '“Twee regisseurs, één stuk. Beide het bekijken waard.”';
        quote = 'Appels en peren? “Well, we’re both fruit.”';
      }
      $('[data-rc-head]', mount).textContent = head;
      $('[data-rc-quote]', mount).textContent = quote;
    }
    $$('.rc-choice button', mount).forEach((b) =>
      b.addEventListener('click', () => {
        if (saved[b.dataset.i] === b.dataset.v) delete saved[b.dataset.i];
        else saved[b.dataset.i] = b.dataset.v;
        store.set('review', saved);
        render();
      }),
    );
    render();
  };

  // ------------------------------------------------------------------ pauze facts
  const facts = [
    'Wist je dat… Playwright sinds januari 2020 bestaat, gemaakt door het team achter Puppeteer?',
    'Wist je dat… “playwright” Engels is voor toneelschrijver? Vandaar de maskers in het logo.',
    'Wist je dat… Playwright zijn eigen browsers meebrengt? Nooit meer driver-updates.',
    'Wist je dat… een nieuwe browser context per test maar een handvol milliseconden kost?',
    'Wist je dat… je Codegen ook vanuit de terminal start met npx playwright codegen?',
    'Wist je dat… je een trace ook kunt openen op trace.playwright.dev, zonder iets te installeren?',
    'Wist je dat… Playwright er is voor Node.js, Python, Java en .NET?',
    'Wist je dat… web-first assertions automatisch opnieuw proberen tot de conditie klopt of de timeout verloopt?',
  ];
  let factIdx = 0;
  $$('[data-next-fact]').forEach((b) =>
    b.addEventListener('click', () => {
      factIdx = (factIdx + 1) % facts.length;
      $('[data-fact]').textContent = facts[factIdx];
    }),
  );

  // ------------------------------------------------------------------ actions & keys
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const a = el.dataset.action;
    if (a === 'theme') toggleTheme();
    else if (a === 'help') $('#help').showModal();
    else if (a === 'present') openPresenter();
    else if (a === 'present-close') closePresenter();
    else if (a === 'slide-next') showSlide(slideIdx + 1);
    else if (a === 'slide-prev') showSlide(slideIdx - 1);
    else if (a === 'curtain') showCurtain();
    else if (a === 'sim-off') setSim(null);
    else if (a === 'applause') {
      applause();
      confetti.rain(160);
    } else if (a === 'print') printBravo();
    else if (a === 'reset') {
      if (window.confirm('Weet je zeker dat je alle voortgang (gespeelde scènes, naam en recensie) wilt wissen?')) {
        ['played', 'name', 'review', 'curtainSeen', 'cleanup'].forEach((k) => store.del(k));
        location.reload();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!curtain.hidden) {
      if (e.key === 'Escape') {
        e.preventDefault();
        skipCurtain();
      }
      return;
    }
    if (!presenter.hidden) {
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); showSlide(slideIdx + 1); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); showSlide(slideIdx - 1); }
      else if (e.key === 'Home') showSlide(0);
      else if (e.key === 'End') showSlide(slides.length - 1);
      else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { e.preventDefault(); closePresenter(); }
      else if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else if (presenter.requestFullscreen) presenter.requestFullscreen().catch(() => {});
      }
      return;
    }
    if ($('#help').open) return;
    if (e.key === 'Escape') {
      if (sim) setSim(null);
      hideToast();
      return;
    }
    const t = e.target;
    if (t.closest && t.closest('input, textarea, select, [contenteditable="true"], .lab, [role="tablist"]')) return;
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); goAct(1); break;
      case 'ArrowLeft': e.preventDefault(); goAct(-1); break;
      case 'p': case 'P': openPresenter(); break;
      case 'c': case 'C': showCurtain(); break;
      case 't': case 'T': toggleTheme(); break;
      case '?': $('#help').showModal(); break;
      default: break;
    }
  });

  // ------------------------------------------------------------------ boot
  enhanceCode(document);
  $$('.lab-mount').forEach((m) => {
    const fn = labs[m.dataset.lab];
    if (!fn) return;
    try {
      fn(m);
    } catch (err) {
      m.innerHTML = '<p class="lab-note">Deze repetitie kon niet starten in deze browser. De opdrachten werken gewoon.</p>';
      if (window.console) console.error(err);
    }
  });
  renderProgress(false);
  onScroll();

  const urlCurtain = /[?&]doek\b/.test(location.search);
  if (!reduceMotion && (urlCurtain || (!store.get('curtainSeen', false) && !location.hash))) showCurtain();
  else afterCurtain();
})();
