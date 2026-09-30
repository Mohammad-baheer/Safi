/* ============================================================
   MOHAMMAD BAHEER SAFI — PORTFOLIO · script.js  (V2)
   Preloader · split-text · scramble · counters · custom cursor
   magnetic buttons · spotlight cards · tilt · parallax · nav
   All heavy effects are gated: touch devices & reduced-motion
   get a clean, fast, fully functional experience.
   ============================================================ */

(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine    = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ============================================================
     1) PRELOADER — counter 0→100, tricolor bar, curtain lift
     ============================================================ */
  const pre      = $('#preloader');
  const preBar   = $('.pre-bar i');
  const preCount = $('.pre-count');

  function releaseHero() { document.body.classList.add('loaded'); }

  if (reduced || !pre) {
    if (pre) pre.remove();
    releaseHero();
  } else {
    const T0 = performance.now();
    const DUR = 1200;
    const count = (t) => {
      const p = Math.min((t - T0) / DUR, 1);
      preCount.textContent = String(Math.floor(p * 100)).padStart(3, '0');
      preBar.style.transform = `scaleX(${p})`;
      if (p < 1) { requestAnimationFrame(count); return; }
      setTimeout(() => {
        pre.classList.add('done');   // curtain lifts
        releaseHero();               // hero animations fire
        setTimeout(() => pre.remove(), 1200);
      }, 220);
    };
    requestAnimationFrame(count);
  }

  /* ============================================================
     2) SPLIT-TEXT — wrap every word for staggered rise reveal
     ============================================================ */
  function splitWords(el) {
    let i = 0;
    (function walk(node) {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {                       // text node
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w  = document.createElement('span');
            const wi = document.createElement('span');
            w.className = 'w'; wi.className = 'wi';
            wi.style.setProperty('--i', i++);
            wi.textContent = part;
            w.append(wi); frag.append(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);                                    // into <em>, <span>…
        }
      });
    })(el);
  }
  $$('.split').forEach(splitWords);

  /* ============================================================
     3) SCRAMBLE-DECODE — matrix-style text lock-in
     ============================================================ */
  const GLYPHS = '!<>-_\\/[]{}—=+*^?#01';
  function scramble(el) {
    const nodes = [];
    (function walk(n) {
      n.childNodes.forEach(c => {
        if (c.nodeType === 3 && c.textContent.trim()) nodes.push(c);
        else if (c.nodeType === 1) walk(c);
      });
    })(el);

    nodes.forEach(node => {
      const original = node.textContent;
      const queue = [...original].map(ch => ({
        ch,
        end: 8 + Math.floor(Math.random() * 16),
      }));
      let frame = 0;
      (function run() {
        let out = '', done = 0;
        for (const q of queue) {
          if (frame >= q.end) { out += q.ch; done++; }
          else out += (q.ch === ' ') ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        node.textContent = out;
        frame++;
        if (done < queue.length) requestAnimationFrame(run);
        else node.textContent = original;
      })();
    });
  }

  /* ============================================================
     4) COUNTERS — eased count-up for the stats band
     ============================================================ */
  function countUp(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reduced) { el.textContent = target; return; }
    const DUR = 1500, T0 = performance.now();
    (function f(t) {
      const p = Math.min((t - T0) / DUR, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e);
      if (p < 1) requestAnimationFrame(f);
    })(T0);
  }

  /* ============================================================
     5) MOBILE MENU
     ============================================================ */
  const nav       = $('#nav');
  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');
  const menuOpen  = () => navLinks.classList.contains('open');

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
    if (open) nav.classList.remove('hide');
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', closeMenu));

  /* ============================================================
     6) SCROLL — progress bar, nav state, auto-hide, hero parallax
     ============================================================ */
  const progress  = $('#progress');
  const heroInner = $('.hero-inner');
  let lastY = 0;

  function onScroll() {
    const doc = document.documentElement;
    const y   = doc.scrollTop || window.scrollY || 0;
    const max = doc.scrollHeight - doc.clientHeight;

    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('scrolled', y > 40);

    /* hide nav scrolling down, show scrolling up */
    if (!menuOpen()) {
      if (y > lastY + 6 && y > 340) nav.classList.add('hide');
      else if (y < lastY - 6) nav.classList.remove('hide');
    }
    lastY = y;

    /* hero parallax fade */
    if (!reduced && heroInner && y < window.innerHeight) {
      heroInner.style.transform = `translateY(${y * 0.22}px)`;
      heroInner.style.opacity = String(Math.max(1 - y / (window.innerHeight * 0.85), 0));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================================
     7) REVEAL OBSERVER — reveals, terminal, split, scramble, stats
     ============================================================ */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      if (el.dataset.delay) el.style.transitionDelay = `${el.dataset.delay}ms`;
      el.classList.add('visible');
      if (el.classList.contains('term'))  el.classList.add('play');
      if (el.hasAttribute('data-scramble') && !reduced) scramble(el);
      if (el.classList.contains('stats')) $$('b[data-count]', el).forEach(countUp);
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal, .term, .split, .stats').forEach(el => io.observe(el));

  /* ============================================================
     8) SCROLL SPY — active nav link
     ============================================================ */
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      $$('#navLinks a').forEach(a =>
        a.classList.toggle('active', a.getAttribute('href') === `#${en.target.id}`));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ============================================================
     9) TYPEWRITER — rotating roles
     ============================================================ */
  const words = ['Cybersecurity', 'Software Engineering', 'Artificial Intelligence', 'Full-Stack Development', 'Problem Solving'];
  const typedEl = $('#typed');

  if (reduced) {
    typedEl.textContent = words[0];
  } else {
    let wi = 0, ci = words[0].length, deleting = true;
    (function tick() {
      const word = words[wi];
      typedEl.textContent = word.slice(0, ci);
      let delay = deleting ? 38 : 78;
      if (!deleting && ci === word.length)      { delay = 1700; deleting = true; }
      else if (deleting && ci === 0)            { deleting = false; wi = (wi + 1) % words.length; delay = 350; }
      else                                      { ci += deleting ? -1 : 1; }
      setTimeout(tick, delay);
    })();
  }

  /* ============================================================
     10) DESKTOP-ONLY MAGIC — cursor, magnet, spotlight, tilt, glow
     ============================================================ */
  const glow = $('#cursorGlow');
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');

  if (!fine || reduced) {
    if (glow) glow.remove();
    if (dot)  dot.remove();
    if (ring) ring.remove();
    return;   // touch / reduced-motion: stop here, site is fully functional
  }

  /* --- custom cursor: gradient dot + difference ring --- */
  if (dot && ring) {
    document.documentElement.classList.add('custom-cursor');
    document.body.classList.add('cursor-on');
    let mx = innerWidth / 2, my = innerHeight / 2, dx = mx, dy = my, rx = mx, ry = my;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener('mouseover', e => {
      document.body.classList.toggle('cursor-hover',
        !!e.target.closest('a, button, .chip, .tilt, .spot, .hamburger'));
    });
    document.documentElement.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on'));
    document.documentElement.addEventListener('mouseenter', () => document.body.classList.add('cursor-on'));

    (function loop() {
      dx += (mx - dx) * 0.55; dy += (my - dy) * 0.55;   // dot: fast
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;   // ring: lazy
      dot.style.transform  = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%) scale(var(--s))`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(var(--s))`;
      requestAnimationFrame(loop);
    })();
  }

  /* --- ambient glow follows cursor --- */
  if (glow) {
    let tx = innerWidth / 2, ty = innerHeight / 2, gx = tx, gy = ty;
    document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
  }

  /* --- magnetic buttons --- */
  $$('.magnet').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const px = (e.clientX - r.left - r.width / 2)  / r.width;
      const py = (e.clientY - r.top  - r.height / 2) / r.height;
      el.style.transform = `translate(${px * 14}px, ${py * 10}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  /* --- spotlight border-glow cards --- */
  $('.spot').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* --- 3D tilt --- */
  $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - 0.5;
      const py = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform =
        `perspective(900px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();
