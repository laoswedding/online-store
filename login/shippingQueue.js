  /* ---------- shipping queue ---------- */

  function renderShipping() {
    const body = $('#ship-body');
    $('#ship-count').textContent = '';
    if (ordersProblem(body)) return;

    const list = pendingOrders().sort(byDate(1)); // oldest first
    if (!list.length) {
      body.replaceChildren(emptyBlock('Nothing to ship', 'Every order is either shipped or cancelled.'));
      return;
    }
    $('#ship-count').textContent = list.length + (list.length === 1 ? ' order waiting' : ' orders waiting');

    const groups = new Map();
    list.forEach((o) => {
      const key = String(o.shippingCompany || '').trim() || 'No shipping company';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(o);
    });

    const nodes = [];
    groups.forEach((arr, company) => {
      const group = el('section', { class: 'group' },
        el('h2', { class: 'section-title', text: company + ' (' + arr.length + ')' }));
      arr.forEach((o) => group.append(el('article', { class: 'order-block' },
        el('div', { class: 'order-head' },
          el('h3', { text: 'Order #' + o.orderId }),
          el('span', { class: 'sub', text: dateTimeLabel(o) }),
          el('span', { class: 'price', text: fmtMoney(orderTotal(o)) })),
        orderDetail(o))));
      nodes.push(group);
    });
    body.replaceChildren(...nodes);
  }