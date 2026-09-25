  /* ---------- overview ---------- */

  function renderOverview() {
    const body = $('#overview-body');
    if (ordersProblem(body)) return;

    const pending = pendingOrders().sort(byDate(1));
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const shipped30 = orders.filter((o) => orderStatus(o) === 'shipped' && (orderDate(o) || 0) >= since);
    const revenue30 = shipped30.reduce((sum, o) => sum + orderTotal(o), 0);
    const low = items.filter((i) => stockQty(i.inStock) <= LOW_STOCK)
      .sort((a, b) => stockQty(a.inStock) - stockQty(b.inStock));
    const out = items.filter((i) => stockQty(i.inStock) <= 0).length;

    const stat = (label, value, sub) => el('div', { class: 'stat' },
      el('dt', { text: label }),
      el('dd', null, el('span', { class: 'big', text: value }), el('span', { class: 'sub', text: sub })));

    const stats = el('dl', { class: 'stats' },
      stat('Waiting to ship', String(pending.length),
        pending.length ? 'Oldest is from ' + dateLabel(pending[0]) : 'All caught up'),
      stat('Revenue, last 30 days', fmtMoney(revenue30),
        shipped30.length + (shipped30.length === 1 ? ' order shipped' : ' orders shipped')),
      stat('Running low', String(low.length), out + ' out of stock'));

    const waitingList = el('ul', { class: 'rows' });
    if (!pending.length) waitingList.append(el('li', null, el('span', { class: 'sub', text: 'Nothing is waiting to ship.' })));
    pending.slice(0, 5).forEach((o) => waitingList.append(el('li', null,
      el('span', null, '#' + o.orderId + ' ' + customerName(o), el('span', { class: 'sub block', text: dateLabel(o) })),
      el('span', { class: 'val', text: fmtMoney(orderTotal(o)) }))));

    const lowList = el('ul', { class: 'rows' });
    if (!low.length) lowList.append(el('li', null, el('span', { class: 'sub', text: 'Every item has more than ' + LOW_STOCK + ' in stock.' })));
    low.slice(0, 6).forEach((it) => {
      const q = stockQty(it.inStock);
      lowList.append(el('li', null,
        el('span', null, String(it.name || ''), it.category ? el('span', { class: 'sub block', text: it.category }) : null),
        el('span', { class: 'val', text: q <= 0 ? 'Out of stock' : q + ' left' })));
    });

    body.replaceChildren(stats, el('div', { class: 'panels' },
      el('section', null,
        el('h2', { class: 'section-title' }, el('span', { text: 'Waiting to ship' }), el('a', { href: '#shipping', text: 'Open shipping' })),
        waitingList),
      el('section', null,
        el('h2', { class: 'section-title' }, el('span', { text: 'Running low' }), el('a', { href: '#inventory', text: 'Open inventory' })),
        lowList)));
  }