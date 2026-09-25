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

let products = [];

async function getInventory(retries = 2) {
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
      instock: Number(product.instock),
    }));

    renderProducts();
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

// RENDER PRODUCTS
function renderProducts(productList = products) {
  // Iterate through all matched elements and update their innerHTML
  totalItemsInCartEl.forEach((el) => {
    el.style.display = "none";
  });

  // Clear existing items before rendering new ones
  productsEl.innerHTML = "";

  productList.forEach((product) => {
    productsEl.innerHTML += `
      <div class="item">
          <div class="item-container">
              <div class="item-img">
                  <img src="${product.img_src}" alt="${product.name}" loading="lazy">
              </div>
              <div class="desc">
                  <h2 class="product-name">${product.name}</h2>
                  <p class="product-description">
                      ${product.description}
                  </p>
                  <h2 class="price">₭${product.price.toLocaleString("en-US")} LAK</h2>
                  <div class="product-btns">
                   <div class="add-to-cart" onclick="addToCart(${product.id})">
                  Add To Cart
                  </div>
                  <a href="${product.learnMore}" class="learn-more">Learn More</a>
                  </div>
                 
              </div>

          </div>
      </div>
    `;
  });
}
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
