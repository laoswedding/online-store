// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let products = []; // full catalog from localStorage (what filters run against)
let lastSearchResults = []; // results of the ?q= query (initial view + fallback)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const searchInput = document.getElementById("search");
  const searchFilter = document.getElementById("search-filter");
  const categorySelect = document.getElementById("category-filter");
  const stockSelect = document.getElementById("stock-filter");
  const sortSelect = document.getElementById("sort-by");
  const totalItemsInCartEl = document.querySelector(".total-items-in-cart");

  cart.length == 0
    ? (totalItemsInCartEl.textContent = "")
    : (totalItemsInCartEl.textContent = cart.length);

  // Load the catalog from localStorage
  try {
    products = JSON.parse(localStorage.getItem("PRODUCTS")) || [];
  } catch (e) {
    console.warn("Corrupted product data, resetting.", e);
    products = [];
  }

  populateCategories(products, categorySelect);

  // --- Search icon toggle ---
  const searchIcon = document.querySelector(".search-icon");
  const searchWrapper = document.querySelector(".search-wrapper");

  const setSearchOpen = (open) => {
    if (!searchWrapper || !searchIcon) return;
    searchWrapper.classList.toggle("active", open);
    searchIcon.className = open
      ? "fa-solid fa-xmark search-icon"
      : "fa-solid fa-magnifying-glass search-icon";
  };

  if (searchIcon && searchWrapper) {
    searchIcon.addEventListener("click", () =>
      setSearchOpen(!searchWrapper.classList.contains("active")),
    );
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setSearchOpen(false);
  });

  // --- Search form (navigates to the search page) ---
  const searchForm = document.getElementById("search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = searchInput ? searchInput.value.trim() : "";
      if (!query) return;

      const base =
        typeof isLocalHost !== "undefined" && isLocalHost
          ? "/search/"
          : "/online-store/search/";
      window.location.href = `${base}?q=${encodeURIComponent(query)}`;
    });
  }

  // --- Current query from the URL ---
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = (
    urlParams.get("q") ||
    urlParams.get("search") ||
    ""
  ).trim();

  const queryTextEl = document.getElementById("current-query-text");
  if (queryTextEl) {
    queryTextEl.textContent = searchQuery ? `"${searchQuery}"` : "All Products";
  }

  // --- Filter / sort listeners: replace the markup with filtered `products` ---
  if (searchFilter) searchFilter.addEventListener("input", render);
  if (categorySelect) categorySelect.addEventListener("change", render);
  if (stockSelect) stockSelect.addEventListener("change", render);
  if (sortSelect) sortSelect.addEventListener("change", render);

  // Initial view: search results from Supabase
  await fetchSearchResults(searchQuery);
});

