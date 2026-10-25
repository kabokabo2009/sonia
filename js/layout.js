'use strict';

(() => {
  const { root, $, $$, esc, lerp, reduced, finePointer, watch, lock, closeModal, isModalOpen } = window.site;
  const body = document.body;

  const splitChars = el => {
    const str = el.textContent.trim();
    el.setAttribute('aria-label', str);
    el.innerHTML = [...str].map((c, i) => `<span class="char" aria-hidden="true" style="--i:${i}">${esc(c)}</span>`).join('');
  };
  window.site.splitChars = splitChars;
  $$('[data-split]').forEach(splitChars);
  watch($$('[data-split], [data-reveal], .ruler'));

  if (!$('.loader')) body.classList.add('is-ready');

  const header = $('.site-header');
  const menuBtn = $('.menu-btn');
  const drawer = $('#drawer');
  const solidAt = () => {
    const mv = $('.mv');
    return mv ? mv.offsetHeight - 80 : 10;
  };
  let lastY = scrollY;

  const setDrawer = open => {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    lock(open);
    header.classList.remove('is-hidden');
  };
  menuBtn.addEventListener('click', () => setDrawer(!drawer.classList.contains('is-open')));
  $$('a', drawer).forEach(a => a.addEventListener('click', () => setDrawer(false)));

  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (isModalOpen()) closeModal();
    else if (drawer.classList.contains('is-open')) setDrawer(false);
  });

  const onScroll = () => {
    const y = scrollY;
    if (!drawer.classList.contains('is-open')) {
      header.classList.toggle('is-hidden', y > lastY && y > innerHeight * 0.8);
      header.classList.toggle('is-solid', y > solidAt());
    }
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const emblem = $('.emblem');
  const footerLogo = $('.footer-logo');
  const frame = () => {
    const y = scrollY;
    emblem.style.setProperty('--rot', `${y * 0.025}deg`);
    emblem.style.setProperty('--sc', (1 + Math.sin(y * 0.0012) * 0.08).toFixed(4));
    const rest = root.scrollHeight - innerHeight - y;
    footerLogo.style.setProperty('--fy', `${Math.min(Math.max(0, rest), innerHeight) * 0.16}px`);
    requestAnimationFrame(frame);
  };
  if (!reduced) requestAnimationFrame(frame);

  if (finePointer) {
    const cursor = $('.cursor');
    const dot = $('.cursor-dot');
    const ring = $('.cursor-ring');
    const label = $('.cursor-label');
    const pos = { x: innerWidth / 2, y: innerHeight / 2, rx: innerWidth / 2, ry: innerHeight / 2 };
    addEventListener('pointermove', e => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      cursor.classList.add('is-active');
      dot.style.transform = `translate3d(${pos.x}px,${pos.y}px,0)`;
    }, { passive: true });
    const loop = () => {
      pos.rx = lerp(pos.rx, pos.x, 0.18);
      pos.ry = lerp(pos.ry, pos.y, 0.18);
      ring.style.transform = `translate3d(${pos.rx}px,${pos.ry}px,0)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('pointerover', e => {
      const labeled = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, label, input, textarea');
      cursor.classList.toggle('is-label', !!labeled);
      cursor.classList.toggle('is-hover', !labeled && !!link);
      label.textContent = labeled ? labeled.dataset.cursor : '';
    });
    root.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
  }
})();
