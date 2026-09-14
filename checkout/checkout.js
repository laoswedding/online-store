const orderItemsEl = document.querySelector(".order-items");
let cart = JSON.parse(localStorage.getItem("CART")) || [];

//render order summary
document.addEventListener("DOMContentLoaded", () => {
  renderOrderItems();
});

function renderOrderItems() {
  orderItemsEl.innerHTML = ""; // clear order element

  cart.forEach((item) => {
    orderItemsEl.innerHTML += `
        <div class="order-item">

                <img src="../${item.imgSrc}" alt="${item.name}" class="order-item-img">
                <p class="order-item-description"><span class="order-item-name">${item.name}:</span> ${item.description} <span class="order-item-qty"> <br>Qty: ${item.numberOfUnits}</span></p>
                <p class="order-item-price">${item.price * item.numberOfUnits} LAK</p></div>`;
  });
}

// Choose shipping company
function clickShippingCompany(shippingCompany, element) {
  // Optional: Clear border from all shipping containers first
  document.querySelectorAll(".shipping-company-container").forEach((el) => {
    el.style.border = "none";
  });

  // Highlight the selected element
  element.style.border = "5px solid blue";

  console.log(`Selected shipping company: ${shippingCompany}`);
}
