/* ============================================================
   المحبة بلاست — main.js
   Vanilla JS engine shared by every page:
   1. Site constants (WhatsApp, Formspree, contacts)
   2. Language system (AR default / EN toggle, localStorage)
   3. Shared header / footer / floating buttons (rendered once
      here so all 9 pages stay perfectly consistent)
   4. Mobile menu, sticky shrinking header, active nav
   5. Scroll reveal (IntersectionObserver) + counters
   6. Accordion, back-to-top
   7. Form validation + Formspree submission + honeypot
   ============================================================ */
'use strict';

/* ============================================================
   1) SITE CONSTANTS — edit these in ONE place
   ============================================================ */

/* WhatsApp number used by the floating button and all WA links */
const WHATSAPP_NUMBER = '201274889660';

/* [PLACEHOLDER] Create a free form at https://formspree.io and
   replace YOUR_FORM_ID with your real form ID. Submissions are
   delivered to Nourhamam2014@yahoo.com (set inside Formspree). */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

const CONTACT_EMAIL = 'Nourhamam2014@yahoo.com';
const PHONE_1 = '+201221328445';   // displayed: +20 122 132 8445
const PHONE_2 = '+201274889660';   // displayed: +20 127 488 9660
const PHONE_1_DISPLAY = '+20 122 132 8445';
const PHONE_2_DISPLAY = '+20 127 488 9660';

/* ============================================================
   2) LANGUAGE SYSTEM
   ============================================================ */

const LANG_KEY = 'mp-lang';
let currentLang = localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'ar';

/** Translate a key using the active language (falls back to AR). */
function t(key) {
  const dict = window.I18N[currentLang] || window.I18N.ar;
  return dict[key] ?? window.I18N.ar[key] ?? key;
}

/** Build the wa.me link with a prefilled message in the active language. */
function whatsappLink() {
  return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(t('wa.message'));
}

