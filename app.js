// SELECT ELEMENTS
const productsEl = document.querySelector(".products");
const cartItemsEl = document.querySelector(".cart-items");
const subtotalEl = document.querySelector(".subtotal");
// const totalItemsInCartEl = document.querySelector(".total-items-in-cart");
const cartEl = document.querySelector(".cart");
const bodyEl = document.body;
const filteredProductHeaderEl = document.querySelector(
  ".filtered-product-header",
);
const itemAddedEl = document.querySelector(".item-added");
const itemRemovedEl = document.querySelector(".item-removed");
const loadingWrapperEl = document.querySelector(".loading-wrapper");
const productsWrapperEl = document.querySelector(".products-wrapper");
//GET REQUEST
const API_URL =
  "https://script.google.com/macros/s/AKfycbyYVEtaRIzzPsfCi8rsNdo6mZCNmFJzwDPKe1kHeLV8HuRTHP6oZT4CPLQYc42DZici/exec";

let products = [];

async function getInventory() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    products = (await response.json()).map((product) => ({
      ...product,
      id: Number(product.id),
      price: Number(product.price),
      instock: Number(product.instock),
    }));

    // console.log("Products loaded:", products);

    // Only render AFTER Google Sheets data arrives
    renderProducts();
    loadingWrapperEl.style.visibility = "hidden";
    productsWrapperEl.style.visibility = "visible";
  } catch (error) {
    console.error("Error loading inventory:", error);
    loadingWrapperEl.textContent = "Oh no! There was an error.";
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

function setActiveNavLink(clickedEl) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  clickedEl.classList.add("active");
}

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
  // Clear existing items before rendering new ones
  productsEl.innerHTML = "";

  productList.forEach((product) => {
    productsEl.innerHTML += `
      <div class="item">
          <div class="item-container">
              <div class="item-img">
                  <img src="${product.imgSrc}" alt="${product.name}">
              </div>
              <div class="desc">
                  <h2 class="product-name">${product.name}</h2>
                  <p class="product-description">
                      ${product.description}
                  </p>
                  <h2 class="price">₭${product.price} LAK</h2>
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

// cart array
let cart = JSON.parse(localStorage.getItem("CART")) || [];
updateCart();

// ADD TO CART
function addToCart(id) {
  // check if product already exist in cart
  if (cart.some((item) => item.id === id)) {
    changeNumberOfUnits("plus", id);
  } else {
    const item = products.find((product) => product.id === id);

    cart.push({
      ...item,
      numberOfUnits: 1,
    });

    // Show the modal
    itemAddedEl.style.opacity = "1";

    setTimeout(() => {
      itemAddedEl.style.opacity = "0";
    }, 1000);
  }

  updateCart();
}

// update cart
function updateCart() {
  renderCartItems();
  renderSubtotal();

  // save cart to local storage
  localStorage.setItem("CART", JSON.stringify(cart));
}

// calculate and render subtotal
function renderSubtotal() {
  let totalPrice = 0,
    totalItems = 0;

  cart.forEach((item) => {
    totalPrice += item.price * item.numberOfUnits;
    totalItems += item.numberOfUnits;
  });

  subtotalEl.innerHTML = `Subtotal (${totalItems} items): ${totalPrice.toFixed(2)} LAK`;
  // totalItemsInCartEl.innerHTML = totalItems;
}

// render cart items
function renderCartItems() {
  cartItemsEl.innerHTML = ""; // clear cart element
  cart.forEach((item) => {
    cartItemsEl.innerHTML += `
        <div class="cart-item">
            <div class="item-info">
                <img src="${item.imgSrc}" alt="${item.name}">
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

// remove item from cart
function removeItemFromCart(id) {
  cart = cart.filter((item) => item.id !== id);

  // Show the modal
  itemRemovedEl.style.opacity = "1";

  setTimeout(() => {
    itemRemovedEl.style.opacity = "0";
  }, 1000);

  updateCart();
}

// change number of units for an item
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
