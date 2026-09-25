  /* ---------- delete (admins only) ---------- */

  const deleteDialog = $('#delete-dialog');

  function openDelete(it) {
    if (!canDelete()) return;
    deleteTarget = it;
    $('#delete-title').textContent = 'Delete “' + it.name + '”?';
    $('#delete-body').textContent = 'This removes it from the sheet for everyone and can’t be undone.';
    $('#delete-error').textContent = '';
    deleteDialog.showModal();
  }

  $('#delete-cancel').addEventListener('click', () => deleteDialog.close());

  $('#delete-confirm').addEventListener('click', async () => {
    const btn = $('#delete-confirm');
    btn.disabled = true;
    btn.textContent = 'Deleting…';
    try {
      await api('deleteItem', session.token, deleteTarget.id);
      deleteDialog.close();
      toast('Item deleted');
      await loadItems();
    } catch (err) {
      if (isSessionError(err)) return expired();
      $('#delete-error').textContent = messageOf(err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Delete item';
    }
  });