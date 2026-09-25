document
  .getElementById("orderForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault(); // stop normal form submission / page reload

    const orderId = document.getElementById("orderId").value.trim();
    const resultDiv = document.getElementById("result");

    if (!orderId) return;

    const url = `${SHEETS_DB_BASE_API_URL}/search?orderId=${encodeURIComponent(orderId)}`;

    resultDiv.textContent = "Loading...";

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      const data = await response.json();

      if (data[0].length === 0) {
        resultDiv.textContent = "No order found with that ID.";
      } else {
        console.log(data[0]);
        // data is an array of matching rows
        const itemLines = data[0].orderItems
          .split("\n")
          .filter((line) => line.trim() !== "");
        const imgLines = data[0].orderItemsImgSrc
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

        // console.log(data[0]);
        //GENERATE SHIP BUTTON IF ORDER HASN'T BEEN CANCELLED OR SHIPPED
        const shipButtonHtml =
          data[0].orderStatus.toLowerCase() === "pending"
            ? `<button class="checkoutBtn" id="checkoutBtn" data-order-id="${data[0].orderId}">Ship Order</button>`
            : "";

        resultDiv.innerHTML = `
        <div class="order-render">
    <div class="order-details-inner center">
      <p>${data[0].orderId ?? ""}</p>
    </div>
    <div class="order-details-inner center">
      <p>Order Status: ${data[0].orderStatus.toUpperCase() ?? ""}</p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">Name:</p>
      <p>${data[0].firstName ?? ""} ${data[0].lastName ?? ""}</p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">Phone:</p>
      <p>${data[0].phone ?? ""}</p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">Shipping Company:</p>
      <p>${data[0].shippingCompany ?? ""}</p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">Shipping Company - Branch:</p>
      <p>${data[0].branch ?? ""}</p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">Province:</p>
      <p>${data[0].province ?? ""}</p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">City:</p>
      <p>${data[0].city ?? ""}</p>
    </div>
    <div class="order-details-inner">
      <p class="detail-label">Village:</p>
      <p>${data[0].village ?? ""}</p>
    </div>
    <hr>
    <div class="order-details-inner">
      <p class="detail-label">Order Items:</p>
      ${orderItemsHtml}
    </div>
    <hr>
    <div class="order-details-inner">
      <p class="detail-label">Total Items:</p>
      <p>${data[0].orderTotalItems ?? ""}</p>
    </div>

    <div class="order-details-inner">
      <p class="detail-label">Total:</p>
      <p>₭${data[0].orderTotal ?? ""} LAK</p>
    </div>
    ${shipButtonHtml}
    </div>`;
      }
    } catch (err) {
      resultDiv.textContent = "Error: " + err.message;
    }
  });

document.getElementById("result").addEventListener("click", async (e) => {
  if (!e.target.classList.contains("checkoutBtn")) return;

  const button = e.target;
  const orderId = button.dataset.orderId;

  button.disabled = true;
  button.textContent = "Shipping...";

  try {
    const response = await fetch(APPS_SCRIPT_API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "shipOrder",
        orderId: orderId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      button.textContent = "Shipped ✓";
      // maybe remove the row, update UI, etc.
    } else {
      alert("Error: " + result.error);
      button.disabled = false;
      button.textContent = "Mark as shipped";
    }
  } catch (err) {
    console.error(err);
    alert("Network error — please try again.");
    button.disabled = false;
    button.textContent = "Mark as shipped";
  }
});
