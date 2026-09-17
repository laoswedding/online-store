const API_URL =
  "https://script.google.com/macros/s/AKfycbxuVW8C0DrsGMjSFocYWY9wFdfvbmtXTP6jp4VLjjccQiSEtwXlLycVuUCYW32VTlQuxg/exec";

const orderItemsEl = document.querySelector(".order-items");
const orderTotalEl = document.querySelector(".order-total");
const orderItemsTotalEl = document.querySelector(".order-items-total");
const paymentAmountEl = document.querySelector(".payment-amount");
const processingOrderModalEl = document.querySelector(
  ".processing-order-modal",
);
const processingOrderTextEl = document.querySelector(".processing-order-text");
let cart = JSON.parse(localStorage.getItem("CART")) || [];
let totalPrice = 0;
let totalItems = 0;
let selectedShippingCompany = null;
let photoUrl = ""; // filled in after upload completes
const processingMsg = document.querySelector(".processing-msg");
const refreshMsg = document.querySelector(".refresh-msg");

//render order summary
document.addEventListener("DOMContentLoaded", () => {
  renderOrderItems();
});

function renderOrderItems() {
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
  selectedShippingCompany = shippingCompany;
  console.log(selectedShippingCompany);
}

//boolean for file upload
let hasFile = false;

document.getElementById("imageUpload").addEventListener("change", (e) => {
  hasFile = e.target.files.length > 0;
  console.log(hasFile);
});

// Function to handle file upload
async function uploadFile(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = (e) => {
      const data = e.target.result.split(",");
      const obj = {
        fileName: file.name,
        mimeType: data[0].match(/:(\w.+);/)[1],
        data: data[1],
      };
      resolve(obj);
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

// Helper function to generate a random 8-character alphanumeric ID
function generateOrderID() {
  // Math.random().toString(36) generates a random alphanumeric string.
  // We take a slice of it and convert it to uppercase.
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `KL-${randomPart}`;
}

//build checkout data
async function buildCheckoutData() {
  const fileInput = document.getElementById("imageUpload");
  let fileData = null;

  if (fileInput.files.length > 0) {
    fileData = await uploadFile(fileInput.files[0]);
  }

  // 1. GET YOUR CART ITEMS (Replace this with however you access your cart)
  // Example structure: [{ name: "T-Shirt", qty: 2, price: 15.00 }, { name: "Hat", qty: 1, price: 10.00 }]
  const cartItems = cart;

  // 2. FORMAT THE CART INTO A STRING
  // Maps over each item to create "2x T-Shirt ($15.00)" and joins them with a line break
  const formattedOrderItems = cartItems
    .map((item) => {
      // Adjust 'qty', 'name', and 'price' to match your actual cart object properties
      return `x${item.numberOfUnits} ${item.name} - ₭${item.price.toLocaleString("lo-LA")} LAK`;
    })
    .join("\n"); // '\n' creates a line break inside the Google Sheet cell

  //Build object
  const data = {
    firstName: document.getElementById("firstName").value.trim().toUpperCase(),
    lastName: document.getElementById("lastName").value.trim().toUpperCase(),
    phone: document.getElementById("phone").value.trim(),
    shippingCompany: selectedShippingCompany,
    branch: document.getElementById("branch").value.trim().toUpperCase(),
    province: document.getElementById("laos-provinces").value.toUpperCase(),
    city: document.getElementById("city").value.toUpperCase(),
    village: document.getElementById("village").value.trim().toUpperCase(),

    // 3. ADD TO YOUR PAYLOAD
    fileData: fileData,
    orderItems: formattedOrderItems,
    orderId: generateOrderID(),
    orderTotal: totalPrice.toLocaleString("lo-LA"),
    orderTotalItems: totalItems,
    orderStatus: "pending",
  };

  // 4. STORE USER'S DATA IN LOCAL STORAGE
  localStorage.setItem("USER", JSON.stringify(data));

  return data;
}

// Add 'async' here
document.getElementById("checkoutBtn").addEventListener("click", async () => {
  // Add 'await' here to wait for the Promise to resolve into actual data
  const checkoutData = await buildCheckoutData();

  if (!hasFile) {
    alert("Please upload transfer slip.");
    return;
  }
  // console.log("is shipping company null?");
  // console.log(checkoutData);
  if (!checkoutData.shippingCompany) {
    alert("Please choose a shipping company.");
    return;
  }

  postToAppsScript(checkoutData);
});

function postToAppsScript(data) {
  //Make the processing order modal appear
  processingOrderModalEl.style.opacity = "1";

  const timers = [
    setTimeout(() => {
      processingOrderTextEl.innerHTML = "Almost there";
    }, 5000),
    setTimeout(() => {
      processingOrderTextEl.innerHTML = "Getting closer";
    }, 10000),
  ];

  fetch(API_URL, {
    method: "POST",
    mode: "no-cors", // Tells the browser "Send this and don't worry about reading the response"
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      // With no-cors, we can't read the JSON payload (res is "opaque").
      refreshMsg.style.display = "none";
      processingMsg.innerHTML = "Order Success!";

      localStorage.setItem("CART", "[]");

      //*************************************************//
      //**COMMENT OUT FOR LOCAL PRODUCTION ENVIRONMENT***//
      //*************************************************//
      window.location.href = "/online-store/order-details";

      //*************************************************//
      //*****COMMENT OUT FOR DEPLOYED GITHUB VERSION*****//
      //*************************************************//
      // window.location.href = "/order-details";
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      refreshMsg.style.display = "none";
      processingMsg.innerHTML = "An error occurred.";

      setTimeout(() => {
        processingOrderModalEl.style.opacity = "0";
      }, 1000);
    })
    .finally(() => {
      timers.forEach(clearTimeout);
    });
}
