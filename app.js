// SELECT ELEMENTS
// const productsEl = document.querySelector(".products");
// const cartItemsEl = document.querySelector(".cart-items");
// const subtotalEl = document.querySelector(".subtotal");
// const cartEl = document.querySelector(".cart");
const bodyEl = document.body;
const filteredProductHeaderEl = document.querySelector(
  ".filtered-product-header",
);

// INITIALIZE PRODUCTS ARRAY FROM HOMEPAGE
let products;
try {
  products = JSON.parse(localStorage.getItem("PRODUCTS")) || [];
} catch (e) {
  console.warn("Corrupted CART data, resetting.", e);
  products = [];
}

//INITIALIZE CART ARRAY
let cart;
try {
  cart = JSON.parse(localStorage.getItem("CART")) || [];
} catch (e) {
  console.warn("Corrupted CART data, resetting.", e);
  cart = [];
}

//INITIALIZE CATEGORY
let category = localStorage.setItem("CATEGORY", "");

//LOAD DOM CONTENT
document.addEventListener("DOMContentLoaded", () => {
  const totalItemsInCartEl = document.querySelector(".total-items-in-cart");
  cart.length == 0
    ? (totalItemsInCartEl.textContent = "")
    : (totalItemsInCartEl.textContent = cart.length);

  const searchIcon = document.querySelector(".search-icon");
  const searchWrapper = document.querySelector(".search-wrapper");

  // Open search wrapper
  if (searchIcon && searchWrapper) {
    searchIcon.addEventListener("click", () => {
      // .toggle() returns true if 'active' was added, false if removed
      const isOpen = searchWrapper.classList.toggle("active");

      if (isOpen) {
        // Icon when open (FontAwesome 6 uses 'fa-xmark' or 'fa-magnifying-glass-minus')
        searchIcon.className = "fa-solid fa-xmark search-icon";
      } else {
        // Icon when closed
        searchIcon.className = "fa-solid fa-magnifying-glass search-icon";
      }
    });
  }

  // Close when pressing 'Escape' key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchWrapper) {
      searchWrapper.classList.remove("active");
    }
  });

  //LOAD SEARCH FORM INSIDE THE SEARCH WRAPPER
  //ID SEARCH FORM IS FOR THE FORM INSIDE THE SEARCH WRAPPER
  //NOT TO BE CONFUSED WITH ID "search-filter" WHICH IS FOR FILTER CONTROLS ON SEARCH PAGE
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search");

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const query = searchInput.value.trim();
      if (!query) return;

      const base = isLocalHost ? "/search/" : "/online-store/search/";
      window.location.href = `${base}?q=${encodeURIComponent(query)}`;
    });
  }
});

async function getInventory() {
  try {
    //CALL SUPABASE
    const { data, error } = await db.from("items").select("*");

    if (error) throw error;

    //MAP THE DATA INTO THE PRODUCTS ARRAY
    products = data.map((product) => ({
      ...product,
      id: Number(product.id),
      price: Number(product.price),
      instock: Number(product.in_stock),
    }));

    //SET IN LOCAL STOAGE
    localStorage.setItem("PRODUCTS", JSON.stringify(products));
  } catch (error) {
    console.error("Error loading inventory:", error);
    loadingWrapperEl.textContent = "Oh no! There was an error.";
  }
}

getInventory();

//FILTER PRODUCTS
function filterProducts(category, clickedEl) {
  filteredProductHeaderEl.innerHTML = category;
  filterProductsByCategory(category);
  setActiveNavLink(clickedEl);
}

//SET ACTIVE NAV LINK
function setActiveNavLink(clickedEl) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  clickedEl.classList.add("active");
}

//FILTER PRODUCTS
function filterProductsByCategory(category) {
  if (category === "All Products") {
    renderProducts(products);
  } else {
    const filtered = products.filter(
      (product) => product.category === category,
    );
    renderProducts(filtered);
  }
}

//Get categories
// Extract unique categories and add an 'All' option
let categories = [];

function escapeHTML(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
