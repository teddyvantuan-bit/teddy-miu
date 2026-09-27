/* Opening envelope: the guest taps the wax seal, the envelope opens, the letter
   rises, the curtains part, and the invitation (and the music) begins. */
(() => {
  const params = new URLSearchParams(location.search);
  const invitee = (params.get('to') || '').trim().slice(0, 60);
  const t = key => (window.weddingI18n ? weddingI18n.t(key) : '');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  root.classList.add('has-opening');

  const el = document.createElement('div');
  el.className = 'opening';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'Thiệp cưới Mỹ Dung & Tuấn');
  el.innerHTML = `
    <div class="op-curtain op-left"></div>
    <div class="op-curtain op-right"></div>
    <div class="op-sparkles" aria-hidden="true"></div>
    <div class="op-stage">
      <p class="op-eyebrow" data-i18n="opEyebrow">WEDDING INVITATION</p>
      <h1 class="op-names">Mỹ Dung <span>&amp;</span> Tuấn</h1>
      <p class="op-date">18 · 10 &nbsp;&amp;&nbsp; 25 · 10 · 2026</p>
      <button type="button" class="op-envelope" aria-label="Mở thiệp">
        <span class="op-back"></span>
        <span class="op-letter">
          <img src="assets/photos/1w4a0299.jpg" alt="" decoding="async" />
          <span class="op-letter-text">Save the date</span>
        </span>
        <span class="op-pocket"></span>
        <span class="op-flap"></span>
        <span class="op-seal"><span class="op-seal-half op-seal-l"></span><span class="op-seal-half op-seal-r"></span><span class="op-monogram">D<i>&amp;</i>T</span></span>
      </button>
      <div class="op-guest">
        <p data-i18n="dearGuest">Trân trọng kính mời</p>
        <strong class="op-guest-name"></strong>
      </div>
      <p class="op-hint"><span class="op-hand" aria-hidden="true">👆</span> <span data-i18n="opHint">Chạm vào con dấu để mở thiệp</span></p>
    </div>
    <div class="op-flash" aria-hidden="true"></div>`;
  document.body.prepend(el);
  document.body.classList.add('opening-lock');

  el.querySelector('.op-guest-name').textContent = invitee || t('opGuestDefault') || 'Quý khách';
  el.querySelectorAll('[data-i18n]').forEach(node => { const v = t(node.dataset.i18n); if (v) node.textContent = v; });

  // Twinkling gold dust.
  const dust = el.querySelector('.op-sparkles');
  for (let i = 0; i < 46; i++) {
    const s = document.createElement('i');
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${Math.random() * 100}%`;
    s.style.animationDelay = `${(Math.random() * 4).toFixed(2)}s`;
    s.style.animationDuration = `${(2.5 + Math.random() * 3).toFixed(2)}s`;
    const size = 1.5 + Math.random() * 2.8;
    s.style.width = s.style.height = `${size}px`;
    dust.append(s);
  }

  function burst() {
    const colors = ['#f7d774', '#fff4d6', '#e8b4b8', '#c91212', '#ffffff'];
    const cx = innerWidth / 2, cy = innerHeight / 2;
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('span');
      p.className = 'op-confetti';
      const angle = Math.random() * Math.PI * 2;
      const dist = 140 + Math.random() * Math.max(innerWidth, innerHeight) * 0.55;
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--dy', `${Math.sin(angle) * dist + 120}px`);
      p.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
      p.style.background = colors[i % colors.length];
      if (i % 4 === 0) { p.textContent = '♥'; p.classList.add('heart'); p.style.background = 'none'; p.style.color = colors[i % 3 === 0 ? 3 : 2]; }
      document.body.append(p);
      setTimeout(() => p.remove(), 2600);
    }
  }

  let opened = false;
  function open() {
    if (opened) return;
    opened = true;
    // A real tap, so browsers allow the music to start here.
    const music = document.getElementById('background-music');
    if (music && music.paused) music.play().catch(() => {});
    document.getElementById('music-hint')?.classList.remove('visible');

    if (reduceMotion) { finish(); return; }
    el.classList.add('is-opening');
    setTimeout(() => el.classList.add('is-flap'), 450);
    setTimeout(() => el.classList.add('is-letter'), 1050);
    setTimeout(() => { el.classList.add('is-flash'); burst(); }, 1900);
    setTimeout(() => {
      el.classList.add('is-curtain');
      root.classList.remove('has-opening');
      document.body.classList.add('opened');
      scrollTo(0, 0);
    }, 2150);
    setTimeout(finish, 3500);
  }
  function finish() {
    el.remove();
    document.body.classList.remove('opening-lock');
    root.classList.remove('has-opening');
    document.body.classList.add('opened');
    scrollTo(0, 0);
  }

  const envelope = el.querySelector('.op-envelope');
  envelope.addEventListener('click', open);
  el.addEventListener('click', e => { if (!e.target.closest('.op-envelope')) open(); });
  addEventListener('keydown', e => { if (!opened && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(); } });
})();
