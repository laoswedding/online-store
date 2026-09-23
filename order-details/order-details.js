let user = JSON.parse(localStorage.getItem("USER")) || {};
const orderId = user?.orderId || "";
const orderDetailsEl = document.querySelector(".order-details");
let orderItems = "";
document.addEventListener("DOMContentLoaded", () => {
  if (!user || !orderId) {
    goBackToStore();
  } else {
    renderOrderDetails();
  }
});

function renderOrderDetails() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  if (!orderDetailsEl) return;

  if (!user || Object.keys(user).length === 0) {
    orderDetailsEl.innerHTML = `<p>No order details found.</p>`;
    return;
  }

  const itemLines = user.orderItems
    .split("\n")
    .filter((line) => line.trim() !== "");
  const imgLines = user.orderItemsImgSrc
    .split("\n")
    .filter((line) => line.trim() !== "");

  const orderItemsHtml = itemLines
    .map((line, i) => {
      const imgSrc = imgLines[i] || ""; // fallback in case arrays mismatch
      return `
      <div class="order-line">
        ${imgSrc ? `<img src="../${imgSrc}" alt="" class="order-line-icon">` : ""}
        <p>${line}</p>
      </div>
    `;
    })
    .join("");

  orderDetailsEl.innerHTML = `
  <div class="order-render">
    <div class="order-details-inner center">
        <img src="img/logo-white.webp">
        <p class="receipt-center-text">ORDER RECEIPT</p>
        <p class="receipt-center-text">${year}-${month}-${day} ${hours}:${minutes}:${seconds}</p>
        <p class="receipt-center-text">Order Status: <span class="pending">${user.orderStatus.toUpperCase()}</span></p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">Name:</p>
      <p>${user.firstName ?? ""} ${user.lastName ?? ""}</p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">Phone:</p>
      <p>${user.phone ?? ""}</p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">Order Id:</p>
      <p>${user.orderId ?? ""}</p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">Shipping Company:</p>
      <p>${user.shippingCompany ?? ""}</p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">Shipping Company - Branch:</p>
      <p>${user.branch ?? ""}</p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">Province:</p>
      <p>${user.province ?? ""}</p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">City:</p>
      <p>${user.city ?? ""}</p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">Village:</p>
      <p>${user.village ?? ""}</p>
    </div>
    <hr>
    <div class="order-details-inner">
      <p class="detail-label">Order Items:</p>
      ${orderItemsHtml}
    </div>
    <hr>
    <div class="order-details-inner">
      <p class="detail-label">Total Items:</p>
      <p>${user.orderTotalItems ?? ""}</p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">Total:</p>
      <p>₭${user.orderTotal ?? ""} LAK</p>
    </div>
    </div>`;
}

//CLEAR USER OBJECT IN STORE
function clearUserObjectInStore() {
  localStorage.setItem("USER", null);
  goBackToStore();
}

//GO BACK TO STORE
function goBackToStore() {
  window.location.href = isLocalHost ? "/" : "/online-store";
}

//DOWNLOAD RECEIPT BUTTON
document
  .getElementById("download-receipt")
  .addEventListener("click", async () => {
    const receipt = document.getElementById("receipt");

    const canvas = await html2canvas(receipt, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");

    link.download = `${orderId}.png`;
    link.href = canvas.toDataURL("image/png");

    link.click();
  });
