function navigate(page) {
  window.location.href = isLocalHost ? `/${page}` : `/online-store/${page}`;
}

function goToFilteredPage(category) {
  localStorage.setItem("CATEGORY", category)
  window.location.href = isLocalHost ? "/search" : "/online-store/search";
}

