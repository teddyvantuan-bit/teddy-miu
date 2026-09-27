/* Invitation extras: scroll animations, falling petals, personal guest name,
   maps, RSVP + wishes (Google Sheet backend) and the wedding-gift box. */
(() => {
  const CFG = window.WEDDING_CONFIG || {};
  const t = key => weddingI18n.t(key);
  const params = new URLSearchParams(location.search);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal (fade up / slide in, 1.3s ease-out) ---------- */
  function mark(selector, kind) {
    document.querySelectorAll(selector).forEach(el => {
      if (!el.dataset.reveal) el.dataset.reveal = kind;
    });
  }
  mark('.pair-one, .parents-grid > div:first-child, .bride-card', 'left');
  mark('.pair-two, .parents-grid > div:last-child, .groom-card', 'right');
  mark('.story-photo-one, .wide-photo, .details-photo, .closing-photo', 'zoom');
  mark([
    '.intro-overlay > *', '.guest-card > *', '.story-heading > *', '.story-copy > *',
    '.love-header', '.love-section > .poem', '.love-section > .large-serif',
    '.details-intro > :not(.photo)', '.parents > .eyebrow', '.couple-names',
    '.events > :not(.event-card)', '.calendar-section > *', '.album > :not(.album-grid)',
    '.closing > :not(.photo)', '.rsvp > *'
  ].join(','), 'up');
  // Stagger siblings so groups flow in one after another.
  const groups = new Map();
  document.querySelectorAll('[data-reveal]').forEach(el => {
    const list = groups.get(el.parentElement) || [];
    list.push(el);
    groups.set(el.parentElement, list);
  });
  groups.forEach(list => list.forEach((el, i) => { el.style.setProperty('--reveal-delay', `${Math.min(i, 4) * 0.15}s`); }));

  const albumObserverTargets = [];
  document.querySelectorAll('.album-item').forEach((el, i) => {
    el.dataset.reveal = 'up';
    el.style.setProperty('--reveal-delay', `${(i % 2) * 0.12}s`);
    albumObserverTargets.push(el);
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    document.documentElement.classList.add('reveal-ready');
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
  }
  // Hero text rises in on load.
  document.querySelectorAll('.hero-top > *, .hero-center > *, .hero-bottom > *').forEach((el, i) => {
    el.classList.add('hero-rise');
    el.style.setProperty('--reveal-delay', `${0.3 + i * 0.18}s`);
  });

  /* ---------- Falling petals ---------- */
  const canvas = document.getElementById('petals');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    const colors = ['#f6d6d6', '#f2c4c7', '#fbe9e7', '#ffffff', '#e8b4b8'];
    let W = 0, H = 0, dpr = 1, petals = [], running = true, last = 0;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(26, Math.max(12, W / 30)));
      while (petals.length < count) petals.push(newPetal(true));
      petals.length = count;
    }
    function newPetal(anywhere) {
      return {
        x: Math.random() * W,
        y: anywhere ? Math.random() * H : -20,
        r: 5 + Math.random() * 7,
        vy: 18 + Math.random() * 26,
        sway: 14 + Math.random() * 26,
        phase: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 1.6,
        rot: Math.random() * Math.PI,
        heart: Math.random() < 0.18,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.55 + Math.random() * 0.4
      };
    }
    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x + Math.sin(p.phase) * p.sway, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.heart ? '#e7a1a8' : p.color;
      ctx.beginPath();
      if (p.heart) {
        const s = p.r * 0.9;
        ctx.moveTo(0, s * 0.35);
        ctx.bezierCurveTo(-s, -s * 0.4, -s * 0.45, -s * 1.1, 0, -s * 0.45);
        ctx.bezierCurveTo(s * 0.45, -s * 1.1, s, -s * 0.4, 0, s * 0.35);
      } else {
        ctx.moveTo(0, -p.r);
        ctx.bezierCurveTo(p.r * 0.9, -p.r * 0.5, p.r * 0.6, p.r * 0.7, 0, p.r);
        ctx.bezierCurveTo(-p.r * 0.6, p.r * 0.7, -p.r * 0.9, -p.r * 0.5, 0, -p.r);
      }
      ctx.fill();
      ctx.restore();
    }
    function frame(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      ctx.clearRect(0, 0, W, H);
      petals.forEach((p, i) => {
        p.y += p.vy * dt;
        p.phase += dt * 0.9;
        p.rot += p.spin * dt;
        if (p.y > H + 20) petals[i] = newPetal(false);
        drawPetal(p);
      });
      requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) { last = performance.now(); requestAnimationFrame(frame); }
    });
    requestAnimationFrame(now => { last = now; frame(now); });
  }

  /* ---------- Personal guest name: ?to=Anh%20Minh&side=bride ---------- */
  const invitee = (params.get('to') || '').trim().slice(0, 60);
  const invitedSide = params.get('side');
  if (invitee) {
    document.getElementById('guest-card').hidden = false;
    document.getElementById('guest-card-name').textContent = invitee;
    const nameInput = document.getElementById('guest-name');
    if (nameInput && !nameInput.value) nameInput.value = invitee;
    document.querySelector('#wish-form [name="name"]').value = invitee;
  }
  if (invitedSide === 'bride' || invitedSide === 'groom') {
    const radio = document.querySelector(`#rsvp-form input[name="side"][value="${invitedSide}"]`);
    if (radio) radio.checked = true;
  }

  /* ---------- Maps ---------- */
  function mapLinks(key) {
    const place = (CFG.maps || {})[key] || '';
    const isUrl = /^https?:\/\//.test(place);
    return {
      embed: isUrl ? '' : `https://maps.google.com/maps?q=${encodeURIComponent(place)}&z=15&output=embed`,
      open: isUrl ? place : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place)}`
    };
  }
  document.querySelectorAll('[data-map]').forEach(box => {
    const { embed } = mapLinks(box.dataset.map);
    if (!embed) { box.remove(); return; }
    const frame = document.createElement('iframe');
    frame.title = 'Google Maps';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.src = embed;
    box.append(frame);
  });
  document.querySelectorAll('[data-map-link]').forEach(a => { a.href = mapLinks(a.dataset.mapLink).open; });

  /* ---------- Modals ---------- */
  let lastFocus = null;
  function openModal(id) {
    const modal = document.getElementById(id);
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    const first = modal.querySelector('input:not(.trap), textarea, button:not(.modal-close)');
    if (first) setTimeout(() => first.focus(), 50);
  }
  function closeModal(modal) {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.modal-close')) closeModal(modal); });
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal:not([hidden])').forEach(closeModal);
  });

  /* ---------- Backend (Google Apps Script) ---------- */
  const API = (CFG.rsvpUrl || '').trim();
  async function send(payload) {
    const res = await fetch(API, { method: 'POST', body: JSON.stringify(payload) });
    const data = await res.json();
    if (!data.ok) throw new Error('rejected');
  }
  function setStatus(el, key, isError, arg) {
    const msg = t(key);
    el.textContent = typeof msg === 'function' ? msg(arg) : msg;
    el.classList.toggle('error', !!isError);
  }

  /* RSVP */
  const form = document.getElementById('rsvp-form');
  const status = document.getElementById('form-status');
  const attendOnly = form.querySelector('.attend-only');
  if (!API) {
    form.hidden = true;
    document.getElementById('rsvp-closed').hidden = false;
  }
  form.addEventListener('change', () => {
    attendOnly.hidden = form.elements.attending.value !== 'yes';
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    if (!name) return setStatus(status, 'needName', true);
    if (!form.elements.attending.value) return setStatus(status, 'needAttending', true);
    const yes = form.elements.attending.value === 'yes';
    if (yes && !form.elements.side.value) return setStatus(status, 'needSide', true);
    const sideText = { bride: 'Nhà Gái (18/10)', groom: 'Nhà Trai (25/10)', both: 'Cả hai ngày' };
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    setStatus(status, 'sending');
    try {
      await send({
        type: 'rsvp', name, phone: form.elements.phone.value.trim(),
        attending: yes ? 'Có' : 'Không',
        side: yes ? sideText[form.elements.side.value] : '',
        guests: yes ? form.elements.guests.value : '0',
        wish: form.elements.wish.value.trim(), invitee, website: form.elements.website.value
      });
      setStatus(status, yes ? 'rsvpThanksYes' : 'rsvpThanksNo', false, name);
      form.classList.add('sent');
      if (form.elements.wish.value.trim()) addLocalWish(name, form.elements.wish.value.trim());
    } catch (_) {
      setStatus(status, 'sendFailed', true);
    } finally {
      button.disabled = false;
    }
  });

  /* Wishes */
  const wishForm = document.getElementById('wish-form');
  const wishStatus = wishForm.querySelector('.form-status');
  document.getElementById('wish-button').addEventListener('click', () => {
    if (!API) { document.getElementById('rsvp').scrollIntoView({ behavior: 'smooth' }); return; }
    wishStatus.textContent = '';
    openModal('wish-modal');
  });
  wishForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name = wishForm.elements.name.value.trim();
    const wish = wishForm.elements.wish.value.trim();
    if (!name) return setStatus(wishStatus, 'needName', true);
    if (!wish) return setStatus(wishStatus, 'needWish', true);
    const button = wishForm.querySelector('button[type="submit"]');
    button.disabled = true;
    setStatus(wishStatus, 'sending');
    try {
      await send({ type: 'wish', name, wish, invitee, website: wishForm.elements.website.value });
      setStatus(wishStatus, 'wishThanks');
      wishForm.elements.wish.value = '';
      addLocalWish(name, wish);
      setTimeout(() => closeModal(document.getElementById('wish-modal')), 1400);
    } catch (_) {
      setStatus(wishStatus, 'sendFailed', true);
    } finally {
      button.disabled = false;
    }
  });

  /* Wish feed: recent wishes float above the toolbar, like messages. */
  const feed = document.getElementById('wish-feed');
  const feedList = feed.querySelector('.wish-feed-list');
  let wishes = [], cursor = 0, feedTimer = null, feedClosed = false;
  try { feedClosed = sessionStorage.getItem('wish-feed-closed') === '1'; } catch (_) {}
  function bubble(w) {
    const item = document.createElement('p');
    item.className = 'wish-bubble';
    const who = document.createElement('strong');
    who.textContent = `${w.name}: `;
    item.append(who, document.createTextNode(w.wish));
    return item;
  }
  function tick() {
    if (!wishes.length) return;
    const item = bubble(wishes[cursor % wishes.length]);
    cursor++;
    feedList.append(item);
    requestAnimationFrame(() => item.classList.add('in'));
    const items = feedList.querySelectorAll('.wish-bubble:not(.out)');
    if (items.length > Math.min(3, wishes.length)) {
      const old = items[0];
      old.classList.add('out');
      setTimeout(() => old.remove(), 500);
    }
  }
  function startFeed() {
    if (feedClosed || !wishes.length) return;
    feed.hidden = false;
    if (!feedTimer) { tick(); feedTimer = setInterval(tick, 3200); }
  }
  function addLocalWish(name, wish) {
    wishes.splice(cursor % (wishes.length || 1), 0, { name, wish });
    feedClosed = false;
    startFeed();
  }
  // Keep the feed out of the way while the guest is filling in the RSVP form.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => feed.classList.toggle('muted', entry.isIntersecting), { threshold: 0.05 })
      .observe(document.getElementById('rsvp'));
  }
  feed.querySelector('.wish-feed-close').addEventListener('click', () => {
    feed.hidden = true;
    feedClosed = true;
    clearInterval(feedTimer);
    feedTimer = null;
    try { sessionStorage.setItem('wish-feed-closed', '1'); } catch (_) {}
  });
  if (API) {
    fetch(API).then(r => r.json()).then(data => {
      wishes = (data.wishes || []).filter(w => w && w.name && w.wish);
      setTimeout(startFeed, 2500);
    }).catch(() => {});
  }

  /* ---------- Wedding gift ---------- */
  const gifts = (CFG.gifts || []).filter(g => g.account || g.qr);
  const giftButton = document.getElementById('gift-button');
  const giftList = document.querySelector('.gift-list');
  function renderGifts() {
    giftList.replaceChildren();
    gifts.forEach(g => {
      const card = document.createElement('div');
      card.className = 'gift-item';
      const label = document.createElement('span');
      label.className = 'gift-side';
      label.textContent = t(g.side === 'bride' ? 'giftBride' : 'giftGroom');
      card.append(label);
      if (g.qr) {
        const img = document.createElement('img');
        img.src = g.qr;
        img.alt = `QR ${g.name}`;
        img.loading = 'lazy';
        card.append(img);
      }
      const name = document.createElement('strong');
      name.textContent = g.name;
      card.append(name);
      if (g.bank) {
        const bank = document.createElement('small');
        bank.textContent = g.bank;
        card.append(bank);
      }
      if (g.account) {
        const row = document.createElement('div');
        row.className = 'gift-account';
        const num = document.createElement('code');
        num.textContent = g.account;
        const copy = document.createElement('button');
        copy.type = 'button';
        copy.textContent = t('copy');
        copy.addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(g.account.replace(/\s/g, '')); } catch (_) {}
          if (window.showToast) window.showToast(t('copied'));
        });
        row.append(num, copy);
        card.append(row);
      }
      giftList.append(card);
    });
  }
  if (gifts.length) {
    giftButton.hidden = false;
    renderGifts();
    giftButton.addEventListener('click', () => openModal('gift-modal'));
  }

  window.refreshExtras = () => { if (gifts.length) renderGifts(); };
})();
