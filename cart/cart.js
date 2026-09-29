// 1. GLOBAL STATE & SELECTORS
let cart = JSON.parse(localStorage.getItem("CART")) || [];

let cartItemsEl;
let subtotalEl;
let itemRemovedEl;
let totalItemsInCartEl;

// 2. INITIALIZE ON DOM LOAD
document.addEventListener("DOMContentLoaded", () => {
  cartItemsEl = document.querySelector(".cart-items");
  subtotalEl = document.querySelector(".subtotal");
  itemRemovedEl = document.querySelector(".item-removed-modal");
  totalItemsInCartEl = document.querySelectorAll(".total-items-in-cart");

  // Sync state and render on page startup
  updateCart();
});

// 3. RENDER CART ITEMS
function renderCartItems() {
  if (!cartItemsEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<div class="empty-cart"><p>Your cart is empty.</p></div>`;
    return;
  }

  // Efficient array mapping instead of += innerHTML loop
  cartItemsEl.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <div class="cart-item-top-row">
            <img src="${item.img_src}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
              <p class="cart-item-name">${item.name}</p>
              <p class="cart-item-description">${item.description}</p>
            </div>
            <p class="cart-item-price">₭${item.price.toLocaleString("lo-LA")} LAK</p>
          </div>
          <div class="cart-item-modify-block">
            <div class="units">
              <div class="btn minus" onclick="changeNumberOfUnits('minus', '${item.id}')">-</div>
              <div class="number">${item.numberOfUnits}</div>
              <div class="btn plus" onclick="changeNumberOfUnits('plus', '${item.id}')">+</div>           
            </div>
            <div class="remove">
              <div onclick="removeItemFromCart('${item.id}')"><i class="fa-solid fa-trash"></i></div>
            </div>
          </div>
        </div>
      `,
    )
    .join("");
}

// 4. CALCULATE AND RENDER SUBTOTAL
function renderSubtotal() {
  if (!subtotalEl) return;

  let totalPrice = 0;
  let totalItems = 0;

  cart.forEach((item) => {
    totalPrice += item.price * item.numberOfUnits;
    totalItems += item.numberOfUnits;
  });

  // Display in Lao Kip (LAK) matching item prices
  subtotalEl.innerHTML = `Subtotal (${totalItems} items): ₭${totalPrice.toLocaleString(
    "lo-LA",
  )} LAK`;

  // Update navbar/header cart count badge if element exists
  if (totalItemsInCartEl && totalItemsInCartEl.length > 0) {
    totalItemsInCartEl.forEach((el) => {
      const count = Math.max(0, parseInt(totalItems, 10) || 0);
      el.hidden = count === 0;
      el.textContent = count > 99 ? "99+" : count;
    });
  }
}

// 5. REMOVE ITEM FROM CART
function removeItemFromCart(id) {
  // Loose equality handles both string and numeric IDs safely
  cart = cart.filter((item) => item.id != id);

  // Safely check if modal elements and function exist before calling
  if (typeof showAndHideModal === "function" && itemRemovedEl) {
    showAndHideModal(itemRemovedEl);
  }

  updateCart();
}

// 6. CHANGE NUMBER OF UNITS FOR AN ITEM
function changeNumberOfUnits(action, id) {
  const targetItem = cart.find((item) => item.id == id);
  if (!targetItem) return;

  // 1. If decrementing from 1, remove the item and exit early
  if (action === "minus" && targetItem.numberOfUnits === 1) {
    removeItemFromCart(id);
    return; // Exit early — removeItemFromCart handles updateCart()
  }

  // 2. Otherwise, map through and adjust quantities
  cart = cart.map((item) => {
    if (item.id == id) {
      let numberOfUnits = item.numberOfUnits;

      if (action === "minus" && numberOfUnits > 1) {
        numberOfUnits--;
      } else if (
        action === "plus" &&
        (item.inStock === undefined || numberOfUnits < item.inStock)
      ) {
        numberOfUnits++;
      }

      return { ...item, numberOfUnits };
    }

    return item;
  });

  updateCart();
}

// 7. CENTRALIZED UPDATE & PERSISTENCE
function updateCart() {
  renderCartItems();
  renderSubtotal();
  localStorage.setItem("CART", JSON.stringify(cart));
}

function goBackToStore() {
  window.location.href = isLocalHost ? "/" : "/online-store";
}