/** Apply translations to every tagged element inside a root (default: document). */
function applyI18n(root) {
  const scope = root || document;
  scope.querySelectorAll('[data-i18n]').forEach(function (el) {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  scope.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  scope.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
  scope.querySelectorAll('[data-i18n-title]').forEach(function (el) {
    el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
  });
  /* Refresh WhatsApp hrefs so the prefilled message follows the language */
  scope.querySelectorAll('[data-wa-link]').forEach(function (el) {
    el.setAttribute('href', whatsappLink());
  });
}

/** Switch language, persist it, and re-render everything. */
function setLang(lang) {
  currentLang = lang === 'en' ? 'en' : 'ar';
  localStorage.setItem(LANG_KEY, currentLang);

  const html = document.documentElement;
  html.setAttribute('lang', currentLang);
  html.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');

  /* Font swap: Cairo for AR, Inter for EN */
  document.body.classList.toggle('font-cairo', currentLang === 'ar');
  document.body.classList.toggle('font-inter', currentLang === 'en');

  /* Page title: <body data-title-ar="…" data-title-en="…"> */
  const titleKey = currentLang === 'ar' ? 'titleAr' : 'titleEn';
  if (document.body.dataset[titleKey]) {
    document.title = document.body.dataset[titleKey];
  }

  renderChrome();          /* header + footer + floating buttons */
  applyI18n(document);     /* static page content */
  refreshIcons();
  /* Pages with JS-rendered content (e.g. product grid) listen for this */
  document.dispatchEvent(new CustomEvent('mp:langchange', { detail: { lang: currentLang } }));
}

/** Re-run Lucide icon replacement after any DOM injection. */
function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/* ============================================================
   3) SHARED CHROME — header, footer, floating buttons
   ============================================================ */

const NAV_ITEMS = [
  { key: 'nav.home',     href: 'index.html',         page: 'home' },
  { key: 'nav.about',    href: 'about.html',         page: 'about' },
  { key: 'nav.products', href: 'products.html',      page: 'products' },
  { key: 'nav.colors',   href: 'custom-colors.html', page: 'colors' },
  { key: 'nav.quality',  href: 'quality.html',       page: 'quality' },
  { key: 'nav.contact',  href: 'contact.html',       page: 'contact' }
];

/* Brand mark: three overlapping "masterbatch pellets".
   [PLACEHOLDER] Replace this SVG with the real logo file
   (e.g. <img src="assets/img/logo.png" alt="…">) when available. */
function logoMark(size) {
  const s = size || 40;
  return (
    '<svg width="' + s + '" height="' + s + '" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
      '<circle cx="18" cy="20" r="13" fill="#0B3C7A"/>' +
      '<circle cx="31" cy="17" r="10" fill="#FF7A1A"/>' +
      '<circle cx="27" cy="31" r="9" fill="#16A34A"/>' +
      '<circle cx="14" cy="15" r="4" fill="#ffffff" opacity="0.35"/>' +
      '<circle cx="28" cy="13" r="3" fill="#ffffff" opacity="0.4"/>' +
    '</svg>'
  );
}

function headerHTML() {
  const activePage = document.body.dataset.page || '';
  const links = NAV_ITEMS.map(function (item) {
    const active = item.page === activePage;
    return (
      '<a href="' + item.href + '" class="nav-link text-[15px] font-semibold text-ink hover:text-primary transition-colors' +
      (active ? ' active' : '') + '"' + (active ? ' aria-current="page"' : '') + '>' +
      t(item.key) + '</a>'
    );
  }).join('');

  const mobileLinks = NAV_ITEMS.map(function (item) {
    const active = item.page === activePage;
    return (
      '<a href="' + item.href + '" class="block px-6 py-3 text-base font-semibold border-b border-gray-100 ' +
      (active ? 'text-primary bg-primary-50' : 'text-ink hover:bg-surface') + '"' +
      (active ? ' aria-current="page"' : '') + '>' + t(item.key) + '</a>'
    );
  }).join('');

  return (
    '<a href="#main-content" class="skip-link">' + t('a11y.skip') + '</a>' +
    '<header id="site-header" class="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">' +
      '<div class="max-w-content mx-auto px-4 sm:px-6">' +
        '<div class="header-inner flex items-center justify-between gap-4">' +

          /* Logo */
          '<a href="index.html" class="flex items-center gap-3 shrink-0" aria-label="' + t('a11y.logo') + '">' +
            logoMark(42) +
            '<span class="leading-tight">' +
              '<span class="block text-lg font-extrabold text-navy">' + t('brand.name') + '</span>' +
              '<span class="block text-[11px] font-semibold text-muted tracking-wide">' + t('brand.tagline') + '</span>' +
            '</span>' +
          '</a>' +

          /* Desktop nav */
          '<nav class="hidden lg:flex items-center gap-7" aria-label="' + t('nav.home') + '">' + links + '</nav>' +

          /* Actions: language + CTA + hamburger */
          '<div class="flex items-center gap-2 sm:gap-3">' +
            '<button id="lang-toggle" type="button" class="flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 text-sm font-bold text-primary hover:border-primary hover:bg-primary-50 transition-colors" aria-label="' + t('a11y.lang') + '">' +
              '<i data-lucide="globe" class="w-4 h-4"></i>' +
              '<span>' + t('misc.langSwitch') + '</span>' +
            '</button>' +
            '<a href="contact.html#quote-form" class="btn btn-accent btn-sm hidden sm:inline-flex">' + t('cta.quote') + '</a>' +
            '<button id="menu-toggle" type="button" class="lg:hidden p-2 rounded-lg text-navy hover:bg-surface transition-colors" aria-expanded="false" aria-controls="mobile-menu" aria-label="' + t('a11y.menu') + '">' +
              '<i data-lucide="menu" class="w-6 h-6 menu-icon-open"></i>' +
              '<i data-lucide="x" class="w-6 h-6 menu-icon-close hidden"></i>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* Mobile menu panel */
      '<div id="mobile-menu" class="lg:hidden bg-white border-t border-gray-100 shadow-header">' +
        '<nav aria-label="' + t('nav.home') + '">' + mobileLinks + '</nav>' +
        '<div class="px-6 py-4">' +
          '<a href="contact.html#quote-form" class="btn btn-accent w-full">' + t('cta.quote') + '</a>' +
        '</div>' +
      '</div>' +
    '</header>' +
    /* spacer so page content starts below the fixed header */
    '<div id="header-spacer" style="height:var(--header-h)" aria-hidden="true"></div>'
  );
}

function footerHTML() {
  const year = new Date().getFullYear();

  const quickLinks = NAV_ITEMS.map(function (item) {
    return '<li><a href="' + item.href + '" class="text-gray-300 hover:text-accent transition-colors">' + t(item.key) + '</a></li>';
  }).join('');

  const productLinks =
    '<li><a href="products.html#masterbatch" class="text-gray-300 hover:text-accent transition-colors">' + t('products.masterbatch') + '</a></li>' +
    '<li><a href="products.html#pet" class="text-gray-300 hover:text-accent transition-colors">' + t('products.pet') + '</a></li>' +
    '<li><a href="products.html#raw" class="text-gray-300 hover:text-accent transition-colors">' + t('products.raw') + '</a></li>' +
    '<li><a href="custom-colors.html" class="text-gray-300 hover:text-accent transition-colors">' + t('nav.colors') + '</a></li>';

  return (
    '<footer class="bg-navy text-white">' +
      /* pellets divider strip — the brand motif */
      '<div class="h-1.5 w-full flex" aria-hidden="true">' +
        '<span class="flex-1 bg-primary"></span><span class="flex-1 bg-accent"></span>' +
        '<span class="flex-1 bg-green-500"></span><span class="flex-1 bg-red-500"></span>' +
        '<span class="flex-1 bg-yellow-400"></span><span class="flex-1 bg-sky-400"></span>' +
      '</div>' +

      '<div class="max-w-content mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">' +

        /* Column 1: brand */
        '<div>' +
          '<div class="flex items-center gap-3 mb-4">' + logoMark(40) +
            '<span class="leading-tight">' +
              '<span class="block text-lg font-extrabold">' + t('brand.name') + '</span>' +
              '<span class="block text-[11px] font-semibold text-gray-400">' + t('brand.tagline') + '</span>' +
            '</span>' +
          '</div>' +
          '<p class="text-sm text-gray-300 leading-relaxed mb-4">' + t('footer.desc') + '</p>' +
          '<p class="text-sm font-bold text-accent">' + t('footer.management') + '</p>' +
        '</div>' +

        /* Column 2: quick links */
        '<nav aria-label="' + t('footer.quickLinks') + '">' +
          '<h3 class="text-base font-extrabold mb-4 text-white">' + t('footer.quickLinks') + '</h3>' +
          '<ul class="space-y-2.5 text-sm">' + quickLinks + '</ul>' +
        '</nav>' +

        /* Column 3: products */
        '<nav aria-label="' + t('footer.products') + '">' +
          '<h3 class="text-base font-extrabold mb-4 text-white">' + t('footer.products') + '</h3>' +
          '<ul class="space-y-2.5 text-sm">' + productLinks + '</ul>' +
        '</nav>' +

        /* Column 4: contact — phones forced LTR inside RTL text */
        '<div>' +
          '<h3 class="text-base font-extrabold mb-4 text-white">' + t('footer.contact') + '</h3>' +
          '<ul class="space-y-3 text-sm text-gray-300">' +
            '<li class="flex items-start gap-2.5"><i data-lucide="map-pin" class="w-4 h-4 mt-1.5 text-accent shrink-0"></i><span>' + t('contact.address') + '</span></li>' +
            '<li class="flex items-center gap-2.5"><i data-lucide="phone" class="w-4 h-4 text-accent shrink-0"></i><a href="tel:' + PHONE_1 + '" class="ltr-inline hover:text-accent transition-colors" dir="ltr">' + PHONE_1_DISPLAY + '</a></li>' +
            '<li class="flex items-center gap-2.5"><i data-lucide="phone" class="w-4 h-4 text-accent shrink-0"></i><a href="tel:' + PHONE_2 + '" class="ltr-inline hover:text-accent transition-colors" dir="ltr">' + PHONE_2_DISPLAY + '</a></li>' +
            '<li class="flex items-center gap-2.5"><i data-lucide="mail" class="w-4 h-4 text-accent shrink-0"></i><a href="mailto:' + CONTACT_EMAIL + '" class="ltr-inline hover:text-accent transition-colors break-all" dir="ltr">' + CONTACT_EMAIL + '</a></li>' +
          '</ul>' +
          /* Social: WhatsApp + email are real.
             [TO CONFIRM] Add the official Facebook page URL, then uncomment:
             '<a href="FACEBOOK_URL" ...><i data-lucide="facebook"></i></a>' */
          '<div class="flex items-center gap-3 mt-5">' +
            '<a data-wa-link href="' + whatsappLink() + '" target="_blank" rel="noopener" aria-label="' + t('a11y.whatsapp') + '" class="w-9 h-9 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center transition-colors"><i data-lucide="message-circle" class="w-4 h-4"></i></a>' +
            '<a href="mailto:' + CONTACT_EMAIL + '" aria-label="' + t('contact.emailLabel') + '" class="w-9 h-9 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center transition-colors"><i data-lucide="mail" class="w-4 h-4"></i></a>' +
            '<a href="tel:' + PHONE_2 + '" aria-label="' + t('contact.phone2Label') + '" class="w-9 h-9 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center transition-colors"><i data-lucide="phone" class="w-4 h-4"></i></a>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* Bottom bar */
      '<div class="border-t border-white/10">' +
        '<div class="max-w-content mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">' +
          '<p>© <span data-year>' + year + '</span> ' + t('brand.name') + ' — ' + t('footer.rights') + '</p>' +
          '<div class="flex items-center gap-5">' +
            '<a href="privacy.html" class="hover:text-accent transition-colors">' + t('footer.privacy') + '</a>' +
            '<a href="terms.html" class="hover:text-accent transition-colors">' + t('footer.terms') + '</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</footer>'
  );
}

function floatingHTML() {
  return (
    '<a id="whatsapp-float" class="float-btn" data-wa-link href="' + whatsappLink() + '" target="_blank" rel="noopener" aria-label="' + t('a11y.whatsapp') + '">' +
      /* WhatsApp glyph (inline SVG — Lucide has no brand icons) */
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>' +
    '</a>' +
    '<button id="back-to-top" type="button" class="float-btn" aria-label="' + t('a11y.backTop') + '">' +
      '<i data-lucide="arrow-up" class="w-6 h-6"></i>' +
    '</button>'
  );
}

/** Inject (or re-inject) header / footer / floating buttons. */
function renderChrome() {
  const headerMount = document.getElementById('site-header-mount');
  const footerMount = document.getElementById('site-footer-mount');
  const floatMount  = document.getElementById('floating-mount');

  if (headerMount) headerMount.innerHTML = headerHTML();
  if (footerMount) footerMount.innerHTML = footerHTML();
  if (floatMount)  floatMount.innerHTML  = floatingHTML();

  initMobileMenu();
  initLangToggle();
  initBackToTop();
  updateScrollState();
}

/* ============================================================
   4) MOBILE MENU + LANGUAGE TOGGLE + STICKY HEADER
   ============================================================ */

function initLangToggle() {
  const btn = document.getElementById('lang-toggle');
  if (!btn) return;
  btn.addEventListener('click', function () {
    setLang(currentLang === 'ar' ? 'en' : 'ar');
  });
}

function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  function setOpen(open) {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', t(open ? 'a11y.menuClose' : 'a11y.menu'));
    const iconOpen = toggle.querySelector('.menu-icon-open');
    const iconClose = toggle.querySelector('.menu-icon-close');
    if (iconOpen) iconOpen.classList.toggle('hidden', open);
    if (iconClose) iconClose.classList.toggle('hidden', !open);
  }

  toggle.addEventListener('click', function () {
    setOpen(!menu.classList.contains('open'));
  });

  /* Close on link click, Escape, or click outside the header */
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', function (e) {
    const header = document.getElementById('site-header');
    if (menu.classList.contains('open') && header && !header.contains(e.target)) {
      setOpen(false);
    }
  });
}

