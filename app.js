// SELECT ELEMENTS
const productsEl = document.querySelector(".products");
const cartItemsEl = document.querySelector(".cart-items");
const subtotalEl = document.querySelector(".subtotal");
const totalItemsInCartEl = document.querySelectorAll(".total-items-in-cart");
const cartEl = document.querySelector(".cart");
const bodyEl = document.body;
const filteredProductHeaderEl = document.querySelector(
  ".filtered-product-header",
);
const itemAddedEl = document.querySelector(".item-added");
const itemRemovedEl = document.querySelector(".item-removed");
const emptyCartEl = document.querySelector(".empty-cart");
const itemPlusOneEl = document.querySelector(".item-plus-one");
const loadingWrapperEl = document.querySelector(".loading-wrapper");
const loadingTextEl = document.querySelector(".loading-text");
const productsWrapperEl = document.querySelector(".products-wrapper");

// ---- Elements ----
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category-filter");
const stockSelect = document.getElementById("stock-filter");
const sortSelect = document.getElementById("sort-by");
const resultsEl = document.getElementById("results");

let products = [];

async function getInventory() {
  const timers = [
    setTimeout(() => {
      loadingTextEl.innerHTML = "Almost there";
    }, 5000),
    setTimeout(() => {
      loadingTextEl.innerHTML = "Getting closer";
    }, 10000),
  ];

  try {
    const { data, error } = await db.from("items").select("*");

    if (error) throw error;

    products = data.map((product) => ({
      ...product,
      id: Number(product.id),
      price: Number(product.price),
      instock: Number(product.in_stock),
    }));

    renderProducts();
    populateCategories(products);

    // Check if categories are empty using strictly equal (===)
    // if (categories.length === 0) {
    //   getCategories(products);
    // }
    loadingWrapperEl.style.visibility = "hidden";
    productsWrapperEl.style.visibility = "visible";
  } catch (error) {
    console.error("Error loading inventory:", error);
    loadingWrapperEl.textContent = "Oh no! There was an error.";
  } finally {
    timers.forEach(clearTimeout);
  }
}

getInventory();

//SHOW CART
function showCart() {
  cartEl.classList.toggle("active");
  const isActive = cartEl.classList.contains("active");
  document.documentElement.style.overflowY = isActive ? "hidden" : "";
}

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

//RENDER PRODUCTS. V2
//takes in the tag type, iterable properties object, and spreads the children
function el(tag, props, ...children) {
  //create the specified tag
  const node = document.createElement(tag);

  //if there is an iterable properties object, loop each value
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      //if value k is "class", then set it as the className
      if (k === "class") node.className = v;
      //if value k is "text", set text content to v
      else if (k === "text") node.textContent = v;
      //if value k starts with "on", set the event listener type to slice off 'on' and then the value v
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      //if value v is not falsy nor null, set the v value to an empty string, or the value of v
      else if (v !== false && v != null)
        node.setAttribute(k, v === true ? "" : v);
    }
  }

  //loop through the children and append them to the node
  for (const c of children) if (c != null) node.append(c);

  //return the node
  return node;
}

//Get categories
// Extract unique categories and add an 'All' option
let categories = [];

// function getCategories() {
//   // 1. Guard clause: If buttons already exist, do nothing and exit
//   if (categories.length > 0) return;
//   console.lo;
//   // 2. Reference the global `products` array directly
//   categories = ["All", ...new Set(products.map((p) => p.category))];

//   const categoryButtonContainer = document.getElementById(
//     "category-button-container",
//   );

//   // 3. Dynamically create buttons once
//   categories.forEach((category) => {
//     const button = document.createElement("button");
//     button.textContent = category;
//     button.addEventListener("click", () => filterProducts(category));
//     categoryButtonContainer.appendChild(button);
//   });
// }

// RENDER PRODUCTS
function renderProducts(productList = products) {
  totalItemsInCartEl.forEach((el) => {
    el.style.display = "none";
  });

  // Build all markup as a single string, then set innerHTML once
  productsEl.innerHTML = productList.map(productToHTML).join("");
}

