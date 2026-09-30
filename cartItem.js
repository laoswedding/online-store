//INITIALIZE CART ARRAY
let cart;
try {
  cart = JSON.parse(localStorage.getItem("CART")) || [];
} catch (e) {
  console.warn("Corrupted CART data, resetting.", e);
  cart = [];
}

const totalItemsInCartEl = document.querySelector(".total-items-in-cart");
const proceedToCheckoutBtn = document.querySelector(".proceed-to-checkout-btn");
const itemAddedEl = document.querySelector(".item-added");
const itemPlusOneEl = document.querySelector(".item-plus-one");
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

//UPDATE CART FUNCTION BELOW IS USED FOR UPDATED QTYS ON CART PAGE
function updateCart() {
  // SAVE CART TO LOCAL STORAGE
  localStorage.setItem("CART", JSON.stringify(cart));
  if (cart.length == 0) {
    totalItemsInCartEl.textContent = "";
  } else {
    totalItemsInCartEl.textContent = cart.length;
  }
}

// SHOW AND HIDE MODAL
function showAndHideModal(modalElement) {
  modalElement.style.opacity = "1";

  setTimeout(() => {
    modalElement.style.opacity = "0";
  }, 2000);
}
