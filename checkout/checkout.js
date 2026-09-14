const orderItemsEl = document.querySelector(".order-items");
const orderTotalEl = document.querySelector(".order-total");
const orderItemsTotalEl = document.querySelector(".order-items-total");
const paymentAmountEl = document.querySelector(".payment-amount");
let cart = JSON.parse(localStorage.getItem("CART")) || [];

let selectedShippingCompany = null;
let photoUrl = ""; // filled in after upload completes

//render order summary
document.addEventListener("DOMContentLoaded", () => {
  renderOrderItems();
});

function renderOrderItems() {
  let totalPrice = 0,
    totalItems = 0;

  cart.forEach((item) => {
    totalPrice += item.price * item.numberOfUnits;
    totalItems += item.numberOfUnits;
  });

  orderItemsEl.innerHTML = ""; // clear order element

  cart.forEach((item) => {
    orderItemsEl.innerHTML += `
        <div class="order-item">
                <img src="../${item.imgSrc}" alt="${item.name}" class="order-item-img">
                <p class="order-item-description"><span class="order-item-name">${item.name}:</span> ${item.description} <span class="order-item-qty"> <br>Qty: ${item.numberOfUnits}</span></p>
                <p class="order-item-price">${(
                  item.price * item.numberOfUnits
                ).toLocaleString("lo-LA", {
                  style: "currency",
                  currency: "LAK",
                })} LAK</p></div>`;
  });
  orderItemsTotalEl.innerHTML = totalItems;
  orderTotalEl.innerHTML = totalPrice.toLocaleString("lo-LA");
  paymentAmountEl.innerHTML = totalPrice.toLocaleString("lo-LA");
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

//boolean for file upload
let hasFile = false;

document.getElementById("imageUpload").addEventListener("change", (e) => {
  hasFile = e.target.files.length > 0;
  console.log(hasFile);
});

//build checkout data
function buildCheckoutData() {
  const data = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    shippingCompany: selectedShippingCompany,
    branch: document.getElementById("branch").value.trim(),
    province: document.getElementById("laos-provinces").value,
    city: document.getElementById("city").value,
    village: document.getElementById("village").value.trim(),
    photoUrl: photoUrl,
  };

  return data;
}

document.getElementById('checkoutBtn').addEventListener('click', () => {
  const checkoutData = buildCheckoutData();

  if (!checkoutData.shippingCompany) {
    alert('Please choose a shipping company.');
    return;
  }
  if (hasFile && !checkoutData.photoUrl) {
    alert('Please wait for the photo to finish uploading.');
    return;
  }

  postToAppsScript(checkoutData);
});

function postToAppsScript(data) {
  fetch("YOUR_APPS_SCRIPT_WEB_APP_URL", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((result) => console.log("Success:", result))
    .catch((err) => console.error("Error:", err));
}