function productToHTML(product) {
  return `
    <div class="item">
        <div class="item-container">
            <div class="item-img">
                <img src="${escapeHTML(product.img_src)}" alt="${escapeHTML(product.name)}" loading="lazy">
            </div>
            <div class="desc">
                <h2 class="product-name">${escapeHTML(product.name)}</h2>
                <p class="product-description">
                    ${escapeHTML(product.description)}
                </p>
                <h2 class="price">₭${product.price.toLocaleString("en-US")} LAK</h2>
                <div class="product-btns">
                    <div class="add-to-cart" data-id="${product.id}">Add To Cart</div>
                    <a href="${escapeHTML(product.learnMore)}" class="learn-more">Learn More</a>
                </div>
            </div>
        </div>
    </div>
  `;
}

function escapeHTML(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Set up once, outside renderProducts — event delegation instead of inline onclick
productsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-cart");
  if (!btn) return;
  addToCart(Number(btn.dataset.id));
});

// Filter logic
function filterProducts(category) {
  if (category === "All") {
    filteredProductHeaderEl.textContent = "All Products";
    renderProducts(products);
  } else {
    const filtered = products.filter((p) => p.category === category);
    filteredProductHeaderEl.textContent = category;
    renderProducts(filtered);
  }
}

// // RENDER PRODUCTS
// function renderProducts(productList = products) {
//   // Iterate through all matched elements and update their innerHTML
//   totalItemsInCartEl.forEach((el) => {
//     el.style.display = "none";
//   });

//   // Clear existing items before rendering new ones
//   productsEl.innerHTML = "";

//   productList.forEach((product) => {
//     productsEl.innerHTML += `
//       <div class="item">
//           <div class="item-container">
//               <div class="item-img">
//                   <img src="${product.img_src}" alt="${product.name}" loading="lazy">
//               </div>
//               <div class="desc">
//                   <h2 class="product-name">${product.name}</h2>
//                   <p class="product-description">
//                       ${product.description}
//                   </p>
//                   <h2 class="price">₭${product.price.toLocaleString("en-US")} LAK</h2>
//                   <div class="product-btns">
//                    <div class="add-to-cart" onclick="addToCart(${product.id})">
//                   Add To Cart
//                   </div>
//                   <a href="${product.learnMore}" class="learn-more">Learn More</a>
//                   </div>

//               </div>

//           </div>
//       </div>
//     `;
//   });
// }

renderProducts();

// CART ARRAY
let cart;
try {
  cart = JSON.parse(localStorage.getItem("CART")) || [];
} catch (e) {
  console.warn("Corrupted CART data, resetting.", e);
  cart = [];
}
updateCart();

// SHOW AND HIDE MODAL
function showAndHideModal(modalElement) {
  modalElement.style.opacity = "1";

  setTimeout(() => {
    modalElement.style.opacity = "0";
  }, 2000);
}

// ADD TO CART
function addToCart(id) {
  // check if product already exist in cart
  if (cart.some((item) => item.id === id)) {
    changeNumberOfUnits("plus", id);

    showAndHideModal(itemPlusOneEl);
  } else {
    const item = products.find((product) => product.id === id);
    cart.push({
      ...item,
      numberOfUnits: 1,
    });

    showAndHideModal(itemAddedEl);
  }

  updateCart();
}

//UPDATE CART
function updateCart() {
  renderCartItems();
  renderSubtotal();

  // SAVE CART TO LOCAL STORAGE
  localStorage.setItem("CART", JSON.stringify(cart));
}

//CALCULATE AND RENDER SUBTOTAL
function renderSubtotal() {
  let totalPrice = 0,
    totalItems = 0;

  cart.forEach((item) => {
    totalPrice += item.price * item.numberOfUnits;
    totalItems += item.numberOfUnits;
  });

  subtotalEl.innerHTML = `Subtotal (${totalItems} items): ${totalPrice.toLocaleString(
    "lo-LA",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )} LAK`;

  // Iterate through all matched elements and update their innerHTML
  totalItemsInCartEl.forEach((el) => {
    const count = Math.max(0, parseInt(totalItems, 10) || 0);

    el.hidden = count === 0;
    el.textContent = count > 99 ? "99+" : count;
  });
}

