'use strict';

(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const src = document.currentScript ? document.currentScript.src : '';
  const base = src.replace(/js\/common\.js.*$/, '');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const path = p => (!p || /^(https?:|mailto:)/.test(p) ? p : base + p.replace(/^\.?\//, ''));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  const lock = on => {
    if (on && !root.classList.contains('is-locked')) {
      root.style.setProperty('--sbw', `${innerWidth - root.clientWidth}px`);
    }
    root.classList.toggle('is-locked', on);
    if (!on) root.style.removeProperty('--sbw');
  };

  const modal = $('#modal');
  const modalContent = modal ? $('.js-modal-content', modal) : null;

  const openModal = html => {
    if (!modal) return;
    modalContent.innerHTML = html;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lock(true);
    $('.modal-close', modal).focus({ preventScroll: true });
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (!$('#drawer').classList.contains('is-open')) lock(false);
    setTimeout(() => { if (!modal.classList.contains('is-open')) modalContent.innerHTML = ''; }, 600);
  };

  if (modal) $$('[data-close]', modal).forEach(el => el.addEventListener('click', closeModal));

  const text = s => esc(s).replace(/\n/g, '<br>');

  window.site = {
    root,
    base,
    path,
    $,
    $$,
    reduced,
    finePointer,
    today,
    esc,
    text,
    paragraphs: s => String(s || '').split(/\n{2,}/).map(p => `<p>${text(p.trim())}</p>`).join(''),
    WEEK: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
    arrow: '<svg><use href="#i-arrow"/></svg>',
    clamp: (v, a, b) => Math.min(b, Math.max(a, v)),
    lerp: (a, b, t) => a + (b - a) * t,
    pad: (n, l = 2) => String(n).padStart(l, '0'),
    toDate: s => {
      const [y, m, d] = String(s).split(/[-./]/).map(Number);
      return new Date(y, (m || 1) - 1, d || 1);
    },
    getJSON: file => fetch(base + file, { cache: 'no-cache' }).then(r => {
      if (!r.ok) throw new Error(file);
      return r.json();
    }),
    fail: (el, msg) => { if (el) el.innerHTML = `<li class="empty">${msg}</li>`; },
    watch: els => els.forEach(el => io.observe(el)),
    lock,
    openModal,
    closeModal,
    isModalOpen: () => !!modal && modal.classList.contains('is-open')
  };
})();
