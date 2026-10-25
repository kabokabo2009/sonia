'use strict';

(() => {
  const { $, $$, esc, path, toDate, today, WEEK, getJSON, watch, fail } = window.site;
  const list = $('.js-news');
  const tabs = $('.js-news-tabs');
  const more = $('.js-news-more');
  const limit = 5;

  const href = n => {
    if (n.body) return { url: path(`news/detail/?id=${n.id}`), blank: false };
    if (n.url) return { url: n.url, blank: true };
    if (n.link) return { url: path(n.link), blank: false };
    return null;
  };

  const init = items => {
    const sorted = [...items].sort((a, b) => toDate(b.date) - toDate(a.date) || (b.id || 0) - (a.id || 0));
    const cats = [...new Set(sorted.map(n => n.category || 'Info'))];
    let filter = 'All';
    let expanded = false;

    tabs.innerHTML = ['All', ...cats].map((c, i) => `<button type="button" data-cat="${esc(c)}"${i === 0 ? ' class="is-active"' : ''}>${esc(c)}</button>`).join('');

    const row = (n, i) => {
      const d = toDate(n.date);
      const fresh = (today - d) / 86400000 <= 14 && d <= today;
      const inner = `<span class="news-date">${esc(n.date)}<small>[${WEEK[d.getDay()].slice(0, 3)}]</small>${fresh ? '<span class="badge">New</span>' : ''}</span><span class="news-title">${esc(n.title)}</span><span class="news-cat">${esc(n.category || 'Info')}</span><svg class="news-arrow"><use href="#i-arrow"/></svg>`;
      const h = href(n);
      const el = h
        ? `<a class="news-link" href="${esc(h.url)}"${h.blank ? ' target="_blank" rel="noopener"' : ''}>${inner}</a>`
        : `<div class="news-link">${inner}</div>`;
      return `<li class="news-item"${!expanded && i >= limit ? ' hidden' : ''} style="--i:${i % limit}">${el}</li>`;
    };

    const render = () => {
      const shown = sorted.filter(n => filter === 'All' || (n.category || 'Info') === filter);
      list.innerHTML = shown.length ? shown.map(row).join('') : '<li class="empty">No news.</li>';
      watch($$('.news-item', list));
      more.hidden = expanded || shown.length <= limit;
    };

    tabs.addEventListener('click', e => {
      const b = e.target.closest('[data-cat]');
      if (!b) return;
      filter = b.dataset.cat;
      $$('button', tabs).forEach(x => x.classList.toggle('is-active', x === b));
      render();
    });

    more.addEventListener('click', () => {
      expanded = true;
      $$('.news-item[hidden]', list).forEach(li => {
        li.hidden = false;
        requestAnimationFrame(() => li.classList.add('is-in'));
      });
      more.hidden = true;
    });

    render();
  };

  getJSON('data/news.json').then(init).catch(() => fail(list, 'Failed to load.'));
})();
