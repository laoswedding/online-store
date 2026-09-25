  /* ---------- sales ---------- */

  const RANGE_DAYS = { '7': 7, '30': 30, '90': 90, all: null };
  const dayKey = (d) => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  const monthKey = (d) => d.getFullYear() + '-' + (d.getMonth() + 1);

  function renderSales() {
    const body = $('#sales-body');
    if (ordersProblem(body)) return;

    const days = RANGE_DAYS[$('#sales-range').value];
    const now = new Date();
    const from = days ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1)) : null;
    const inRange = orders.filter((o) => { const d = orderDate(o); return d && (!from || d >= from); });
    const shipped = inRange.filter((o) => orderStatus(o) === 'shipped');
    const pending = inRange.filter((o) => orderStatus(o) === 'pending');
    const cancelled = inRange.filter((o) => orderStatus(o) === 'cancelled');
    const sum = (list) => list.reduce((t, o) => t + orderTotal(o), 0);
    const revenue = sum(shipped);
    const units = shipped.reduce((t, o) => t + orderLines(o).reduce((n, l) => n + (Number(l.numberOfUnits) || 0), 0), 0);
    const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);

    const stat = (label, value, sub) => el('div', { class: 'stat' },
      el('dt', { text: label }),
      el('dd', null, el('span', { class: 'big', text: value }), el('span', { class: 'sub', text: sub })));
    const stats = el('dl', { class: 'stats' },
      stat('Revenue', fmtMoney(revenue), plural(shipped.length, 'shipped order', 'shipped orders')),
      stat('Average order', shipped.length ? fmtMoney(revenue / shipped.length) : '–', 'Shipped orders only'),
      stat('Units sold', String(units), 'Shipped orders only'),
      stat('Waiting to ship', fmtMoney(sum(pending)), plural(pending.length, 'order', 'orders')),
      stat('Cancelled', String(cancelled.length), fmtMoney(sum(cancelled)) + ' not collected'));

    // Revenue chart: one bar per day, or per month for "All time".
    const buckets = [];
    if (days) {
      for (let i = 0; i < days; i++) {
        const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
        buckets.push({ key: dayKey(d), label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), value: 0 });
      }
    } else if (shipped.length) {
      const first = new Date(Math.min(...shipped.map(orderDate)));
      for (let d = new Date(first.getFullYear(), first.getMonth(), 1); d <= now; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
        buckets.push({ key: monthKey(d), label: d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }), value: 0 });
      }
    }
    const keyOf = days ? dayKey : monthKey;
    const index = new Map(buckets.map((b) => [b.key, b]));
    shipped.forEach((o) => { const b = index.get(keyOf(orderDate(o))); if (b) b.value += orderTotal(o); });

    const parts = [stats];
    const max = buckets.length ? Math.max(...buckets.map((b) => b.value)) : 0;
    if (max > 0) {
      const best = buckets.reduce((a, b) => (b.value > a.value ? b : a), buckets[0]);
      const bars = el('div', {
        class: 'bars', role: 'img',
        'aria-label': 'Revenue by ' + (days ? 'day' : 'month') + '. Best ' + (days ? 'day' : 'month') + ' was ' + best.label + ' with ' + fmtMoney(best.value) + '.',
      });
      buckets.forEach((b) => {
        const bar = el('div', { class: 'bar' + (b.value ? '' : ' zero'), title: b.label + ': ' + fmtMoney(b.value) });
        bar.style.height = b.value ? Math.max(2, (b.value / max) * 100) + '%' : '2px';
        bars.append(bar);
      });
      parts.push(el('figure', { class: 'chart' }, bars, el('div', { class: 'axis' },
        el('span', { text: buckets[0].label }),
        el('span', { text: 'Best ' + (days ? 'day' : 'month') + ': ' + best.label + ', ' + fmtMoney(best.value) }),
        el('span', { text: buckets[buckets.length - 1].label }))));
    }

    // Best sellers, by units on shipped orders.
    const tally = new Map();
    shipped.forEach((o) => orderLines(o).forEach((l) => {
      const k = String(l.id);
      tally.set(k, (tally.get(k) || 0) + (Number(l.numberOfUnits) || 0));
    }));
    const top = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const topSection = el('section', { class: 'group' }, el('h2', { class: 'section-title', text: 'Best sellers' }));
    if (!top.length) {
      topSection.append(el('p', { class: 'sub', text: 'No shipped orders in this period.' }));
    } else {
      top.forEach(([id, n]) => {
        const it = itemById(id);
        const meter = el('div', { class: 'meter', 'aria-hidden': 'true' }, el('span'));
        meter.firstChild.style.width = (n / top[0][1]) * 100 + '%';
        topSection.append(el('div', { class: 'toprow' },
          el('span', { text: it ? String(it.name) : 'Item ' + id }),
          el('span', { class: 'val', text: plural(n, 'unit', 'units') }),
          meter));
      });
    }
    parts.push(topSection);
    parts.push(el('p', { class: 'note', text: 'Sales are counted when an order ships. Days shown are the day each order was placed, because the sheet doesn’t record ship dates.' }));
    body.replaceChildren(...parts);
  }

  $('#sales-range').addEventListener('change', renderSales);