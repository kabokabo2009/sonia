'use strict';

(() => {
  const { $, esc, pad, path, paragraphs, toDate, today, WEEK, arrow, getJSON } = window.site;
  const box = $('.js-article');
  const pager = $('.js-pager');
  const id = Number(new URLSearchParams(location.search).get('id'));

  const notFound = () => {
    box.innerHTML = '<p class="empty">公演情報が見つかりませんでした。</p>';
    document.title = 'Live｜素二愛 Sonia OFFICIAL WEB SITE';
  };

  getJSON('data/live.json').then(items => {
    const list = [...items].sort((a, b) => toDate(a.date) - toDate(b.date));
    const i = list.findIndex(l => l.id === id);
    if (i < 0) return notFound();
    const l = list[i];
    const d = toDate(l.date);
    const past = d < today;
    document.title = `${l.title}｜素二愛 Sonia OFFICIAL WEB SITE`;

    const rows = [
      ['Area', l.area],
      ['Venue', l.venue ? (l.venueUrl ? `<a href="${esc(l.venueUrl)}" target="_blank" rel="noopener">${esc(l.venue)}</a>` : esc(l.venue)) : ''],
      ['Address', esc(l.address || '')],
      ['Time', [l.open ? `OPEN ${esc(l.open)}` : '', l.start ? `START ${esc(l.start)}` : ''].filter(Boolean).join(' / ')],
      ['Price', esc(l.price || '')]
    ].filter(r => r[1]).map(([k, v]) => `<div><dt>${k}</dt><dd>${k === 'Area' ? esc(v) : v}</dd></div>`).join('');

    box.innerHTML = `
      <div class="live-head">
        <p class="live-when"><span class="live-day">${pad(d.getMonth() + 1)}.${pad(d.getDate())}</span><span class="live-week">${d.getFullYear()} [${WEEK[d.getDay()]}]${past ? '<em class="badge is-mute">Finished</em>' : ''}</span></p>
        <h1 class="article-title">${esc(l.title)}</h1>
      </div>
      <div class="live-body${l.image ? ' has-image' : ''}">
        ${l.image ? `<figure class="article-image"><img src="${esc(path(l.image))}" alt=""></figure>` : ''}
        <div>
          <dl class="live-table">${rows}</dl>
          ${l.detail ? `<div class="article-body">${paragraphs(l.detail)}</div>` : ''}
          ${!past && l.ticket ? `<div class="article-links"><a class="ticket-btn" href="${esc(l.ticket)}" target="_blank" rel="noopener">Ticket${arrow}</a></div>` : ''}
        </div>
      </div>`;
    box.classList.add('is-in');

    const prev = list[i - 1];
    const next = list[i + 1];
    pager.innerHTML = `
      ${prev ? `<a class="pager-link is-next" href="?id=${prev.id}"><small>Prev</small><span>${esc(prev.title)}</span></a>` : '<span></span>'}
      <a class="pager-back" href="${esc(path('#live'))}">Back to Live</a>
      ${next ? `<a class="pager-link is-prev" href="?id=${next.id}"><small>Next</small><span>${esc(next.title)}</span></a>` : '<span></span>'}`;
  }).catch(notFound);
})();