/** Shrink header after 10px; show back-to-top after 600px. */
function updateScrollState() {
  const header = document.getElementById('site-header');
  const backTop = document.getElementById('back-to-top');
  const y = window.scrollY || document.documentElement.scrollTop;
  if (header) header.classList.toggle('scrolled', y > 10);
  if (backTop) backTop.classList.toggle('visible', y > 600);
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  btn.addEventListener('click', function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
}

/* ============================================================
   5) SCROLL REVEAL + COUNTERS
   ============================================================ */

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('is-visible');
        io.unobserve(el); /* animate once, keep it stable */
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  items.forEach(function (el) { io.observe(el); });
}

/** Smooth count-up for <span data-count-to="48">0</span> */
function initCounters() {
  const counters = document.querySelectorAll('[data-count-to]');
  if (!counters.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = new Intl.NumberFormat('en-US');

  function animate(el) {
    const target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
    if (reduce) { el.textContent = fmt.format(target); return; }
    const duration = 1400;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
      el.textContent = fmt.format(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(function (el) { io.observe(el); });
}

/* ============================================================
   6) ACCORDION
   Markup:
   <div data-accordion>
     <div class="accordion-item">
       <button class="accordion-trigger" aria-expanded="false">…</button>
       <div class="accordion-panel"><div>…answer…</div></div>
     </div>
   </div>
   ============================================================ */

function initAccordions() {
  document.querySelectorAll('[data-accordion]').forEach(function (group) {
    group.querySelectorAll('.accordion-trigger').forEach(function (trigger) {
      const panel = trigger.nextElementSibling;
      if (!panel || !panel.classList.contains('accordion-panel')) return;

      trigger.addEventListener('click', function () {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';

        /* close siblings for a clean single-open accordion */
        group.querySelectorAll('.accordion-trigger[aria-expanded="true"]').forEach(function (other) {
          if (other !== trigger) {
            other.setAttribute('aria-expanded', 'false');
            other.nextElementSibling.style.maxHeight = '0px';
          }
        });

        trigger.setAttribute('aria-expanded', String(!isOpen));
        panel.style.maxHeight = isOpen ? '0px' : panel.scrollHeight + 'px';
      });
    });
  });
}

/* ============================================================
   7) FORMS — validation, honeypot, Formspree submission
   Markup: <form data-mp-form novalidate> … fields with `required`
   and optional data-rule="email|phone". Honeypot: input[name=website]
   Alerts: <div class="form-alert" data-form-alert>
   ============================================================ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s\-()]{7,17}$/;

function fieldError(field, message) {
  field.classList.add('field-invalid');
  field.classList.remove('field-valid');
  field.setAttribute('aria-invalid', 'true');
  let msg = field.parentElement.querySelector('.field-error-msg');
  if (!msg) {
    msg = document.createElement('p');
    msg.className = 'field-error-msg';
    msg.setAttribute('role', 'alert');
    field.parentElement.appendChild(msg);
  }
  msg.textContent = message;
}

function clearFieldError(field) {
  field.classList.remove('field-invalid');
  field.removeAttribute('aria-invalid');
  const msg = field.parentElement.querySelector('.field-error-msg');
  if (msg) msg.remove();
}

function validateField(field) {
  const value = field.value.trim();
  const rule = field.getAttribute('data-rule');

  if (field.hasAttribute('required') && !value) {
    fieldError(field, t('form.err.required'));
    return false;
  }
  if (value && rule === 'email' && !EMAIL_RE.test(value)) {
    fieldError(field, t('form.err.email'));
    return false;
  }
  if (value && rule === 'phone' && !PHONE_RE.test(value)) {
    fieldError(field, t('form.err.phone'));
    return false;
  }
  clearFieldError(field);
  if (value) field.classList.add('field-valid');
  return true;
}

function showAlert(form, type, message) {
  const alert = form.querySelector('[data-form-alert]');
  if (!alert) return;
  alert.className = 'form-alert show ' + type;
  alert.textContent = message;
  alert.setAttribute('role', 'alert');
}

function initForms() {
  document.querySelectorAll('[data-mp-form]').forEach(function (form) {
    const fields = form.querySelectorAll('input:not([name="website"]):not([type="hidden"]), select, textarea');

    /* live re-validation once the user fixes a field */
    fields.forEach(function (field) {
      field.addEventListener('input', function () {
        if (field.classList.contains('field-invalid')) validateField(field);
      });
      field.addEventListener('blur', function () {
        if (field.value.trim()) validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Honeypot: bots fill the hidden "website" field — silently drop */
      const honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value) return;

      let firstInvalid = null;
      fields.forEach(function (field) {
        if (!validateField(field) && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        showAlert(form, 'error', t('form.fixErrors'));
        firstInvalid.focus();
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      const btnLabel = submitBtn ? submitBtn.querySelector('[data-btn-label]') : null;
      const originalLabel = btnLabel ? btnLabel.textContent : '';
      if (submitBtn) submitBtn.disabled = true;
      if (btnLabel) btnLabel.textContent = t('cta.sending');

      /* [PLACEHOLDER] guard: endpoint not configured yet */
      if (FORMSPREE_ENDPOINT.indexOf('YOUR_FORM_ID') !== -1) {
        showAlert(form, 'error', t('form.error'));
        if (submitBtn) submitBtn.disabled = false;
        if (btnLabel) btnLabel.textContent = originalLabel;
        return;
      }

      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            fields.forEach(function (f) { f.classList.remove('field-valid'); });
            showAlert(form, 'success', t('form.success'));
          } else {
            showAlert(form, 'error', t('form.error'));
          }
        })
        .catch(function () {
          showAlert(form, 'error', t('form.error'));
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
          if (btnLabel) btnLabel.textContent = t('cta.send');
        });
    });
  });
}

/* ============================================================
   PRODUCT CATALOG — edit this array to add/remove products.
   category: 'masterbatch' | 'pet' | 'raw'
   name/desc are {ar, en} objects so the grid re-renders on
   language switch. img paths live in assets/img/.
   [TO CONFIRM] Replace placeholder names/descriptions with the
   company's actual product list and grades.
   ============================================================ */

const PRODUCTS = [
  /* ---- Masterbatch ---- */
  {
    category: 'masterbatch',
    img: 'assets/img/studio-mb-color.jpg',
    swatch: '#1E5FA8',
    name: { ar: 'ماستر باتش ملون', en: 'Color Masterbatch' },
    desc: {
      ar: 'ألوان مركزة عالية الثبات لجميع تطبيقات البلاستيك، تُصنَّع بأحدث الماكينات. [TO CONFIRM: قائمة الألوان التفصيلية]',
      en: 'Concentrated, consistent colors for all plastic applications, produced on modern lines. [TO CONFIRM: detailed color list]'
    }
  },
  {
    category: 'masterbatch',
    img: 'assets/img/studio-mb-black.jpg',
    swatch: '#1F2937',
    name: { ar: 'ماستر باتش أسود', en: 'Black Masterbatch' },
    desc: {
      ar: 'أسود عميق بتغطية عالية لتطبيقات التغليف والحقن والمواسير. [TO CONFIRM: الدرجات المتاحة]',
      en: 'Deep black with high coverage for packaging, injection and pipe applications. [TO CONFIRM: available grades]'
    }
  },
  {
    category: 'masterbatch',
    img: 'assets/img/studio-mb-white.jpg',
    swatch: '#E8EDF3',
    name: { ar: 'ماستر باتش أبيض', en: 'White Masterbatch' },
    desc: {
      ar: 'بياض ناصع ولمعة عالية للأفلام والعبوات والتطبيقات الهندسية. [TO CONFIRM: النسبة والدرجات]',
      en: 'Bright whiteness and high gloss for films, packaging and engineering uses. [TO CONFIRM: loading ratio and grades]'
    }
  },
  {
    category: 'masterbatch',
    img: 'assets/img/studio-mb-additives.jpg',
    swatch: '#F3E3C3',
    name: { ar: 'ماستر باتش إضافات ومركبات', en: 'Additives & Compound Masterbatch' },
    desc: {
      ar: 'مركبات وإضافات مخصصة حسب طلب المصنع. [TO CONFIRM: أنواع الإضافات التي تنتجها الشركة فعلياً]',
      en: 'Custom compounds and additives per factory request. [TO CONFIRM: which additive types the company actually produces]'
    }
  },

  /* ---- PET colors ---- */
  {
    category: 'pet',
    img: 'assets/img/studio-pet-green.jpg',
    swatch: '#3FAE29',
    name: { ar: 'ألوان PET زجاجات', en: 'PET Bottle Colors' },
    desc: {
      ar: 'درجات لونية نقية للزجاجات والعبوات الشفافة بمطابقة دقيقة وثبات حراري. [TO CONFIRM: الدرجات]',
      en: 'Pure color grades for transparent bottles and packaging with precise matching and heat stability. [TO CONFIRM: grades]'
    }
  },
  {
    category: 'pet',
    img: 'assets/img/studio-pet-red.jpg',
    swatch: '#D63031',
    name: { ar: 'ألوان PET specials', en: 'PET Special Colors' },
    desc: {
      ar: 'تطوير ألوان PET خاصة حسب عينة العميل خلال 24–48 ساعة. [TO CONFIRM: أمثلة ألوان منفذة]',
      en: 'Custom PET colors developed from the client sample within 24–48 hours. [TO CONFIRM: executed color examples]'
    }
  },

  /* ---- Raw materials ---- */
  {
    category: 'raw',
    img: 'assets/img/studio-eva-yellow.jpg',
    swatch: '#E6B800',
    name: { ar: 'خامة EVA', en: 'EVA Material' },
    desc: {
      ar: 'خامات EVA مستوردة وفق معايير جودة محددة لتطبيقات النعال والحقن. [TO CONFIRM: الماركات والدرجات]',
      en: 'Imported EVA under defined quality standards for footwear and injection applications. [TO CONFIRM: brands and grades]'
    }
  },
  {
    category: 'raw',
    img: 'assets/img/studio-pvc-clear.jpg',
    swatch: '#9FB3C8',
    name: { ar: 'خامة PVC', en: 'PVC Material' },
    desc: {
      ar: 'مركبات وخامات PVC لمواسير وتطبيقات صناعية واسعة. [TO CONFIRM: الدرجات والمواصفات]',
      en: 'PVC compounds and materials for pipes and a wide range of industrial applications. [TO CONFIRM: grades and specs]'
    }
  },
  {
    category: 'raw',
    img: 'assets/img/studio-raw-natural.jpg',
    swatch: '#DCE5EF',
    name: { ar: 'خامات بلاستيك أخرى', en: 'Other Plastic Raw Materials' },
    desc: {
      ar: 'نستورد جميع أنواع خامات البلاستيك حسب طلب العميل ومعاييرنا المخصصة. [TO CONFIRM: أهم الخامات المتاحة حالياً]',
      en: 'We import all plastic raw materials per client request under our dedicated standards. [TO CONFIRM: currently stocked materials]'
    }
  }
];

/** Render a product card for the products page grid. */
function productCard(p, index) {
  const swatchStyle = 'background:' + p.swatch + ';' + (p.swatch === '#E8EDF3' || p.swatch === '#DCE5EF' ? 'border:1px solid #D4DBE5;' : '');
  return (
    '<article class="card card-hover overflow-hidden flex flex-col reveal" data-reveal-delay="' + (index % 3) * 120 + '">' +
      '<div class="aspect-[4/3] overflow-hidden bg-surface">' +
        '<img src="' + p.img + '" alt="' + p.name[currentLang] + '" loading="lazy" decoding="async" ' +
        'class="w-full h-full object-cover" width="1024" height="1024" ' +
        'onerror="this.onerror=null;this.src=\'assets/img/hero-pellets-collage.jpg\';">' +
      '</div>' +
      '<div class="p-6 flex flex-col flex-1">' +
        '<div class="flex items-center gap-3 mb-3">' +
          '<span class="pellet w-5 h-5 shrink-0" style="' + swatchStyle + '" aria-hidden="true"></span>' +
          '<h3 class="text-lg font-extrabold text-navy leading-snug">' + p.name[currentLang] + '</h3>' +
        '</div>' +
        '<p class="text-muted text-sm leading-relaxed flex-1">' + p.desc[currentLang] + '</p>' +
        '<a href="contact.html#quote-form" class="inline-flex items-center gap-2 text-primary font-bold mt-4 hover:gap-3 transition-all text-sm">' +
          '<span>' + t('products.inquire') + '</span>' +
          '<i data-lucide="arrow-left" class="w-4 h-4 icon-flip"></i>' +
        '</a>' +
      '</div>' +
    '</article>'
  );
}

/** Products page: tabs + grid. No-op on other pages. */
function initProductGrid() {
  const grid = document.getElementById('product-grid');
  const tabsWrap = document.getElementById('product-tabs');
  if (!grid || !tabsWrap) return;

  const tabs = [
    { id: 'all', key: 'products.tab.all' },
    { id: 'masterbatch', key: 'products.tab.masterbatch' },
    { id: 'pet', key: 'products.tab.pet' },
    { id: 'raw', key: 'products.tab.raw' }
  ];

  function activeFromHash() {
    const h = (location.hash || '').replace('#', '');
    return tabs.some(function (x) { return x.id === h; }) ? h : 'all';
  }

  function render() {
    const active = activeFromHash();

    tabsWrap.innerHTML = tabs.map(function (tab) {
      const on = tab.id === active;
      return (
        '<button type="button" data-tab="' + tab.id + '" class="btn btn-sm ' +
        (on ? 'btn-accent' : 'btn-outline') + '" aria-pressed="' + on + '">' +
        t(tab.key) + '</button>'
      );
    }).join('');

    tabsWrap.querySelectorAll('[data-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        location.hash = btn.getAttribute('data-tab');
      });
    });

    const list = active === 'all' ? PRODUCTS : PRODUCTS.filter(function (p) { return p.category === active; });
    grid.innerHTML = list.length
      ? list.map(productCard).join('')
      : '<p class="text-muted col-span-full text-center py-10">' + t('products.empty') + '</p>';

    refreshIcons();
    initReveal();
  }

  window.addEventListener('hashchange', render);
  document.addEventListener('mp:langchange', render);
  render();
}

/* ============================================================
   BOOT
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  /* apply saved language before first paint of dynamic content */
  setLang(currentLang);
  initReveal();
  initCounters();
  initAccordions();
  initForms();
  initProductGrid();

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateScrollState();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
});

/* Public helpers for page-level scripts (product grid, etc.) */
window.MP = {
  t: t,
  whatsappLink: whatsappLink,
  applyI18n: applyI18n,
  refreshIcons: refreshIcons,
  getLang: function () { return currentLang; }
};