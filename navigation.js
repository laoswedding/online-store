function navigate(page) {
  window.location.href = isLocalHost ? `/${page}` : `/online-store/${page}`;
}

