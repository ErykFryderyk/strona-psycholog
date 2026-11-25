// Mobilne menu
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
  document.body.classList.toggle('menu-open', open);
}

// Po powiększeniu okna do wersji desktop zamknij menu mobilne
window.matchMedia('(min-width: 761px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Cień nagłówka po przewinięciu
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Podświetlanie aktywnej sekcji w menu
const links = [...nav.querySelectorAll('a:not(.btn)')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

// Łagodne pojawianie się elementów
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Cennik: przełącznik pojedyncza sesja / pakiet 4 sesji
const billing = document.querySelector('.billing');
const plansWrap = document.querySelector('.plans');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateNumber(el, to) {
  const from = parseInt(el.textContent, 10) || 0;
  if (from === to) return;
  el.classList.remove('is-bump');
  void el.offsetWidth; // restart animacji
  el.classList.add('is-bump');
  if (reduceMotion) { el.textContent = to; return; }
  const start = performance.now();
  const duration = 500;
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function setBilling(mode) {
  const pack = mode === 'pack';
  billing.dataset.mode = mode;
  plansWrap.classList.toggle('is-pack', pack);
  billing.querySelectorAll('.billing__btn').forEach((btn) => {
    const active = btn.dataset.mode === mode;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  plansWrap.querySelectorAll('.plan').forEach((plan) => {
    const single = Number(plan.dataset.single);
    const packPrice = plan.dataset.pack ? Number(plan.dataset.pack) : null;
    const sub = plan.querySelector('.plan__sub');
    animateNumber(plan.querySelector('.plan__amount'), pack && packPrice ? packPrice : single);

    if (!packPrice) {
      sub.textContent = pack ? sub.dataset.packText : sub.dataset.singleText;
    } else if (pack) {
      const saving = (single - packPrice) * 4;
      sub.innerHTML = `za sesję · razem ${packPrice * 4} zł<br><strong>oszczędzasz ${saving} zł</strong>`;
    } else {
      sub.textContent = 'za sesję';
    }
  });
}

if (billing) {
  billing.addEventListener('click', (e) => {
    const btn = e.target.closest('.billing__btn');
    if (btn) setBilling(btn.dataset.mode);
  });
}

// Bieżący rok w stopce
document.getElementById('year').textContent = new Date().getFullYear();
