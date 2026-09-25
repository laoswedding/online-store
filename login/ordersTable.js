  /* ---------- orders table ---------- */

  function renderOrders() {
    const body = $('#orders-body');
    $('#orders-count').textContent = '';
    if (ordersProblem(body)) return;
    if (!orders.length) {
      body.replaceChildren(emptyBlock('No orders yet', 'Orders placed on your store will appear here.'));
      return;
    }

    const q = $('#orders-search').value.trim().toLowerCase();
    const st = $('#orders-status').value;
    const list = orders.filter((o) => {
      if (st && orderStatus(o) !== st) return false;
      if (q && ![o.orderId, o.firstName, o.lastName, o.phone].join(' ').toLowerCase().includes(q)) return false;
      return true;
    }).sort(byDate(-1)); // newest first

    $('#orders-count').textContent = list.length === orders.length
      ? orders.length + (orders.length === 1 ? ' order' : ' orders')
      : list.length + ' of ' + orders.length + ' orders';
    if (!list.length) {
      body.replaceChildren(emptyBlock('No orders match', 'Try a different search or status.'));
      return;
    }

    const tbody = el('tbody');
    list.forEach((o) => {
      const id = String(o.orderId);
      const isOpen = openOrderIds.has(id);
      const btn = el('button', {
        class: 'btn small', type: 'button', text: isOpen ? 'Hide' : 'Details',
        'aria-expanded': String(isOpen), 'aria-label': (isOpen ? 'Hide' : 'Show') + ' details for order ' + id,
      });
      const row = el('tr', isOpen ? { class: 'is-open' } : null,
        el('td', { class: 'id', text: '#' + id }),
        el('td', { text: dateLabel(o) }),
        el('td', { text: customerName(o) }),
        el('td', { class: 'hide-sm', text: destination(o) }),
        el('td', { class: 'num', text: fmtMoney(orderTotal(o)) }),
        el('td', null, statusBadge(orderStatus(o))),
        el('td', null, btn));
      const cell = el('td', { colspan: '7' });
      const detail = el('tr', { class: 'detail' }, cell);
      detail.hidden = !isOpen;
      if (isOpen) cell.append(orderDetail(o));

      btn.addEventListener('click', () => {
        const opening = detail.hidden;
        detail.hidden = !opening;
        if (opening && !cell.firstChild) cell.append(orderDetail(o));
        if (opening) openOrderIds.add(id); else openOrderIds.delete(id);
        row.classList.toggle('is-open', opening);
        btn.textContent = opening ? 'Hide' : 'Details';
        btn.setAttribute('aria-expanded', String(opening));
        btn.setAttribute('aria-label', (opening ? 'Hide' : 'Show') + ' details for order ' + id);
      });
      tbody.append(row, detail);
    });

    const head = el('tr', null,
      el('th', { text: 'Order' }), el('th', { text: 'Date' }), el('th', { text: 'Customer' }),
      el('th', { class: 'hide-sm', text: 'Destination' }), el('th', { class: 'num', text: 'Total' }),
      el('th', { text: 'Status' }), el('th', null, el('span', { class: 'sr-only', text: 'Actions' })));
    body.replaceChildren(el('table', { class: 'orders' }, el('thead', null, head), tbody));
  }

  $('#orders-search').addEventListener('input', debounce(renderOrders, 150));
  $('#orders-status').addEventListener('change', renderOrders);
