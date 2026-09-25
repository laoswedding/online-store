/* ---------- add / edit ---------- */

  const itemDialog = $('#item-dialog');

  function openForm(it) {
    if (!canEdit()) return;
    editingId = it ? it.id : null;
    $('#item-dialog-title').textContent = it ? 'Edit item' : 'Add item';
    $('#form-save').textContent = it ? 'Save changes' : 'Add item';
    $('#f-name').value = it ? (it.name || '') : '';
    $('#f-price').value = it && it.price !== '' && it.price != null ? it.price : '';
    $('#f-category').value = it ? (it.category || '') : '';
    $('#f-stock').value = it && it.inStock !== '' && it.inStock != null ? it.inStock : '';
    $('#f-description').value = it ? (it.description || '') : '';
    $('#f-img').value = it ? (it.imgSrc || '') : '';
    $('#f-learn').value = it ? (it.learnMore || '') : '';
    $('#form-error').textContent = '';
    $('#form-meta').textContent = it && it.updatedBy
      ? 'Last updated by ' + it.updatedBy + (fmtDate(it.updatedAt) ? ' on ' + fmtDate(it.updatedAt) : '')
      : '';
    updatePreview();
    itemDialog.showModal();
    $('#f-name').focus();
  }

  function updatePreview() {
    const box = $('#img-preview');
    const url = imgUrl($('#f-img').value);
    if (!url) {
      box.hidden = true;
      box.replaceChildren();
      return;
    }
    const img = el('img', { src: url, alt: 'Preview of the image link', referrerpolicy: 'no-referrer' });
    img.addEventListener('error', () =>
      box.replaceChildren(el('span', { class: 'bad', text: 'This image couldn’t load. Check the link.' })));
    box.replaceChildren(img);
    box.hidden = false;
  }
  $('#f-img').addEventListener('input', debounce(updatePreview, 400));

  function readForm() {
    return {
      name: $('#f-name').value.trim(),
      price: $('#f-price').value.trim(),
      inStock: $('#f-stock').value.trim(),
      category: $('#f-category').value.trim(),
      description: $('#f-description').value.trim(),
      imgSrc: $('#f-img').value.trim(),
      learnMore: $('#f-learn').value.trim(),
    };
  }

  // Friendly checks only. The server re-validates everything.
  function validate(d) {
    if (!d.name) return 'Enter a name.';
    if (d.price === '' || !isFinite(Number(d.price)) || Number(d.price) < 0) return 'Enter a price of 0 or more.';
    if (d.inStock === '' || !Number.isInteger(Number(d.inStock)) || Number(d.inStock) < 0) {
      return 'Enter a stock quantity of 0 or more, using whole numbers.';
    }
    if (hasOtherScheme(d.imgSrc) || hasOtherScheme(d.learnMore)) {
      return 'Links must start with http:// or https://, or be a path like images/photo.jpg.';
    }
    return '';
  }

  $('#form-cancel').addEventListener('click', () => itemDialog.close());

  $('#item-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = readForm();
    const problem = validate(data);
    if (problem) {
      $('#form-error').textContent = problem;
      return;
    }
    data.price = Number(data.price);
    data.inStock = Number(data.inStock);

    const wasEdit = editingId !== null && editingId !== undefined;
    const btn = $('#form-save');
    const label = btn.textContent;
    $('#form-error').textContent = '';
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      if (wasEdit) await api('updateItem', session.token, editingId, data);
      else await api('createItem', session.token, data);
      itemDialog.close();
      toast(wasEdit ? 'Changes saved' : 'Item added');
      await loadItems();
    } catch (err) {
      if (isSessionError(err)) return expired();
      $('#form-error').textContent = messageOf(err);
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });

  