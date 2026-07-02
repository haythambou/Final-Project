let T = {}, lang = 'fr';

async function loadT() {
  const r = await fetch('/translations.json');
  T = await r.json();
}

function t(path) {
  const keys = path.split('.');
  let o = T[lang] || {};
  for (const k of keys) { o = o?.[k]; if (o == null) return path; }
  return o ?? path;
}

function applyLang(l) {
  lang = l;
  const rtl = l === 'ar';
  document.body.classList.toggle('rtl', rtl);
  document.documentElement.lang = l;
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t(el.dataset.i18n);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = v;
    else el.textContent = v;
  });
  document.querySelectorAll('.lang-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.lang === l)
  );
  try { localStorage.setItem('css-lang', l); } catch(_) {}
}

function initNavbar() {
  const nav = document.getElementById('navbar');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobileMenu');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', scrollY > 30);
    document.getElementById('backToTop')?.classList.toggle('visible', scrollY > 500);
  }, { passive: true });
  burger?.addEventListener('click', () => menu?.classList.toggle('open'));
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav__links a, .mobile-menu a[data-section]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle('active',
        a.getAttribute('href') === '#' + e.target.id || a.dataset.section === e.target.id
      ));
    });
  }, { threshold: 0.3, rootMargin: '-76px 0px -50% 0px' });
  sections.forEach(s => io.observe(s));
}

function initMap() {
  if (!document.getElementById('map') || typeof L === 'undefined') return;
  const lat = 33.9817, lng = -6.8498;
  const map = L.map('map', { scrollWheelZoom: false }).setView([lat, lng], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);
  const icon = L.divIcon({
    html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#CC1119,#E8461A);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 16px rgba(204,17,25,.45)"></div>`,
    iconSize: [36, 36], iconAnchor: [18, 36], className: ''
  });
  L.marker([lat, lng], { icon }).addTo(map).bindPopup(`
    <div style="font-family:Inter,sans-serif;padding:2px 0">
      <strong style="color:#CC1119;font-size:.9rem;display:block;margin-bottom:4px">Collège Scientifique Souissi</strong>
      <span style="font-size:.78rem;color:#555;line-height:1.5">12, Avenue Mohamed Ibn Hassan El Ouazzani<br>Souissi, Rabat, Maroc</span><br>
      <a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}" target="_blank"
         style="font-size:.78rem;color:#E8461A;font-weight:700;margin-top:6px;display:inline-block">
        Voir sur OpenStreetMap &rarr;
      </a>
    </div>`, { maxWidth: 260 }).openPopup();
}

function initContactZoneMap() {
  if (!document.getElementById('contactMap') || typeof L === 'undefined') return;
  const lat = 33.96264380639406;
  const lng = -6.821080462407432;

  const map = L.map('contactMap', { scrollWheelZoom: false, zoomControl: false })
    .setView([lat, lng], 16);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);

  const icon = L.divIcon({
    html: `<div style="width:34px;height:34px;background:linear-gradient(135deg,#CC1119,#E8461A);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid rgba(255,255,255,.95);box-shadow:0 4px 16px rgba(204,17,25,.45)"></div>`,
    iconSize: [34, 34], iconAnchor: [17, 34], className: ''
  });

  L.marker([lat, lng], { icon }).addTo(map);
}


function initCounters() {
  const bar = document.querySelector('.stats-bar');
  if (!bar) return;
  let done = false;
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || done) return;
    done = true;
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = +el.dataset.count, suffix = el.dataset.suffix || '';
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / 1500, 1), ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(ease * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 }).observe(bar);
}

function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('in'), +(e.target.dataset.delay || 0));
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.rev').forEach(el => io.observe(el));
}

function initPhotoZones() {
  document.querySelectorAll('.photo-zone img').forEach(img => {
    const ph = img.nextElementSibling;
    if (!ph?.classList.contains('photo-zone__placeholder')) return;
    const onLoad  = () => img.classList.add('loaded');
    const onError = () => { img.style.display = 'none'; ph.style.opacity = '1'; };
    if (img.complete && img.naturalWidth > 0) onLoad();
    else { img.addEventListener('load', onLoad); img.addEventListener('error', onError); }
  });
}

function initForm() {
  const form = document.getElementById('contactForm');
  const ok = form.querySelector('.form-success');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    if (!btn) return;

    btn.disabled = true;
    const originalBtnText = btn.textContent;
    btn.textContent = '...';

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.textContent = originalBtnText || t('contact.formBtn');

      if (ok) {
        ok.textContent = t('contact.formSuccess');
        ok.style.display = 'block';
      }

      setTimeout(() => { if (ok) ok.style.display = 'none'; }, 5000);
    }, 1100);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadT();
  let saved = 'fr';
  try { saved = localStorage.getItem('css-lang') || 'fr'; } catch(_) {}
  applyLang(saved);
  document.querySelectorAll('.lang-btn').forEach(b =>
    b.addEventListener('click', () => applyLang(b.dataset.lang))
  );
  document.getElementById('backToTop')?.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
  initNavbar(); initCounters(); initReveal(); initPhotoZones(); initForm();
  if (typeof L !== 'undefined') {
    initMap();
    initContactZoneMap();
  } else {
    document.querySelector('script[src*="leaflet"]')?.addEventListener('load', () => {
      initMap();
      initContactZoneMap();
    });
  }
});
