'use strict';

(() => {
  const { $, $$, esc, path, pad, arrow, getJSON, watch, openModal, fail } = window.site;
  const grid = $('.js-gallery');
  if (!grid) return;
  const limit = Number(grid.dataset.limit) || 0;
  const tabs = $$('[data-filter]');

  const ytThumb = id => `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
  const thumbOf = g => path(g.thumb || g.src || (g.youtube ? ytThumb(g.youtube) : ''));
  const photosOf = g => (Array.isArray(g.images) && g.images.length ? g.images : [g.src || g.thumb]).map(path);

  const playMovie = g => {
    let player = '<p class="modal-soon">Coming soon.</p>';
    if (g.youtube) {
      player = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(g.youtube)}?autoplay=1&rel=0&playsinline=1" title="${esc(g.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    } else if (g.video) {
      player = `<video src="${esc(path(g.video))}" poster="${esc(thumbOf(g))}" controls autoplay playsinline></video>`;
    }
    const yt = g.youtube ? `<a class="modal-yt" href="https://www.youtube.com/watch?v=${encodeURIComponent(g.youtube)}" target="_blank" rel="noopener">Watch on YouTube${arrow}</a>` : '';
    openModal(`<div class="modal-movie">${player}</div><div class="modal-foot"><p class="modal-caption">${esc(g.title)}</p>${yt}</div>`);
  };

  const showPhotos = (g, start = 0) => {
    const list = photosOf(g);
    let i = start;
    const draw = () => {
      openModal(`<figure class="modal-photo">
        <img src="${esc(list[i])}" alt="${esc(g.title)}">
        <figcaption class="modal-foot">
          <span class="modal-caption">${esc(g.title)}</span>
          ${list.length > 1 ? `<span class="modal-pager">
            <button type="button" class="arrow-btn is-prev" data-step="-1" aria-label="前の写真"${i === 0 ? ' disabled' : ''}>${arrow}</button>
            <span class="modal-count">${pad(i + 1)} / ${pad(list.length)}</span>
            <button type="button" class="arrow-btn" data-step="1" aria-label="次の写真"${i === list.length - 1 ? ' disabled' : ''}>${arrow}</button>
          </span>` : ''}
        </figcaption>
      </figure>`);
      $$('[data-step]', $('.js-modal-content')).forEach(b => b.addEventListener('click', () => {
        i = Math.min(list.length - 1, Math.max(0, i + Number(b.dataset.step)));
        draw();
      }));
    };
    draw();
  };

  const card = (g, i) => {
    const movie = g.type === 'movie';
    const photos = movie ? 1 : photosOf(g).length;
    return `<li class="gallery-item" data-type="${movie ? 'movie' : 'photo'}" style="--i:${i % 6}">
      <button type="button" class="gallery-card" data-index="${i}">
        <span class="gallery-thumb">
          <img src="${esc(thumbOf(g))}" alt="${esc(g.title)}" loading="lazy">
          ${movie ? '<span class="gallery-play" aria-hidden="true"></span>' : ''}
          ${photos > 1 ? `<span class="gallery-count-badge">${photos} photos</span>` : ''}
        </span>
        <span class="gallery-meta"><em>${esc(g.category || (movie ? 'Movie' : 'Photo'))}</em><strong>${esc(g.title)}</strong></span>
      </button>
    </li>`;
  };

  const init = data => {
    let items = data;

    const render = filter => {
      items = data.filter(g => !filter || filter === 'all' || g.type === filter);
      if (limit) items = items.slice(0, limit);
      grid.innerHTML = items.length ? items.map(card).join('') : '<li class="empty">Coming soon.</li>';
      watch($$('.gallery-item', grid));
    };

    grid.addEventListener('click', e => {
      const c = e.target.closest('[data-index]');
      if (!c) return;
      const g = items[Number(c.dataset.index)];
      if (g.type === 'movie') playMovie(g);
      else showPhotos(g);
    });

    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(b => b.classList.toggle('is-active', b === t));
      render(t.dataset.filter);
    }));

    render('all');
  };

  getJSON('data/gallery.json').then(init).catch(() => fail(grid, 'Failed to load.'));
})();
