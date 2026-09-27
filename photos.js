/* Crops every wedding photo around the couple.
   Each [data-photo] element gets an <img>; its size/offset is computed from the
   detected face boxes so the people fill the frame whatever the box aspect. */
(() => {
  const DIR = 'assets/photos/';
  const DATA = window.PHOTO_DATA || {};
  const TWEAKS = window.PHOTO_TWEAKS || {};
  const MAX_ZOOM = 1.8;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  function crop(name, A) {
    const d = DATA[name] || { r: 2 / 3, f: [] };
    const t = TWEAKS[name] || {};
    const r = d.r; // image in units: width r, height 1
    const maxH = r > A ? 1 : r / A;
    let ch, cx, cy;
    if (d.f.length && !t.c) {
      const faces = d.f.map(([x, y, w, h]) => [x * r, y, w * r, h]);
      const fx0 = Math.min(...faces.map(f => f[0]));
      const fx1 = Math.max(...faces.map(f => f[0] + f[2]));
      const fy0 = Math.min(...faces.map(f => f[1]));
      const fy1 = Math.max(...faces.map(f => f[1] + f[3]));
      const fh = Math.max(...faces.map(f => f[3]));
      const top = fy0 - 0.5 * fh;
      const bottom = Math.min(1, fy0 + (t.body || 8.5) * fh);
      const bodyH = bottom - top;
      const needW = fx1 - fx0 + 3.2 * fh;
      ch = Math.max(bodyH / 0.84, needW / 0.82 / A);
      ch = clamp(ch / (t.z || 1), maxH / MAX_ZOOM, maxH);
      cx = (fx0 + fx1) / 2 + (t.dx || 0) * r;
      cy = Math.min(top + bodyH / 2, (fy0 + fy1) / 2 + 0.16 * ch) + (t.dy || 0);
    } else {
      const c = t.c || [0.5, 0.5];
      ch = clamp(maxH / (t.z || 1), maxH / MAX_ZOOM, maxH);
      cx = c[0] * r;
      cy = c[1];
    }
    const cw = ch * A;
    const x0 = clamp(cx - cw / 2, 0, r - cw);
    const y0 = clamp(cy - ch / 2, 0, 1 - ch);
    return { width: (r / cw) * 100, left: (-x0 / cw) * 100, top: (-y0 / ch) * 100 };
  }

  function place(frame) {
    const img = frame.querySelector('.ph-img');
    const W = frame.clientWidth, H = frame.clientHeight;
    if (!img || !W || !H) return;
    const c = crop(frame.dataset.photo, W / H);
    img.style.width = `${c.width}%`;
    img.style.left = `${c.left}%`;
    img.style.top = `${c.top}%`;
  }

  function mount(el, eager) {
    const name = el.dataset.photo;
    const frame = document.createElement('div');
    frame.className = 'ph-frame';
    frame.dataset.photo = name;
    const img = document.createElement('img');
    img.className = 'ph-img';
    img.alt = '';
    img.decoding = 'async';
    img.loading = eager ? 'eager' : 'lazy';
    img.src = DIR + name;
    img.addEventListener('load', () => frame.classList.add('loaded'), { once: true });
    frame.append(img);
    el.prepend(frame);
    place(frame);
    return frame;
  }

  const frames = [];
  document.querySelectorAll('[data-photo]:not(.ph-frame)').forEach(el => {
    frames.push(mount(el, el.classList.contains('hero')));
  });

  /* Album */
  const album = document.querySelector('.album-grid');
  const albumList = album ? album.dataset.photos.split(/\s+/).filter(Boolean) : [];
  albumList.forEach((name, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'album-item';
    const d = DATA[name];
    if (d && d.r > 1.2) btn.classList.add('wide');
    else if (i % 5 === 0) btn.classList.add('feature');
    btn.dataset.photo = name;
    btn.dataset.index = i;
    btn.setAttribute('aria-label', `${i + 1} / ${albumList.length}`);
    album.append(btn);
    frames.push(mount(btn, false));
  });

  const ro = new ResizeObserver(entries => entries.forEach(e => place(e.target)));
  frames.forEach(f => ro.observe(f));

  /* Lightbox: shows the full, uncropped photo */
  const box = document.getElementById('lightbox');
  if (!box || !albumList.length) return;
  const boxImg = box.querySelector('img');
  const counter = box.querySelector('.lb-count');
  let current = 0;
  function show(i) {
    current = (i + albumList.length) % albumList.length;
    boxImg.src = DIR + albumList[current];
    counter.textContent = `${current + 1} / ${albumList.length}`;
    [-1, 1].forEach(s => { new Image().src = DIR + albumList[(current + s + albumList.length) % albumList.length]; });
  }
  function open(i) {
    show(i);
    box.hidden = false;
    document.body.classList.add('lb-open');
    box.querySelector('.lb-close').focus();
  }
  function close() {
    box.hidden = true;
    document.body.classList.remove('lb-open');
  }
  album.addEventListener('click', e => {
    const item = e.target.closest('.album-item');
    if (item) open(Number(item.dataset.index));
  });
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', () => show(current - 1));
  box.querySelector('.lb-next').addEventListener('click', () => show(current + 1));
  box.addEventListener('click', e => { if (e.target === box) close(); });
  document.addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  let startX = null;
  box.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
