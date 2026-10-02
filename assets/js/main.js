/* ==========================================================
   WebsiteResultImanuel - main.js
   1. Intro hero
   2. Wajah: kedip, kedip sebelah, ikut gerak kursor
   3. Reveal saat scroll (About, Creative Work's)
   4. Scroll scene: kartu frame 4 keluar dari folder frame 3
   5. Tilt kartu saat hover
   6. Tombol kembali ke atas
   ========================================================== */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ---------- 1. Intro hero ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')));

  /* ---------- 2. Wajah ---------- */
  const hero = $('#home');
  const face = $('#face');

  if (face && !reduceMotion) {

    // wajah sedikit menoleh mengikuti kursor
    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = face.getBoundingClientRect();
      const nx = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), -1, 1);
      const ny = clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2), -1, 1);
      face.style.setProperty('--ry', nx.toFixed(3));
      face.style.setProperty('--rx', ny.toFixed(3));
    });
    hero.addEventListener('pointerleave', () => {
      face.style.setProperty('--ry', 0);
      face.style.setProperty('--rx', 0);
    });
  }

  /* ---------- 3. Reveal saat scroll ---------- */
  const revealTargets = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- 4. Scroll scene: folder -> kartu ---------- */
  const folders  = $$('.folder');
  const section4 = $('#projects');
  const slots    = $$('#projects .card-slot');
  const cards    = slots.map((slot) => $('.card', slot));

  // pasangan tiap kartu dengan folder terdekat (berdasarkan posisi horizontal)
  let deltas = [];

  const measure = () => {
    if (!folders.length || !cards.length) return;
    const sy = window.scrollY;
    const sx = window.scrollX;
    const fc = folders.map((f) => {
      const r = f.getBoundingClientRect();
      return { x: r.left + sx + r.width / 2, y: r.top + sy + r.height * 0.45 };
    });
    deltas = slots.map((slot) => {
      const r = slot.getBoundingClientRect();
      const c = { x: r.left + sx + r.width / 2, y: r.top + sy + r.height / 2 };
      let best = fc[0];
      fc.forEach((f) => { if (Math.abs(f.x - c.x) < Math.abs(best.x - c.x)) best = f; });
      return { dx: best.x - c.x, dy: best.y - c.y };
    });
  };

  const update = () => {
    if (!section4 || !deltas.length) return;
    const vh = window.innerHeight;
    const top = section4.getBoundingClientRect().top;
    // p = 0 saat frame 4 baru mengintip, p = 1 saat sudah masuk layar
    const p = reduceMotion ? 1 : clamp((vh * 0.95 - top) / (vh * 0.85));

    folders.forEach((f) => f.style.setProperty('--lift', clamp(p * 1.5).toFixed(3)));

    cards.forEach((card, i) => {
      const t = clamp((p - i * 0.07) / 0.7);
      const e = easeOutCubic(t);
      const d = deltas[i];
      card.style.setProperty('--x', `${((1 - e) * d.dx).toFixed(1)}px`);
      card.style.setProperty('--y', `${((1 - e) * d.dy).toFixed(1)}px`);
      card.style.setProperty('--s', (0.22 + 0.78 * e).toFixed(3));
      card.style.setProperty('--r', `${((1 - e) * (i % 2 ? 14 : -14)).toFixed(1)}deg`);
      card.style.setProperty('--o', clamp(t * 3).toFixed(3));
      card.style.pointerEvents = t < 0.8 ? 'none' : 'auto';
    });
  };

  /* ---------- 6. Tombol kembali ke atas ---------- */
  const toTop = $('.to-top');
  if (toTop) {
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      if (toTop) toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
      ticking = false;
    });
  };

  const refresh = () => { measure(); update(); };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', refresh);
  window.addEventListener('load', refresh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  refresh();

  /* ---------- 5. Tilt kartu saat hover ---------- */
  if (!reduceMotion) {
    $$('.card__face').forEach((face3d) => {
      face3d.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const r = face3d.getBoundingClientRect();
        face3d.style.setProperty('--ry', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        face3d.style.setProperty('--rx', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      });
      face3d.addEventListener('pointerleave', () => {
        face3d.style.setProperty('--ry', 0);
        face3d.style.setProperty('--rx', 0);
      });
    });
  }


    /* ---------- 7. Lightbox: buka gambar di halaman yang sama ---------- */
  const lightbox = $('#lightbox');
  if (lightbox) {
    const lbImg   = $('.lightbox__img', lightbox);
    const lbClose = $('.lightbox__close', lightbox);
    let lastFocus = null;

    const openLightbox = (src, alt) => {
      lastFocus = document.activeElement;
      lbImg.src = src;
      lbImg.alt = alt || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      lbClose.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
      if (lastFocus) lastFocus.focus();
    };

    // klik kartu -> buka pratinjau (tanpa pindah halaman / tab baru)
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.card__face');
      if (!link) return;
      e.preventDefault();
      const img = $('img', link);
      if (img) openLightbox(img.currentSrc || img.src, img.alt);
    });

    // klik area gelap atau tombol X -> tutup
    lightbox.addEventListener('click', (e) => {
      if (e.target !== lbImg) closeLightbox();
    });

    // tombol Esc -> tutup
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
    });
  }

    /* ---------- 8. Work 3: video & efek keluar dari box ---------- */
  // video tanpa suara: jalan saat terlihat, berhenti saat di luar layar
  const w3Videos = $$('#projects-3 video');
  w3Videos.forEach((v) => {
    v.muted = true;
    v.defaultMuted = true;
    v.loop = true;
    v.playsInline = true;
  });

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      });
    }, { threshold: 0.25 });
    w3Videos.forEach((v) => videoObserver.observe(v));
  } else {
    w3Videos.forEach((v) => v.play().catch(() => {}));
  }

  // PNG bergeser sedikit mengikuti kursor di dalam box
  if (!reduceMotion) {
    $$('.pop').forEach((pop) => {
      pop.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const r = pop.getBoundingClientRect();
        pop.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        pop.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      });
      pop.addEventListener('pointerleave', () => {
        pop.style.setProperty('--mx', 0);
        pop.style.setProperty('--my', 0);
      });
    });
  }
  
})();
