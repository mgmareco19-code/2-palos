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
  initCart();
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

/* ---------- Carrito de selección (catálogos) -----------
   Guarda lo que el usuario agrega en localStorage (compartido entre
   catalogo-juegos.html y catalogo-puffs.html) y arma un mensaje de
   WhatsApp con el detalle y el total al confirmar. */
const CART_KEY = 'dospalos_cart_v1';
const CART_PHONE = '595993303099';

function cartRead() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    return [];
  }
}
function cartWrite(items) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) { /* almacenamiento no disponible */ }
}
function cartFormatGs(n) {
  return 'Gs. ' + n.toLocaleString('es-PY');
}

function initCart() {
  const addButtons = document.querySelectorAll('[data-cart-item]');
  const floatBtn = document.getElementById('cartFloat');
  const panel = document.getElementById('cartPanel');
  const overlay = document.getElementById('cartOverlay');
  const closeBtn = document.getElementById('cartClose');
  const listEl = document.getElementById('cartList');
  const emptyEl = document.getElementById('cartEmpty');
  const totalEl = document.getElementById('cartTotal');
  const badgeEl = document.getElementById('cartBadge');
  const clearBtn = document.getElementById('cartClear');
  const waBtn = document.getElementById('cartWhatsapp');
  if (!floatBtn || !panel || !listEl) return;

  function render() {
    const cart = cartRead();
    listEl.querySelectorAll('.cart-panel__item').forEach((n) => n.remove());

    let total = 0;
    let count = 0;

    cart.forEach((item) => {
      total += item.price * item.qty;
      count += item.qty;

      const row = document.createElement('div');
      row.className = 'cart-panel__item';
      row.innerHTML =
        '<div class="cart-panel__item-info">' +
          '<span class="cart-panel__item-name">' + item.name + '</span>' +
          '<span class="cart-panel__item-price">' + cartFormatGs(item.price) + ' c/u</span>' +
        '</div>' +
        '<div class="cart-panel__item-qty">' +
          '<button type="button" class="cart-qty-btn" data-qty-minus="' + item.id + '" aria-label="Quitar uno">&minus;</button>' +
          '<span>' + item.qty + '</span>' +
          '<button type="button" class="cart-qty-btn" data-qty-plus="' + item.id + '" aria-label="Agregar uno">+</button>' +
        '</div>' +
        '<button type="button" class="cart-panel__item-remove" data-remove="' + item.id + '" aria-label="Eliminar">&times;</button>';
      listEl.appendChild(row);
    });

    if (emptyEl) emptyEl.hidden = cart.length > 0;
    if (totalEl) totalEl.textContent = cartFormatGs(total);
    if (badgeEl) {
      if (count > 0) { badgeEl.hidden = false; badgeEl.textContent = String(count); }
      else { badgeEl.hidden = true; }
    }
    if (waBtn) waBtn.disabled = cart.length === 0;
    if (clearBtn) clearBtn.hidden = cart.length === 0;
  }

  function addItem(id, name, price) {
    const cart = cartRead();
    const existing = cart.find((i) => i.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, name, price, qty: 1 });
    cartWrite(cart);
    render();
    openPanel();
  }

  function changeQty(id, delta) {
    let cart = cartRead();
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
    cartWrite(cart);
    render();
  }

  function removeItem(id) {
    cartWrite(cartRead().filter((i) => i.id !== id));
    render();
  }

  function openPanel() {
    panel.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    panel.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  addButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const { id, name, price } = btn.dataset;
      addItem(id, name, parseInt(price, 10) || 0);

      const original = btn.textContent;
      btn.classList.add('is-added');
      btn.textContent = 'Agregado ✓';
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('is-added');
      }, 1200);
    });
  });

  floatBtn.addEventListener('click', openPanel);
  floatBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(); }
  });
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  if (overlay) overlay.addEventListener('click', closePanel);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      cartWrite([]);
      render();
    });
  }

  listEl.addEventListener('click', (e) => {
    const plus = e.target.closest('[data-qty-plus]');
    const minus = e.target.closest('[data-qty-minus]');
    const remove = e.target.closest('[data-remove]');
    if (plus) changeQty(plus.dataset.qtyPlus, 1);
    if (minus) changeQty(minus.dataset.qtyMinus, -1);
    if (remove) removeItem(remove.dataset.remove);
  });

  if (waBtn) {
    waBtn.addEventListener('click', () => {
      const cart = cartRead();
      if (!cart.length) return;
      let total = 0;
      const lines = cart.map((item) => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        return '• ' + item.name + ' x' + item.qty + ' — ' + cartFormatGs(subtotal);
      });
      const msg =
        'Hola DOS PALOS, quiero consultar disponibilidad para:\n\n' +
        lines.join('\n') +
        '\n\nTotal estimado: ' + cartFormatGs(total);
      const url = 'https://wa.me/' + CART_PHONE + '?text=' + encodeURIComponent(msg);
      window.open(url, '_blank', 'noopener');
    });
  }

  render();
}