// ---------------------------------------------------------------------------
// Initial search (Supabase)
// ---------------------------------------------------------------------------
async function fetchSearchResults(query) {
  const container = document.getElementById("search-results-grid");
  if (!container) return;

  container.innerHTML = `<div class="loading-state"><p>Searching products...</p></div>`;

  try {
    let queryBuilder = db.from("items").select("*");

    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.replace(/[,()%_\\*"]/g, "").trim())
      .filter(Boolean);

    if (terms.length) {
      const filters = terms
        .flatMap((t) => [`name.ilike.%${t}%`, `description.ilike.%${t}%`])
        .join(",");
      queryBuilder = queryBuilder.or(filters);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error("Supabase Error:", error.message, error.details);
      container.innerHTML = `<p class="error-msg">Search failed: ${esc(error.message)}</p>`;
      return;
    }

    let results = data || [];

    // Rank results by relevance to the search terms
    if (terms.length) {
      results = results
        .map((p) => ({ p, score: scoreProduct(p, terms) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.p);
    }

    // Keep for the fallback in getFilteredSorted; do NOT overwrite `products`
    lastSearchResults = results;

    // Paint the search results directly
    if (results.length === 0) {
      container.innerHTML = '<p id="empty">No products match your search.</p>';
    } else {
      container.innerHTML = results.map(productToHTML).join("");
    }
  } catch (err) {
    console.error("Unexpected Error:", err);
    container.innerHTML = `<p class="error-msg">An unexpected error occurred.</p>`;
  }
}

function scoreProduct(product, terms) {
  const name = (product.name || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  let score = 0;

  for (const term of terms) {
    const wordRe = new RegExp(`\\b${escapeRegex(term)}s?\\b`, "i");

    if (wordRe.test(name)) score += 10;
    else if (name.includes(term)) score += 5;

    if (wordRe.test(desc)) score += 1;
    else if (desc.includes(term)) score += 0.5;
  }
  return score;
}

// ---------------------------------------------------------------------------
// Category dropdown
// ---------------------------------------------------------------------------
function populateCategories(items, selectElement) {
  if (!selectElement) return;

  const previous = selectElement.value;

  const categories = [
    ...new Set(
      items
        .map((p) => p.category)
        .filter((cat) => cat && typeof cat === "string" && cat.trim() !== ""),
    ),
  ].sort();

  selectElement.innerHTML =
    '<option value="all">All categories</option>' +
    categories
      .map((c) => `<option value="${esc(c)}">${esc(c)}</option>`)
      .join("");

  // Keep the user's selection if it still exists
  if (
    previous &&
    [...selectElement.options].some((o) => o.value === previous)
  ) {
    selectElement.value = previous;
  }
}

// ---------------------------------------------------------------------------
// Filtering / sorting (runs against the localStorage catalog)
// ---------------------------------------------------------------------------
function getFilteredSorted() {
  const searchFilterEl = document.getElementById("search-filter");
  const categorySelect = document.getElementById("category-filter");
  const stockSelect = document.getElementById("stock-filter");
  const sortSelect = document.getElementById("sort-by");

  const term = searchFilterEl ? searchFilterEl.value.trim().toLowerCase() : "";
  const category = categorySelect
    ? categorySelect.value.trim().toLowerCase()
    : "all";
  const stock = stockSelect ? stockSelect.value : "all";

  const searchQuery = getUrlQuery();

  // Is everything back at its default? (empty box, all selects on first option)
  const isDefaultState =
    !term &&
    category === "all" &&
    stock === "all" &&
    (!sortSelect || sortSelect.selectedIndex === 0);

  // Default state -> show the original ?q= search results.
  // Anything else -> filter the full products catalog.
  if (isDefaultState) {
    const queryTextEl = document.getElementById("current-query-text");
    if (queryTextEl) {
      queryTextEl.textContent = searchQuery
        ? `"${searchQuery}"`
        : "All Products";
    }
    return [...lastSearchResults];
  }

  const source = products.length ? products : lastSearchResults;

  // Label only. No fetching in here.
  const queryTextEl = document.getElementById("current-query-text");
  if (queryTextEl) {
    queryTextEl.textContent = term ? `"${term}"` : "All Products";
  }

  const filtered = source.filter((p) => {
    const matchesSearch =
      !term ||
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.description && p.description.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term));

    const pCategory = String(p.category ?? "")
      .trim()
      .toLowerCase();
    const matchesCategory = category === "all" || pCategory === category;

    const stockCount = p.instock ?? p.inStock ?? p.stock ?? 0;
    const matchesStock =
      stock === "all" ||
      (stock === "inStock" && stockCount > 0) ||
      (stock === "outOfStock" && stockCount <= 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  if (sortSelect) {
    const price = (p) => Number(p.price) || 0;
    const created = (p) => new Date(p.createdAt || p.created_at || 0);

    switch (sortSelect.value) {
      case "name-asc":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "price-asc":
        filtered.sort((a, b) => price(a) - price(b));
        break;
      case "price-desc":
        filtered.sort((a, b) => price(b) - price(a));
        break;
      case "recent":
        filtered.sort((a, b) => created(b) - created(a));
        break;
    }
  }

  return filtered;
}

function getUrlQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  return (urlParams.get("q") || urlParams.get("search") || "").trim();
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
function productToHTML(item) {
  const imgSrc = item.img_src || item.image || item.imgSrc || "";
  const price = Number(item.price) || 0;

  return `
    <div class="product-card">
      <img src="${esc(imgSrc)}" alt="${esc(item.name || "Product")}" class="product-img">
      <div class="product-info">
        <h3 class="product-name">${esc(item.name || "Unnamed Product")}</h3>
        <p class="product-description">${esc(item.description || "")}</p>
        <p class="product-price">₭${price.toLocaleString("lo-LA")} LAK</p>
        <div class="add-to-cart" onclick="addToCart(${item.id})">
        Add To Cart
        </div>
      </div>
    </div>
  `;
}

function render() {
  const container = document.getElementById("search-results-grid");
  if (!container) return;

  const items = getFilteredSorted();

  if (items.length === 0) {
    container.innerHTML = '<p id="empty">No products match your filters.</p>';
    return;
  }

  container.innerHTML = items.map(productToHTML).join("");
}
