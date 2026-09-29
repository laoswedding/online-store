document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);

  // Checks both 'q' and 'search' parameter keys to prevent parameter mismatches
  const searchQuery = (
    urlParams.get("q") ||
    urlParams.get("search") ||
    ""
  ).trim();

  console.log("Active Search Query:", searchQuery); // Check console to verify parameter reading

  // Sync input value
  const searchInput = document.getElementById("search");
  if (searchInput) searchInput.value = searchQuery;

  // Sync header display
  const queryTextEl = document.getElementById("current-query-text");
  if (queryTextEl) {
    queryTextEl.textContent = searchQuery ? `"${searchQuery}"` : "All Products";
  }

  await fetchSearchResults(searchQuery);
});

async function fetchSearchResults(query) {
  const container = document.getElementById("search-results-grid");
  if (!container) return;

  container.innerHTML = `<div class="loading-state"><p>Searching products...</p></div>`;

  try {
    let queryBuilder = db.from("items").select("*");

    // Split into terms; strip characters that break PostgREST .or() parsing
    // or act as SQL LIKE wildcards
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.replace(/[,()%_\\*"]/g, "").trim())
      .filter(Boolean);

    if (terms.length) {
      // Fetch a broad candidate set (any term in name OR description)
      const filters = terms
        .flatMap((t) => [`name.ilike.%${t}%`, `description.ilike.%${t}%`])
        .join(",");
      queryBuilder = queryBuilder.or(filters);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error("Supabase Error:", error.message, error.details);
      container.innerHTML = `<p class="error-msg">Search failed: ${error.message}</p>`;
      return;
    }

    let products = data || [];

    // Rank by relevance and drop weak matches
    if (terms.length) {
      products = products
        .map((p) => ({ p, score: scoreProduct(p, terms) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.p);
    }

    console.log(
      `Query "${query}" returned ${products.length} result(s):`,
      products,
    );
    renderProducts(products, query);
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
    const wordRe = new RegExp(`\\b${term}s?\\b`, "i"); // matches "coaster" / "coasters"

    if (wordRe.test(name))
      score += 10; // whole word in name: strongest
    else if (name.includes(term)) score += 5; // partial match in name
    if (wordRe.test(desc)) score += 1; // whole word in description: weak
    // substring-only matches in description score 0 on purpose
  }
  return score;
}

/**
 * Renders retrieved products into HTML grid cards
 */
function renderProducts(products, query) {
  console.log(products);
  console.log(
    "renderProducts called with",
    products.length,
    "items, query:",
    query,
    new Error().stack,
  );
  const container = document.getElementById("search-results-grid");
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <p>No products found matching "<strong>${query || "your query"}</strong>".</p>
      </div>`;
    return;
  }

  container.innerHTML = products
    .map(
      (item) => `
        <div class="product-card">
          <img src="${item.img_src}" alt="${item.name}" class="product-img">
          <div class="product-info">
            <h3 class="product-name">${item.name}</h3>
            <p class="product-description">${item.description || ""}</p>
            <p class="product-price">₭${(item.price || 0).toLocaleString("lo-LA")} LAK</p>
          </div>
        </div>
      `,
    )
    .join("");
}
