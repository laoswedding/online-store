const orderItemsEl = document.querySelector(".order-items");
const orderTotalEl = document.querySelector(".order-total");
const orderItemsTotalEl = document.querySelector(".order-items-total");
const paymentAmountEl = document.querySelector(".payment-amount");
const processingOrderModalEl = document.querySelector(
  ".processing-order-modal",
);
const processingOrderTextEl = document.querySelector(".processing-order-text");
const alertModalEl = document.querySelector(".alert-modal");
const alertTextEl = document.querySelector(".alert-text");
let cart = JSON.parse(localStorage.getItem("CART")) || [];
let totalPrice = 0;
let totalItems = 0;
let selectedShippingCompany = null;
let photoUrl = ""; // filled in after upload completes from Apps Scripts
const processingMsg = document.querySelector(".processing-msg");
const refreshMsg = document.querySelector(".refresh-msg");

//RENDER ORDER SUMMARY
document.addEventListener("DOMContentLoaded", () => {
  if (cart.length === 0) {
    goBackToStore();
  } else {
    renderOrderItems();
  }
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
                <img src="${item.img_src}" alt="${item.name}" class="order-item-img">
                <p class="order-item-description"><span class="order-item-name">${item.name}:</span> ${item.description} <span class="order-item-qty"> <br>Qty: ${item.numberOfUnits}</span></p>
                <p class="order-item-price">${
                  (item.price * item.numberOfUnits).toLocaleString("lo-LA")
                } LAK</p></div>`;
  });
  orderItemsTotalEl.innerHTML = totalItems;
  orderTotalEl.innerHTML = totalPrice.toLocaleString();
  paymentAmountEl.innerHTML = totalPrice.toLocaleString();
}

//CHOOSE SHIPPING COMPANY
function clickShippingCompany(shippingCompany, element) {
  // Optional: Clear border from all shipping containers first
  document.querySelectorAll(".shipping-company-container").forEach((el) => {
    el.style.border = "none";
  });

  // Highlight the selected element
  element.style.border = "5px solid blue";
  selectedShippingCompany = shippingCompany;
}

//BOOLEAN FOR FILE UPLOAD (USED FOR CHECK - NEED TO HAVE PICTURE UPLOADED BEFORE PLACING ORDER)
let hasFile = false;

document.getElementById("imageUpload").addEventListener("change", (e) => {
  hasFile = e.target.files.length > 0;
  console.log(hasFile);
});

// HANDLE FILE UPLOAD
async function uploadFile(file, orderId) {
  const fileExt = file.name.split(".").pop();

  const filePath = `${orderId}.${fileExt}`;

  const { data, error } = await db.storage
    .from("order-slips")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return data.path;
}

// Helper function to generate a random 8-character alphanumeric ID
function generateOrderID() {
  // Math.random().toString(36) generates a random alphanumeric string.
  // We take a slice of it and convert it to uppercase.
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `KL-${randomPart}`;
}

async function buildCheckoutData() {
  const orderId = generateOrderID();

  const fileInput = document.getElementById("imageUpload");
  let fileData = null;

  if (fileInput.files.length > 0) {
    fileData = await uploadFile(fileInput.files[0], orderId);
  }

  const cartItems = cart;

  const formattedOrderItems = cartItems
    .map((item) => {
      return `x${item.numberOfUnits} ${item.name} - ₭${item.price} LAK`;
    })
    .join("\n");

  const orderItemsImgSrc = cartItems.map((item) => item.img_src).join("\n");

  const orderItemIdsAndNumberOfUnits = cartItems.map((item) => ({
    id: item.id,
    numberOfUnits: item.numberOfUnits,
  }));

  const data = {
    firstName: document.getElementById("firstName").value.trim().toUpperCase(),
    lastName: document.getElementById("lastName").value.trim().toUpperCase(),
    phone: document.getElementById("phone").value.trim(),

    shippingCompany: selectedShippingCompany,

    branch: document.getElementById("branch").value.trim().toUpperCase(),

    province: document.getElementById("laos-provinces").value.toUpperCase(),

    city: document.getElementById("city").value.toUpperCase(),

    village: document.getElementById("village").value.trim().toUpperCase(),

    fileData: fileData,

    orderItems: formattedOrderItems,

    orderId: orderId,

    orderTotal: totalPrice,

    orderTotalItems: totalItems,

    orderStatus: "pending",

    orderItemsImgSrc: orderItemsImgSrc,

    orderItemIdsAndNumberOfUnits: JSON.stringify(orderItemIdsAndNumberOfUnits),

    hasDiscountCode: false,
    discountCode: "",
  };

  localStorage.setItem("USER", JSON.stringify(data));

  return data;
}

// CLICKING ON THE PLACE ORDER BUTTON AT THE BOTTOM
document.getElementById("checkoutBtn").addEventListener("click", async () => {
  // Add 'await' here to wait for the Promise to resolve into actual data

  //CHECKING IF ALL INPUT FIELDS ARE COMPLETED
  const checkoutData = await buildCheckoutData();
  if (
    checkoutData.firstName === "" ||
    checkoutData.lastName === "" ||
    checkoutData.phone === "" ||
    checkoutData.branch === "" ||
    checkoutData.province === "" ||
    checkoutData.city === "" ||
    checkoutData.village === ""
  ) {
    showAndHideAlertModal("Please fill out all required fields (*).");
    return;
  }

  //CHECK FOR FILE UPLOAD AND SHIPPING COMPANY
  if (!hasFile && !checkoutData.shippingCompany) {
    showAndHideAlertModal(
      "Please choose a shipping company & upload transfer slip.",
    );
    return;
  }

  //CHECK FOR FILE UPLOAD
  if (!hasFile) {
    showAndHideAlertModal("Please upload transfer slip.");
    return;
  }

  //CHECK SHIPPING COMPANY
  if (!checkoutData.shippingCompany) {
    showAndHideAlertModal("Please choose a shipping company.");
    return;
  }

  postOrder(checkoutData);
});

// SHOW AND HIDE ALERT MODAL
function showAndHideAlertModal(alertModalText) {
  alertTextEl.innerHTML = alertModalText;
  alertModalEl.style.opacity = "1";
  setTimeout(() => {
    alertModalEl.style.opacity = "0";
  }, 3000);
  return;
}

async function postOrder(data) {
  processingOrderModalEl.style.opacity = "1";

  const timers = [
    setTimeout(() => {
      processingOrderTextEl.innerHTML = "Almost there";
    }, 5000),

    setTimeout(() => {
      processingOrderTextEl.innerHTML = "Getting closer";
    }, 10000),
  ];

  try {
    const order = {
      order_id: data.orderId,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      shipping_company: data.shippingCompany,
      branch: data.branch,
      province: data.province,
      city: data.city,
      village: data.village,
      fileData: data.fileData,
      order_total: data.orderTotal,
      order_total_items: data.orderTotalItems,
      order_status: data.orderStatus,
      has_discount_code: data.hasDiscountCode,
      discount_code: data.discountCode,
    };

    const { error } = await db.from("orders").insert([order]);

    if (error) {
      throw error;
    }

    console.log("Order successfully created:");

    //get order items
    const orderItems = cart.map((item) => ({
      order_id: data.orderId,
      item_id: item.id,
      item_name: item.name,
      qty: item.numberOfUnits,
      unit_price: item.price,
    }));

    const { error: itemsError } = await db
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      throw itemsError;
    }

    // Send order email
    const { data: emailResult, error: emailError } = await db.functions.invoke(
      "send-order-email",
      {
        body: {
          orderId: data.orderId,
        },
      },
    );

    if (emailError) {
      throw emailError;
    }

    console.log("Order email sent:", emailResult);

    //change styles and text
    refreshMsg.style.display = "none";
    processingMsg.innerHTML = "Order Success!";

    localStorage.setItem("CART", "[]");

    window.location.href = isLocalHost
      ? "/order-details"
      : "/online-store/order-details";
  } catch (error) {
    console.error("Order submission error:", error);

    refreshMsg.style.display = "none";
    processingMsg.innerHTML = "An error occurred.";

    setTimeout(() => {
      processingOrderModalEl.style.opacity = "0";
    }, 1000);
  } finally {
    timers.forEach(clearTimeout);
  }
}

function goBackToStore() {
  window.location.href = isLocalHost ? "/" : "/online-store";
}