//RENDER CART ITEMS
function renderCartItems() {
  cartItemsEl.innerHTML = ""; // clear cart element
  cart.forEach((item) => {
    cartItemsEl.innerHTML += `
        <div class="cart-item">
            <div class="item-info">
                <img src="${item.img_src}" alt="${item.name}">
                <h4>${item.name}</h4>
            </div>
            <div class="unit-price">
                ${item.price} LAK
            </div>
            <div class="units">
                <div class="btn minus" onclick="changeNumberOfUnits('minus', ${item.id})">-</div>
                <div class="number">${item.numberOfUnits}</div>
                <div class="btn plus" onclick="changeNumberOfUnits('plus', ${item.id})">+</div>           
            </div>
            <div class="remove">
               <div onclick="removeItemFromCart(${item.id})"><i class="fa-solid fa-trash"></i></div>
            </div>
        </div>
      `;
  });
}

//REMOVE ITEM FROM CART
function removeItemFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  showAndHideModal(itemRemovedEl);
  updateCart();
}

//CHANGE NUMBER OF UNITS FOR AN ITEM
function changeNumberOfUnits(action, id) {
  cart = cart.map((item) => {
    let numberOfUnits = item.numberOfUnits;

    if (item.id === id) {
      if (action === "minus" && numberOfUnits > 1) {
        numberOfUnits--;
      } else if (action === "plus" && numberOfUnits < item.inStock) {
        numberOfUnits++;
      }
    }

    return {
      ...item,
      numberOfUnits,
    };
  });

  updateCart();
}

//GO TO CHECKOUT PAGE
function goToCheckout() {
  // Use cart.length for Arrays, or cart.size for Set/Map
  const isCartEmpty = Array.isArray(cart) ? cart.length === 0 : cart.size === 0;

  if (isCartEmpty) {
    showAndHideModal(emptyCartEl);
  } else {
    isLocalHost
      ? (window.location.href = "/checkout")
      : (window.location.href = "/online-store/checkout");
  }
}

function goToCancelOrderPage() {
  window.location.href = isLocalHost
    ? "/cancel-order"
    : "/online-store/cancel-order";
}

//

// ---- Build category options from the fetched data ----
function populateCategories(items) {
  const categories = [...new Set(items.map((p) => p.category))].sort();
  categorySelect.innerHTML =
    '<option value="all">All categories</option>' +
    categories.map((c) => `<option value="${c}">${c}</option>`).join("");
}

// ---- Filtering + sorting ----
function getFilteredSorted() {
  const term = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const stock = stockSelect.value;

  let filtered = products.filter((p) => {
    const matchesSearch =
      !term ||
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.description && p.description.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term));

    const matchesCategory = category === "all" || p.category === category;

    const matchesStock =
      stock === "all" ||
      (stock === "inStock" && p.instock > 0) ||
      (stock === "outOfStock" && !(p.instock > 0));

    return matchesSearch && matchesCategory && matchesStock;
  });

  switch (sortSelect.value) {
    case "name-asc":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "recent":
      // Assumes each product has a "createdAt" (date string/timestamp) or "id" that increases over time.
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }

  return filtered;
}

// ---- Render ----
function render() {
  const items = getFilteredSorted();

  if (items.length === 0) {
    productsEl.innerHTML = '<p id="empty">No products match your filters.</p>';
    return;
  }

  productsEl.innerHTML = items.map(productToHTML).join("");
}

// ---- Event listeners ----
searchInput.addEventListener("input", render);
categorySelect.addEventListener("change", render);
stockSelect.addEventListener("change", render);
sortSelect.addEventListener("change", render);
