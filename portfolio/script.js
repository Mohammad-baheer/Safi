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
      $('#navLinks a').forEach(a =>
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
     12) V11 — SPIDEY: PROCEDURAL LIVING RIG (physics per frame)
     Pendulum sway · scroll-driven walk cycle · saccades · blinks
     breathing · momentum thread. All inline transforms in JS —
     immune to stale CSS. Never frozen, ever.
     ============================================================ */
  const spidey  = $('#spidey');
  const webLine = $('#webLine');
  const webP    = $('#webLineL');
  let transitioning = false;
  let autoScroll = null;
  let entered = false;
  let sVel = 0, off = 0, rot = 0, pendingDelta = 0;
  let lastYv = scrollY, lastT = performance.now();
  let idleSince = 0, nextAct = 0;
  let baseX = 0, baseY = 0;
  let mode = 'hang', modeUntil = 0, phase = 0;
  let th = 0, thV = 0, thRest = 0, nextRest = 0;
  let look = 0, lookT = 0, nextLook = 0;
  let blinkAt = 2200, blinkT0 = -1e9;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const n2 = (t, s) => Math.sin(t * s) * .6 + Math.sin(t * s * 1.7 + 1.3) * .4;
  const easeIO = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

  /* rig references + self-sufficient transform setup */
  const R = {};
  if (spidey) {
    R.sway = $('.sway', spidey); R.rig = $('.rig', spidey); R.head = $('.head', spidey);
    R.armL = $('.armL', spidey); R.armLf = $('.armL .fore', spidey);
    R.armR = $('.armR', spidey); R.armRf = $('.armR .fore', spidey);
    R.legL = $('.legL', spidey); R.legLf = $('.legL .fore', spidey);
    R.legR = $('.legR', spidey); R.legRf = $('.legR .fore', spidey);
    R.svg  = $('svg', spidey);
    R.eyes = $$('.eye', spidey);
    R.sway.style.transformBox = 'view-box';
    R.sway.style.transformOrigin = '60px -50px';
    R.rig.style.transformBox = 'view-box';
    R.rig.style.transformOrigin = '60px 75px';
    R.eyes.forEach(e => { e.style.transformBox = 'fill-box'; e.style.transformOrigin = 'center'; });
  }

  const handUp = () => innerWidth < 760 ? 52 : 68;
  const computeBase = () => {
    baseX = innerWidth - (innerWidth < 760 ? 62 : 108);
    baseY = innerHeight * 0.40;
  };
  computeBase();
  addEventListener('resize', () => {
    computeBase();
    if (reduced && entered) placeStatic();
  }, { passive: true });

  /* scroll-velocity + delta sampler */
  addEventListener('scroll', () => {
    const now = performance.now();
    const y = scrollY;
    const dt = Math.max(now - lastT, 1);
    sVel += ((y - lastYv) / dt - sVel) * 0.3;
    pendingDelta += y - lastYv;
    lastYv = y; lastT = now;
  }, { passive: true });

  /* ---- auto-scroll: INSTANT (<=600ms), no CSS-smooth hijack ---- */
  function scrollToTarget(el) {
    const startY = scrollY;
    const dist = el.getBoundingClientRect().top + startY - 84 - startY;
    if (Math.abs(dist) < 10) return;
    autoScroll = {
      t0: performance.now(), startY, dist,
      dur: Math.min(600, Math.max(280, Math.abs(dist) / 6)),
      dir: Math.sign(dist),
    };
    transitioning = true;
    mode = autoScroll.dir > 0 ? 'rappel' : 'climb';
    (function step(t) {
      if (!autoScroll) { transitioning = false; return; }
      const p = Math.min((t - autoScroll.t0) / autoScroll.dur, 1);
      window.scrollTo({ top: autoScroll.startY + autoScroll.dist * easeIO(p), behavior: 'instant' });
      if (p < 1) requestAnimationFrame(step);
      else {
        autoScroll = null; transitioning = false;
        mode = 'hang';
        idleSince = performance.now();
        nextAct = idleSince + 1200 + Math.random() * 1800;
      }
    })(performance.now());
  }
  ['wheel', 'touchstart'].forEach(ev =>
    addEventListener(ev, () => { if (autoScroll) { autoScroll = null; transitioning = false; } }, { passive: true }));

  /* ---- idle life scheduler ---- */
  function idleAction(t) {
    const acts = ['wave', 'flex', 'eat', 'look', 'wave', 'flex'];
    mode = acts[(Math.random() * acts.length) | 0];
    modeUntil = t + (mode === 'eat' ? 2400 : mode === 'flex' ? 1600 : mode === 'wave' ? 1500 : 1200);
    nextAct = t + 2000 + Math.random() * 3000;
    if (mode === 'eat') {
      spidey.classList.add('eating');
      setTimeout(() => spidey.classList.remove('eating'), 2400);
    }
  }

  function placeStatic() {
    spidey.style.transform = `translate3d(${baseX}px, ${baseY}px, 0)`;
    webP.setAttribute('d', `M ${baseX - 2} -6 Q ${baseX - 2} ${baseY / 2}, ${baseX - 6} ${baseY - handUp() + 6}`);
  }

  /* ---- THE LIVING RIG: every joint, every frame ---- */
  function spideyLoop(now) {
    const t = now, dt = 1 / 60;
    if (!entered) {
      spidey.style.transform = `translate3d(${baseX}px, -260px, 0)`;
      requestAnimationFrame(spideyLoop);
      return;
    }

    /* position spring + organic micro-jitter */
    off += (clamp(-sVel * 70, -130, 130) - off) * 0.26;
    rot += (clamp(sVel * 9, -16, 16) - rot) * 0.2;
    sVel *= 0.9;
    const jx = n2(t / 1000, 1.0) * 2.2, jy = n2(t / 1000, 1.4) * 2.6, jr = n2(t / 1000, 0.8) * 1.6;
    const x = baseX + jx, y = baseY + off + jy;
    spidey.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot + jr}deg)`;

    /* thread: momentum sag + sway coupling */
    phase += pendingDelta * 0.05; pendingDelta = 0;
    const hx = x - 6, hy = y - handUp() + 6;
    const sag = clamp(sVel * 40, -70, 70) + th * 60 + n2(t / 1000, 0.6) * 4;
    webP.setAttribute('d', `M ${hx + 4} -6 Q ${hx + 4 + sag} ${hy / 2}, ${hx} ${hy}`);

    /* mode machine */
    if (!autoScroll) {
      if (Math.abs(sVel) > 0.35) {
        mode = sVel > 0 ? 'rappel' : 'climb';
      } else if (mode === 'rappel' || mode === 'climb') {
        mode = 'hang';
        idleSince = t; nextAct = t + 1400 + Math.random() * 2200;
      } else if (mode !== 'hang' && t > modeUntil) {
        mode = 'hang';
      } else if (mode === 'hang' && idleSince && t > nextAct && !reduced) {
        idleAction(t);
      }
    }

    /* pendulum physics for body sway */
    if (t > nextRest) { thRest = (Math.random() - .5) * .10; nextRest = t + 1500 + Math.random() * 2500; }
    thV += (-6 * (th - thRest) - 2.2 * thV) * dt;
    th  += thV * dt;
    const swayDeg = th * 57.3;
    const lag = clamp(-thV * 40, -18, 18);

    /* limbs */
    let aL, aLf, aR, aRf, lL, lLf, lR, lRf;
    const moving = (mode === 'rappel' || mode === 'climb');
    if (moving) {
      /* legs STEP at your scroll speed — he truly comes with you */
      lL = 24 + Math.sin(phase) * 26;           lLf = 34 + Math.cos(phase) * 22;
      lR = 24 + Math.sin(phase + Math.PI) * 26; lRf = 34 + Math.cos(phase + Math.PI) * 22;
      aR = 46 + Math.sin(phase + Math.PI) * 12; aRf = 52 + Math.cos(phase) * 10;
    } else {
      lL = 8 + n2(t / 1000, .9) * 3 + lag * .5;  lLf = 12 + n2(t / 1000, .7) * 4 + lag;
      lR = -6 + n2(t / 1000, .8) * 3 + lag * .5; lRf = -12 + n2(t / 1000, .6) * 4 + lag;
      aR = 10 + n2(t / 1000, .8) * 3;            aRf = 14 + n2(t / 1000, .7) * 3;
    }
    aL = -152 + n2(t / 1000, 1.1) * 1.5; aLf = -6 + n2(t / 1000, .9) * 2;
    if (mode === 'wave')  { aL = -140 + Math.sin(t * .02) * 6;   aLf = 8 + Math.sin(t * .025) * 26; }
    if (mode === 'flex')  { const pu = Math.max(0, Math.sin(t * .012));
                            aL = -64 - pu * 10; aLf = -108 - pu * 14;
                            aR = 64 + pu * 10;  aRf = 108 + pu * 14; }
    if (mode === 'eat')   { aL = -96; aLf = -42 + Math.sin(t * .02) * 6; }
    if (mode === 'climb') { aR = -140 + Math.sin(phase) * 18; aRf = -10 + Math.cos(phase) * 10; }

    /* head: counter-stabilize + saccades + chew */
    if (t > nextLook) { lookT = (Math.random() - .5) * 22; nextLook = t + 1200 + Math.random() * 2600; }
    look += (lookT - look) * Math.min(dt * 8, 1);
    const headA = -swayDeg * .6 + look + (mode === 'eat' ? Math.sin(t * .02) * 4 : 0);

    /* apply the rig */
    R.sway.style.transform = `rotate(${swayDeg}deg)`;
    const br = 1 + Math.sin(t / 480) * .012;
    R.rig.style.transform = `scale(${br}, ${2 - br})`;
    R.head.style.transform = `rotate(${headA}deg)`;
    R.armL.style.transform = `rotate(${aL}deg)`;  R.armLf.style.transform = `rotate(${aLf}deg)`;
    R.armR.style.transform = `rotate(${aR}deg)`;  R.armRf.style.transform = `rotate(${aRf}deg)`;
    R.legL.style.transform = `rotate(${lL}deg)`;  R.legLf.style.transform = `rotate(${lLf}deg)`;
    R.legR.style.transform = `rotate(${lR}deg)`;  R.legRf.style.transform = `rotate(${lRf}deg)`;
    R.svg.style.transform = `rotate(${clamp(sVel * 6, -10, 10) + (mode === 'rappel' ? 4 : mode === 'climb' ? -4 : 0)}deg)`;

    /* blinking (JS-driven, always alive) */
    if (t > blinkAt) { blinkT0 = t; blinkAt = t + 2600 + Math.random() * 2600; }
    const eyeS = (t - blinkT0 < 120) ? .12 : 1;
    R.eyes.forEach(e => { e.style.transform = `scaleY(${eyeS})`; });

    requestAnimationFrame(spideyLoop);
  }

  /* ---- entrance: drop in rappelling, then wave hi (physical) ---- */
  function spideyEnter() {
    entered = true;
    webLine.classList.add('on');
    if (reduced) { mode = 'hang'; placeStatic(); return; }
    off = -innerHeight * 0.9;
    mode = 'rappel';
    setTimeout(() => {
      if (autoScroll || Math.abs(sVel) > 0.35) return;
      mode = 'wave'; modeUntil = performance.now() + 1600;
      setTimeout(() => {
        if (autoScroll || Math.abs(sVel) > 0.35) return;
        mode = 'hang';
        idleSince = performance.now();
        nextAct = idleSince + 1800;
      }, 1700);
    }, 700);
  }

  if (spidey) {
    if (reduced) {
      entered = true;
      webLine.classList.add('on');
      placeStatic();
    } else {
      requestAnimationFrame(spideyLoop);
      setTimeout(spideyEnter, 1200);
    }

    /* easter egg: click him → backflip + web sparks */
    spidey.addEventListener('click', () => {
      if (spidey.classList.contains('flipping')) return;
      spidey.classList.add('flipping');
      for (let k = 0; k < 14; k++) {
        const s = document.createElement('span');
        s.className = 'spark';
        const ang = Math.random() * Math.PI * 2, dist = 30 + Math.random() * 70;
        s.style.left = `${baseX}px`; s.style.top = `${baseY - 50}px`;
        s.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
        s.style.setProperty('--dy', `${Math.sin(ang) * dist}px`);
        s.style.setProperty('--c', '#ffffff');
        document.body.append(s);
        s.addEventListener('animationend', () => s.remove(), { once: true });
      }
      setTimeout(() => spidey.classList.remove('flipping'), 900);
    });
  }

  /* ---- nav clicks = instant rappel auto-scroll ---- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || reduced) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    try { history.pushState(null, '', `#${id}`); } catch (_) {}
    scrollToTarget(target);
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
