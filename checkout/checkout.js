const API_URL =
  "https://script.google.com/macros/s/AKfycbysoXLUB0O0f3ixqqgpYTKMkdAX9gAGNOEtvYst-BgOXCI8yxzQQq7J8Tioey_NgKLfkw/exec";

const orderItemsEl = document.querySelector(".order-items");
const orderTotalEl = document.querySelector(".order-total");
const orderItemsTotalEl = document.querySelector(".order-items-total");
const paymentAmountEl = document.querySelector(".payment-amount");
let cart = JSON.parse(localStorage.getItem("CART")) || [];
let totalPrice = 0;
let totalItems = 0;
let selectedShippingCompany = null;
let photoUrl = ""; // filled in after upload completes

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
      return `${item.numberOfUnits}x ${item.name} - $${item.price}`;
    })
    .join("\n"); // '\n' creates a line break inside the Google Sheet cell

  //Build object
  const data = {
    name: document.getElementById("name").value.trim().toUpperCase(),
    email: document.getElementById("email").value.trim().toUpperCase(),
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
    orderTotal: totalPrice,
    orderTotalItems: totalItems,
  };

  return data;
}
// async function buildCheckoutData() {
//   const fileInput = document.getElementById("imageUpload");
//   let fileData = null;

//   if (fileInput.files.length > 0) {
//     fileData = await uploadFile(fileInput.files[0]);
//   }

//   const data = {
//     name: document.getElementById("name").value.trim().toUpperCase(),
//     email: document.getElementById("email").value.trim().toUpperCase(),
//     phone: document.getElementById("phone").value.trim(),
//     shippingCompany: selectedShippingCompany,
//     branch: document.getElementById("branch").value.trim().toUpperCase(),
//     province: document.getElementById("laos-provinces").value.toUpperCase(),
//     city: document.getElementById("city").value.toUpperCase(),
//     village: document.getElementById("village").value.trim().toUpperCase(),

//     // CHANGED: This must be 'fileData' to match your Apps Script formData.fileData check
//     fileData: fileData,
//   };

//   return data;
// }

// Add 'async' here
document.getElementById("checkoutBtn").addEventListener("click", async () => {
  // Add 'await' here to wait for the Promise to resolve into actual data
  const checkoutData = await buildCheckoutData();

  // console.log("is shipping company null?");
  // console.log(checkoutData);
  // if (!checkoutData.shippingCompany) {
  //   alert("Please choose a shipping company.");
  //   return;
  // }

  postToAppsScript(checkoutData);
});

// function postToAppsScript(data) {
//   console.log("This is the data");
//   console.log(data);
//   fetch(API_URL, {
//     method: "POST",
//     mode: "cors",
//     headers: {
//       "Content-Type": "text/plain;charset=utf-8", // Avoids triggering OPTIONS preflight
//     },
//     body: JSON.stringify(data),
//   })
//     .then((res) => res.json())
//     .then((data) => console.log(data));
// }
function postToAppsScript(data) {
  console.log("This is the data");
  console.log(data);

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
      // But if the promise resolves, we know the request was sent successfully!
      console.log("Order submitted successfully!");

      // Add your success logic here!
      // e.g., clear the cart, show a success modal, or redirect the user:
      // window.location.href = "/thank-you.html";
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}
