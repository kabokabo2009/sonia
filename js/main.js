'use strict';

(() => {
  const { $, pad, clamp, reduced } = window.site;
  const body = document.body;
  const mv = $('.mv');
  const kv = $('.mv-video');

  (() => {
    const count = $('.js-count');
    const bar = $('.js-bar');
    const start = performance.now();
    const minTime = reduced ? 300 : 1600;
    let loaded = false;
    Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      kv.readyState >= 2 ? Promise.resolve() : new Promise(res => { kv.addEventListener('loadeddata', res, { once: true }); kv.addEventListener('error', res, { once: true }); })
    ]).then(() => { loaded = true; });
    setTimeout(() => { loaded = true; }, 6000);
    const tick = now => {
      const t = clamp((now - start) / minTime, 0, 1);
      const p = loaded ? t : Math.min(t, 0.88);
      count.textContent = pad(Math.round(p * 100), 3);
      bar.style.transform = `scaleX(${p})`;
      if (p < 1) return requestAnimationFrame(tick);
      setTimeout(() => {
        body.classList.remove('is-loading');
        body.classList.add('is-ready');
      }, 250);
    };
    requestAnimationFrame(tick);
  })();

  const sky = (() => {
    const canvas = $('.mv-sky');
    const ctx = canvas.getContext('2d');
    const colors = ['242,239,245', '177,140,255', '177,140,255', '192,65,63'];
    let w = 0;
    let h = 0;
    let stars = [];
    let visible = true;

    const create = () => {
      const z = Math.random() ** 1.7;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        z,
        r: 0.4 + z * 1.7,
        tw: Math.random() * Math.PI * 2,
        spark: z > 0.7 && Math.random() > 0.4,
        c: Math.random() > 0.5 ? colors[0] : colors[1 + Math.floor(Math.random() * 3)]
      };
    };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const nw = canvas.clientWidth;
      const nh = canvas.clientHeight;
      if (!nw || !nh) return;
      if (w && h) stars.forEach(s => { s.x *= nw / w; s.y *= nh / h; });
      w = nw;
      h = nh;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
      const n = Math.round(clamp(w * h / 8000, 60, 200));
      while (stars.length < n) stars.push(create());
      stars.length = n;
    };

    const spark = (x, y, r) => {
      const s = r * 3.6;
      ctx.beginPath();
      ctx.moveTo(x, y - s);
      ctx.quadraticCurveTo(x, y, x + s, y);
      ctx.quadraticCurveTo(x, y, x, y + s);
      ctx.quadraticCurveTo(x, y, x - s, y);
      ctx.quadraticCurveTo(x, y, x, y - s);
      ctx.fill();
    };

    const draw = t => {
      ctx.clearRect(0, 0, w, h);
      stars.forEach(s => {
        if (!reduced) {
          s.x -= 0.04 + s.z * 0.22;
          if (s.x < -10) { s.x = w + 10; s.y = Math.random() * h; }
        }
        const py = s.y - scrollY * s.z * 0.4;
        const a = (0.2 + s.z * 0.7) * (0.5 + 0.5 * Math.sin(t * 0.0013 + s.tw));
        ctx.fillStyle = `rgba(${s.c},${a})`;
        if (s.spark) spark(s.x, py, s.r);
        else {
          ctx.beginPath();
          ctx.arc(s.x, py, s.r * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(mv);
    resize();
    new ResizeObserver(resize).observe(canvas);
    return { draw, isVisible: () => visible };
  })();

  if (reduced) kv.pause();
  new IntersectionObserver(([e]) => {
    if (reduced) return;
    if (e.isIntersecting) kv.play().catch(() => {});
    else kv.pause();
  }).observe(mv);

  const profileImg = $('.profile-frame img');

  const frame = t => {
    const y = scrollY;
    if (sky.isVisible()) {
      mv.style.setProperty('--p', clamp(y / mv.offsetHeight, 0, 1).toFixed(4));
      sky.draw(t);
    }
    if (!reduced) {
      const pr = profileImg.getBoundingClientRect();
      if (pr.bottom > 0 && pr.top < innerHeight) {
        const k = (pr.top + pr.height / 2 - innerHeight / 2) / innerHeight;
        profileImg.style.setProperty('--py', `${-8 + k * 10}%`);
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
