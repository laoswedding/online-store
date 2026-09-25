  /* ---------- change password ---------- */

  const MIN_PASSWORD_LENGTH = 10; // keep in sync with Code.gs
  const pwDialog = $('#pw-dialog');
  let pwBusy = false; // stops a second click or Enter press from sending the request twice

  $('#pw-btn').addEventListener('click', () => {
    $('#pw-error').textContent = '';
    pwDialog.showModal();
    $('#pw-current').focus();
  });
  $('#pw-cancel').addEventListener('click', () => pwDialog.close());
  pwDialog.addEventListener('close', () => {
    $('#pw-form').reset(); // don't leave passwords in the page
    setPasswordsVisible(false);
  });
  function setPasswordsVisible(show) {
    ['#pw-current', '#pw-new', '#pw-confirm'].forEach((s) => { $(s).type = show ? 'text' : 'password'; });
  }
  $('#pw-show').addEventListener('change', (e) => setPasswordsVisible(e.target.checked));

  $('#pw-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (pwBusy) return;
    const current = $('#pw-current').value;
    const next = $('#pw-new').value.trim();
    const again = $('#pw-confirm').value.trim();
    const errorBox = $('#pw-error');
    errorBox.textContent = '';

    if (!current) { errorBox.textContent = 'Enter your current password.'; return; }
    if (next.length < MIN_PASSWORD_LENGTH) {
      errorBox.textContent = 'Use at least ' + MIN_PASSWORD_LENGTH + ' characters for the new password.';
      return;
    }
    if (next !== again) { errorBox.textContent = 'The new passwords don’t match.'; return; }
    if (next === current) { errorBox.textContent = 'The new password must be different from the current one.'; return; }

    const btn = $('#pw-save');
    pwBusy = true;
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      await api('changePassword', session.token, current, next);
      pwDialog.close();
      toast('Password changed', 6000);
    } catch (err) {
      if (isSessionError(err)) return expired();
      errorBox.textContent = messageOf(err);
    } finally {
      pwBusy = false;
      btn.disabled = false;
      btn.textContent = 'Change password';
    }
  });
