/* ============================================================
   MOHAMMAD BAHEER SAFI — PORTFOLIO · script.js  (V4 — LIVING SITE)
   preloader · split-text · scramble · counters · custom cursor
   magnetic · spotlight · tilt · parallax · auto-hide nav
   V4: particle constellation · curtain transitions · sparks
   ripples · letter-hover · nav label flip · terminal loop
   Touch devices & reduced-motion get a clean, fast fallback.
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
        pre.classList.add('done');
        releaseHero();
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
        if (child.nodeType === 3) {
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
          walk(child);
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
    /* keep the nav "flat" until the overlay finished fading out,
       otherwise the returning blur/transform re-traps it mid-fade */
    setTimeout(() => {
      if (!navLinks.classList.contains('open')) nav.classList.remove('menu-open');
    }, 380);
  }

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
    /* backdrop-filter/transform on the nav would trap the fixed
       overlay inside it (containing-block rule) — keep nav clean */
    nav.classList.toggle('menu-open', open);
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

    if (!menuOpen()) {
      if (y > lastY + 6 && y > 340) nav.classList.add('hide');
      else if (y < lastY - 6) nav.classList.remove('hide');
    }
    lastY = y;

    /* hero parallax fade (desktop only — keeps phones buttery) */
    if (!reduced && fine && heroInner && y < window.innerHeight) {
      heroInner.style.transform = `translateY(${y * 0.22}px)`;
      heroInner.style.opacity = String(Math.max(1 - y / (window.innerHeight * 0.85), 0));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================================
     7) REVEAL OBSERVER — reveals, terminal loop, scramble, stats
     ============================================================ */
  function loopTerm(term) {
    term.classList.remove('play');
    void term.offsetWidth;                 // restart CSS animations
    term.classList.add('play');
    setTimeout(() => loopTerm(term), 12500);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      if (el.dataset.delay) el.style.transitionDelay = `${el.dataset.delay}ms`;
      el.classList.add('visible');
      if (el.classList.contains('term')) {
        el.classList.add('play');
        if (!reduced) setTimeout(() => loopTerm(el), 12500);
      }
      if (el.hasAttribute('data-scramble') && !reduced) scramble(el);
      if (el.classList.contains('stats')) $$('b[data-count]', el).forEach(countUp);
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  /* multi-direction reveal variants */
  [
    ['.monogram-card',   'fx-left'],
    ['.about-text .reveal', 'fx-right'],
    ['.skill-card',      'fx-zoom'],
    ['.term',            'fx-zoom'],
    ['.t-item',          'fx-right'],
    ['.contact .reveal', 'fx-zoom'],
  ].forEach(([sel, cls]) => $$(sel).forEach(el => el.classList.add(cls)));

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
     10) V4 — PER-LETTER HERO NAME (touch me!)
     ============================================================ */
  if (!reduced) {
    let ci2 = 0;
    $$('.hero-title .line > span').forEach(line => {
      const rebuild = (parent) => {
        [...parent.childNodes].forEach(node => {
          if (node.nodeType === 3) {
            const frag = document.createDocumentFragment();
            [...node.textContent].forEach(ch => {
              if (ch === ' ') { frag.append(' '); return; }
              const s = document.createElement('span');
              s.className = 'ch';
              s.textContent = ch;
              s.style.setProperty('--hc', (ci2++ % 2) ? 'var(--green-bright)' : 'var(--red-bright)');
              frag.append(s);
            });
            parent.replaceChild(frag, node);
          } else if (node.nodeType === 1) {
            rebuild(node);                       // into <em>
          }
        });
      };
      rebuild(line);
    });
  }

  /* ============================================================
     11) V4 — NAV LABEL FLIP (two-layer labels)
     ============================================================ */
  $$('#navLinks a:not(.nav-cta)').forEach(a => {
    const t = a.textContent.trim();
    a.innerHTML = `<span class="lbl"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;
  });

  /* ============================================================
     12) V4 — TRICOLOR CURTAIN PAGE TRANSITIONS
     ============================================================ */
  const curtain = $('#curtain');
  let transitioning = false;

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || reduced || transitioning || !curtain) return;
    const id = a.getAttribute('href');
    const target = id.length > 1 ? document.querySelector(id) : null;
    if (!target) return;

    e.preventDefault();
    closeMenu();
    transitioning = true;
    curtain.classList.add('in');

    /* failsafe watchdog: curtain can never stay stuck on screen */
    setTimeout(() => {
      if (!transitioning) return;
      curtain.classList.add('noanim');
      curtain.classList.remove('in', 'out');
      void curtain.offsetWidth;
      curtain.classList.remove('noanim');
      transitioning = false;
    }, 2600);

    setTimeout(() => {
      const prev = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      target.scrollIntoView();
      document.documentElement.style.scrollBehavior = prev;
      try { history.pushState(null, '', id); } catch (_) {}
      curtain.classList.add('out');
      setTimeout(() => {
        /* reset instantly & invisibly — panels must NOT sweep back */
        curtain.classList.add('noanim');
        curtain.classList.remove('in', 'out');
        void curtain.offsetWidth;
        curtain.classList.remove('noanim');
        transitioning = false;
      }, 1100);
    }, 560);
  });

  /* ============================================================
     13) V4 — SPARKS ON EVERY CLICK + RIPPLES ON TOUCHABLES
     ============================================================ */
  const SPARK_COLORS = ['#ff5147', '#2fd07d', '#f2f2ef'];

  if (!reduced) {
    document.addEventListener('pointerdown', (e) => {
      /* spark burst anywhere */
      if (document.querySelectorAll('.spark').length < 48) {
        for (let k = 0; k < 9; k++) {
          const s = document.createElement('span');
          s.className = 'spark';
          const ang  = Math.random() * Math.PI * 2;
          const dist = 26 + Math.random() * 54;
          s.style.left = `${e.clientX}px`;
          s.style.top  = `${e.clientY}px`;
          s.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
          s.style.setProperty('--dy', `${Math.sin(ang) * dist}px`);
          s.style.setProperty('--c', SPARK_COLORS[(Math.random() * 3) | 0]);
          document.body.append(s);
          s.addEventListener('animationend', () => s.remove(), { once: true });
        }
      }
      /* ripple inside buttons/chips */
      const t = e.target.closest('.btn, .chip, .socials a, .nav-cta');
      if (t) {
        const r = t.getBoundingClientRect();
        const size = Math.max(r.width, r.height);
        const rip = document.createElement('span');
        rip.className = 'ripple';
        rip.style.width = rip.style.height = `${size}px`;
        rip.style.left = `${e.clientX - r.left - size / 2}px`;
        rip.style.top  = `${e.clientY - r.top  - size / 2}px`;
        t.append(rip);
        rip.addEventListener('animationend', () => rip.remove(), { once: true });
      }
    }, { passive: true });
  }

  /* ============================================================
     14) V4 — LIVING PARTICLE CONSTELLATION BACKGROUND
     ============================================================ */
  if (!reduced) {
    const c = $('#bgCanvas');
    if (c) {
      const ctx = c.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const COLORS = ['211,32,17', '0,154,73', '242,242,239'];
      let W, H, ps = [], run = true;
      const mouse = { x: -1e4, y: -1e4 };

      const size = () => {
        W = c.width  = Math.floor(innerWidth  * dpr);
        H = c.height = Math.floor(innerHeight * dpr);
        c.style.width  = `${innerWidth}px`;
        c.style.height = `${innerHeight}px`;
      };
      const make = () => {
        const N = innerWidth < 760 ? 24 : 70;
        ps = Array.from({ length: N }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - .5) * .35 * dpr,
          vy: (Math.random() - .5) * .35 * dpr,
          r: (Math.random() * 1.6 + .6) * dpr,
          c: COLORS[(Math.random() * 3) | 0],
        }));
      };
      size(); make();
      addEventListener('resize', () => { size(); make(); }, { passive: true });
      addEventListener('mousemove', e => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });
      addEventListener('touchmove', e => {
        const t = e.touches[0];
        if (t) { mouse.x = t.clientX * dpr; mouse.y = t.clientY * dpr; }
      }, { passive: true });
      document.addEventListener('visibilitychange', () => {
        run = !document.hidden;
        if (run) requestAnimationFrame(tick);
      });

      const LINK = 110 * dpr;
      function tick() {
        if (!run) return;
        /* freeze the particle field while the curtain transitions —
           gives the GPU 100% of its budget to the wipe (mobile silk) */
        if (transitioning) { requestAnimationFrame(tick); return; }
        ctx.clearRect(0, 0, W, H);

        for (const p of ps) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x += W; else if (p.x > W) p.x -= W;
          if (p.y < 0) p.y += H; else if (p.y > H) p.y -= H;
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < 130 * dpr && d > .001) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, 6.2832);
          ctx.fillStyle = `rgba(${p.c},.55)`;
          ctx.fill();
        }
        ctx.lineWidth = dpr * .6;
        for (let i = 0; i < ps.length; i++) {
          for (let j = i + 1; j < ps.length; j++) {
            const a = ps[i], b = ps[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < LINK * LINK) {
              ctx.strokeStyle = `rgba(255,255,255,${(.05 * (1 - d2 / (LINK * LINK))).toFixed(3)})`;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  }

  /* ============================================================
     15) V4 — STATS SCRAMPLE ON HOVER (desktop)
     ============================================================ */
  if (fine && !reduced) {
    $$('.stat b').forEach(b => {
      b.parentElement.addEventListener('mouseenter', () => scramble(b));
    });
  }

  /* ============================================================
     16) DESKTOP-ONLY MAGIC — cursor, magnet, spotlight, tilt, glow
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

  /* --- custom cursor: gradient dot + trailing ring --- */
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
      dx += (mx - dx) * 0.55; dy += (my - dy) * 0.55;
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
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
  $$('.spot').forEach(el => {
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
