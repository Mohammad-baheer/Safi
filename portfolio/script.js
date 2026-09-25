/* ============================================================
   MOHAMMAD BAHEER SAFI — PORTFOLIO · script.js
   Small, clean interactions: typewriter, scroll reveals,
   nav, progress bar, cursor glow and card tilt.
   ============================================================ */

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer   = window.matchMedia('(pointer: fine)').matches;

/* ---------- Footer year ---------- */
$('#year').textContent = new Date().getFullYear();

/* ---------- Scroll progress + nav state ---------- */
const progress = $('#progress');
const nav = $('#nav');

function onScroll() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  const p = max > 0 ? doc.scrollTop / max : 0;
  progress.style.transform = `scaleX(${p})`;
  nav.classList.toggle('scrolled', doc.scrollTop > 40);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Mobile menu ---------- */
const hamburger = $('#hamburger');
const navLinks  = $('#navLinks');

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
});
$$('#navLinks a').forEach(a => a.addEventListener('click', closeMenu));

/* ---------- Typewriter (rotating roles) ---------- */
const words = [
  'Cybersecurity',
  'Software Engineering',
  'Artificial Intelligence',
  'Full-Stack Development',
  'Problem Solving',
];
const typedEl = $('#typed');

if (reducedMotion) {
  typedEl.textContent = words[0];
} else {
  let wordIndex = 0;
  let charIndex = words[0].length; // start full, delete first
  let deleting = true;

  (function tick() {
    const word = words[wordIndex];
    typedEl.textContent = word.slice(0, charIndex);

    let delay = deleting ? 38 : 78;

    if (!deleting && charIndex === word.length) {
      delay = 1700;            // hold the full word
      deleting = true;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 350;             // small pause before next word
    } else {
      charIndex += deleting ? -1 : 1;
    }
    setTimeout(tick, delay);
  })();
}

/* ---------- Scroll reveals + terminal trigger ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el = entry.target;
    const delay = el.dataset.delay ? `${el.dataset.delay}ms` : '0ms';
    el.style.transitionDelay = delay;
    el.classList.add('visible');
    if (el.classList.contains('term')) el.classList.add('play');

    revealObserver.unobserve(el);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

$$('.reveal, .term').forEach(el => revealObserver.observe(el));

/* ---------- Active nav link (scroll spy) ---------- */
const sections = $$('main section[id]');
const spy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    $$('#navLinks a').forEach(a =>
      a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`)
    );
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => spy.observe(s));

/* ---------- Cursor glow (desktop only) ---------- */
const glow = $('#cursorGlow');
if (finePointer && !reducedMotion && glow) {
  let tx = window.innerWidth / 2, ty = window.innerHeight / 2; // target
  let x = tx, y = ty;                                           // current

  document.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  (function loop() {
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    glow.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();
} else if (glow) {
  glow.remove();
}

/* ---------- 3D tilt on cards (desktop only) ---------- */
if (finePointer && !reducedMotion) {
  $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - 0.5;
      const py = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform =
        `perspective(900px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
