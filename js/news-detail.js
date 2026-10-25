'use strict';

(() => {
  const { $, esc, path, paragraphs, toDate, WEEK, arrow, getJSON } = window.site;
  const box = $('.js-article');
  const pager = $('.js-pager');
  const id = Number(new URLSearchParams(location.search).get('id'));

  const notFound = () => {
    box.innerHTML = '<p class="empty">記事が見つかりませんでした。</p>';
    document.title = 'News｜素二愛 Sonia OFFICIAL WEB SITE';
  };

  getJSON('data/news.json').then(items => {
    const list = items.filter(n => n.body).sort((a, b) => toDate(b.date) - toDate(a.date) || (b.id || 0) - (a.id || 0));
    const i = list.findIndex(n => n.id === id);
    if (i < 0) return notFound();
    const n = list[i];
    const d = toDate(n.date);
    document.title = `${n.title}｜素二愛 Sonia OFFICIAL WEB SITE`;

    const links = (n.links || []).map(l => {
      const ext = /^https?:/.test(l.url);
      return `<a class="more-btn" href="${esc(path(l.url))}"${ext ? ' target="_blank" rel="noopener"' : ''}>${esc(l.label)}${arrow}</a>`;
    }).join('');

    box.innerHTML = `
      <p class="article-meta"><span class="news-date">${esc(n.date)}<small>[${WEEK[d.getDay()]}]</small></span><span class="news-cat">${esc(n.category || 'Info')}</span></p>
      <h1 class="article-title">${esc(n.title)}</h1>
      ${n.image ? `<figure class="article-image"><img src="${esc(path(n.image))}" alt=""></figure>` : ''}
      <div class="article-body">${paragraphs(n.body)}</div>
      ${links ? `<div class="article-links">${links}</div>` : ''}`;
    box.classList.add('is-in');

    const prev = list[i + 1];
    const next = list[i - 1];
    pager.innerHTML = `
      ${next ? `<a class="pager-link is-next" href="?id=${next.id}"><small>Newer</small><span>${esc(next.title)}</span></a>` : '<span></span>'}
      <a class="pager-back" href="${esc(path('#news'))}">Back to News</a>
      ${prev ? `<a class="pager-link is-prev" href="?id=${prev.id}"><small>Older</small><span>${esc(prev.title)}</span></a>` : '<span></span>'}`;
  }).catch(notFound);
})();
