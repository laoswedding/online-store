// SELECT ELEMENTS
const productsEl = document.querySelector(".products");
const cartItemsEl = document.querySelector(".cart-items");
const subtotalEl = document.querySelector(".subtotal");
const totalItemsInCartEl = document.querySelector(".total-items-in-cart");
const cartEl = document.querySelector(".cart");
const bodyEl = document.body;
const filteredProductHeaderEl = document.querySelector(
  ".filtered-product-header",
);

document.querySelectorAll('body *').forEach(el => {
  if (el.scrollWidth > document.documentElement.clientWidth) {
    console.log(el, el.scrollWidth, el.className);
  }
});
//SHOW CART
let scrollY = 0;

function lockScroll() {
  scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
}

function unlockScroll() {
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  window.scrollTo(0, scrollY);
}

function showCart() {
  const scrollPosition = window.scrollY;

  if (scrollPosition === 0) {
    cartEl.style.top = "90px";
  } else {
    cartEl.style.top = `calc(${scrollPosition}px + 90px)`;
  }

  cartEl.classList.toggle("active");
  const isActive = cartEl.classList.contains("active");

  if (isActive) {
    lockScroll();
  } else {
    unlockScroll();
  }
}

//FILTER PRODUCTS
function filterProducts(category) {
  filteredProductHeaderEl.innerHTML = category;
  filterProductsByCategory(category);
}

function filterProductsByCategory(category) {
  if (category === "All Products") {
    renderProducts(products);
  } else {
    const filtered = products.filter(
      (product) => product.category === category
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
  // check if prodcut already exist in cart
  if (cart.some((item) => item.id === id)) {
    changeNumberOfUnits("plus", id);
  } else {
    const item = products.find((product) => product.id === id);

    cart.push({
      ...item,
      numberOfUnits: 1,
    });

    // cartEl.classList.add("active");
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
  totalItemsInCartEl.innerHTML = totalItems;
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

  updateCart();
}

// change number of units for an item
function changeNumberOfUnits(action, id) {
  cart = cart.map((item) => {
    let numberOfUnits = item.numberOfUnits;

    if (item.id === id) {
      if (action === "minus" && numberOfUnits > 1) {
        numberOfUnits--;
      } else if (action === "plus" && numberOfUnits < item.instock) {
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
