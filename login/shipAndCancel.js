  /* ---------- ship and cancel ---------- */

  const confirmDialog = $('#confirm-dialog');
  let confirmRun = null;

  function confirmAction(opts) {
    $('#confirm-title').textContent = opts.title;
    $('#confirm-body').textContent = opts.body;
    $('#confirm-error').textContent = '';
    const ok = $('#confirm-ok');
    ok.textContent = opts.confirmLabel;
    ok.className = 'btn ' + (opts.danger ? 'danger-solid' : 'primary');
    $('#confirm-cancel').textContent = opts.cancelLabel || 'Go back';
    confirmRun = opts.run;
    confirmDialog.showModal();
  }

  $('#confirm-cancel').addEventListener('click', () => confirmDialog.close());
  $('#confirm-ok').addEventListener('click', async () => {
    const btn = $('#confirm-ok');
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Working…';
    try {
      await confirmRun();
      confirmDialog.close();
    } catch (err) {
      if (isSessionError(err)) return expired();
      $('#confirm-error').textContent = messageOf(err);
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });

  function shipOrderFlow(o) {
    const chk = stockCheck(o);
    confirmAction({
      title: 'Ship order #' + o.orderId + '?',
      body: chk.ok
        ? 'This takes the ordered units out of inventory and marks the order as shipped. It can’t be undone.'
        : 'Not enough stock: ' + chk.problems.join('; ') + '. Shipping will take stock below zero. It can’t be undone.',
      confirmLabel: 'Ship order',
      danger: !chk.ok,
      run: async () => {
        const res = await api('shipOrder', session.token, o.orderId);
        const missing = (res && res.warnings && res.warnings.itemsNotFoundInInventory) || [];
        toast('Order shipped' + (missing.length ? '. Not found in inventory: ' + missing.join(', ') : ''), missing.length ? 7000 : 3000);
        loadAll();
      },
    });
  }

  function cancelOrderFlow(o) {
    confirmAction({
      title: 'Cancel order #' + o.orderId + '?',
      body: 'The order is marked as cancelled. Stock doesn’t change, because units only leave inventory when an order ships.',
      confirmLabel: 'Cancel order',
      cancelLabel: 'Keep order',
      danger: true,
      run: async () => {
        await api('cancelOrder', o.orderId);
        toast('Order cancelled');
        loadAll();
      },
    });
  }