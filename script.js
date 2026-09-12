// =========================================================
// DOS PALOS — script.js
// =========================================================

// Constante centralizada de WhatsApp — reutilizada en todo el sitio
const WHATSAPP_NUMBER = '595993303099';

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollReveal();
  initTouchParallax();
  initFaqAccordion();
  initFooterYear();
  initGalleryLightbox();
});

/* ---------- Menú móvil ---------- */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('main-nav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Abrir menú');
    });
  });
}

/* ---------- Revelado al hacer scroll (con stagger por grupo) ---------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Escalona la animación: a los elementos .reveal que comparten padre
  // (tarjetas de una misma grilla) se les asigna un pequeño delay creciente,
  // así aparecen en cascada en vez de todos a la vez.
  const groups = new Map();
  items.forEach((el) => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });
  groups.forEach((siblings) => {
    if (siblings.length < 2) return;
    siblings.forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${Math.min(i, 5) * 90}ms`);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---------- Parallax de respaldo para touch/mobile ----------
   background-attachment:fixed no es confiable en iOS/Android, así que
   en esos dispositivos se simula el desplazamiento moviendo el fondo
   con transform según la posición de scroll (suave, con requestAnimationFrame). */
function initTouchParallax() {
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isTouch || reducedMotion) return;

  const layers = document.querySelectorAll('.parallax-band__bg');
  if (!layers.length) return;

  let ticking = false;

  function update() {
    layers.forEach((layer) => {
      const section = layer.closest('.parallax-band');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const offset = rect.top * 0.15;
      layer.style.transform = `translate3d(0, ${offset * -1}px, 0) scale(1.02)`;
    });
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
  update();
}

/* ---------- Acordeón de preguntas frecuentes ---------- */
function initFaqAccordion() {
  const questions = document.querySelectorAll('.faq-item__question');

  questions.forEach((btn) => {
    const answer = btn.nextElementSibling;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Cierra las demás preguntas abiertas
      questions.forEach((otherBtn) => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherBtn.nextElementSibling.style.maxHeight = null;
        }
      });

      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? null : `${answer.scrollHeight}px`;
    });
  });
}

/* ---------- Lightbox de la galería ---------- */
function initGalleryLightbox() {
  const triggers = document.querySelectorAll('.gallery__zoom');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  if (!triggers.length || !lightbox || !lightboxImg || !closeBtn) return;

  function openLightbox(img) {
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  triggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const img = btn.querySelector('img');
      if (img) openLightbox(img);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
}

/* ---------- Año dinámico en el footer ---------- */
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
