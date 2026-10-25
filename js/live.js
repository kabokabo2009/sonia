'use strict';

(() => {
  const { $, $$, esc, pad, path, toDate, today, WEEK, arrow, getJSON, watch, fail } = window.site;
  const list = $('.js-live');
  const tabs = $$('[data-live]');

  const init = items => {
    const all = items.map(l => ({ ...l, _d: toDate(l.date) }));
    const groups = {
      upcoming: all.filter(l => l._d >= today).sort((a, b) => a._d - b._d),
      past: all.filter(l => l._d < today).sort((a, b) => b._d - a._d)
    };

    const row = (l, i, past) => {
      const d = l._d;
      const meta = [l.open ? `Open<b>${esc(l.open)}</b>` : '', l.start ? `Start<b>${esc(l.start)}</b>` : '']
        .filter(Boolean).map(s => `<span>${s}</span>`).join('');
      return `<li class="live-item${past ? ' is-past' : ''}" style="--i:${i}">
        <div class="live-when"><span class="live-day">${pad(d.getMonth() + 1)}.${pad(d.getDate())}</span><span class="live-week">${d.getFullYear()} [${WEEK[d.getDay()]}]</span></div>
        <div class="live-info">
          <p class="live-title"><a href="${esc(path(`live/detail/?id=${l.id}`))}">${esc(l.title)}</a></p>
          ${l.venue ? `<p class="live-venue">${esc(l.venue)}${l.area ? `<span>${esc(l.area)}</span>` : ''}</p>` : ''}
          ${meta ? `<p class="live-meta">${meta}</p>` : ''}
        </div>
        <div class="live-act">
          ${!past && l.ticket ? `<a class="ticket-btn" href="${esc(l.ticket)}" target="_blank" rel="noopener">Ticket${arrow}</a>` : ''}
          <span class="live-more">Detail${arrow}</span>
        </div>
      </li>`;
    };

    const render = key => {
      const g = groups[key];
      list.innerHTML = g.length
        ? g.map((l, i) => row(l, i, key === 'past')).join('')
        : `<li class="empty">${key === 'past' ? 'No archive.' : 'Coming soon.'}</li>`;
      watch($$('.live-item', list));
      tabs.forEach(t => {
        const on = t.dataset.live === key;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
    };

    tabs.forEach(t => t.addEventListener('click', () => render(t.dataset.live)));
    render(groups.upcoming.length || !groups.past.length ? 'upcoming' : 'past');
  };

  getJSON('data/live.json').then(init).catch(() => fail(list, 'Failed to load.'));
})();
