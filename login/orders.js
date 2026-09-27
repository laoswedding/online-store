/* ---------- order data ---------- */

//===========================================
//============ORDER ITEMS CODE===============
//===========================================
const LOW_STOCK = 5; // items at or below this many units count as running low

const STATUS_LABEL = {
  pending: "Pending",
  shipped: "Shipped",
  cancelled: "Cancelled",
};
const openOrderIds = new Set();

// Anything that isn't marked shipped or cancelled in the sheet counts as pending.
//PASS IN THE ORDER
function orderStatus(o) {
  //SET STRING S TO THE ORDER STATUS
  const s = String(o.orderStatus == null ? "" : o.orderStatus)
    .trim()
    .toLowerCase();
  if (s === "shipped") return "shipped";
  if (s === "cancelled" || s === "canceled") return "cancelled";
  return "pending";
}

function orderTotal(o) {
  let s = String(o.orderTotal == null ? "" : o.orderTotal).replace(
    /[^\d.\-]/g,
    "",
  );
  if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, ""); // 1.250.000 style separators
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}

function orderDate(o) {
  const t = o.timestamp;
  if (!t) return null;
  const d = new Date(typeof t === "string" ? t.trim().replace(" ", "T") : t);
  return isNaN(d) ? null : d;
}

function orderLines(o) {
  try {
    const arr = JSON.parse(o.orderItemIdsAndNumberOfUnits);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

const itemById = (id) => items.find((i) => String(i.id) === String(id));

//FILTER PENDING ORDERS
const pendingOrders = () => orders.filter((o) => orderStatus(o) === "pending");

const byDate = (dir) => (a, b) =>
  dir * ((orderDate(a) || 0) - (orderDate(b) || 0));

//SET CUSTOMER NAME
const customerName = (o) =>
  [o.firstName, o.lastName].filter(Boolean).join(" ") || "Unnamed customer";

//SET CUSTOMER ADDRESS
const destination = (o) =>
  [o.village, o.city, o.province].filter(Boolean).join(", ");

//SET ORDER DATE
const dateLabel = (o) => {
  const d = orderDate(o);
  return d ? d.toLocaleDateString(undefined, { dateStyle: "medium" }) : "";
};

//SET ORDER DATE TIME
const dateTimeLabel = (o) => {
  const d = orderDate(o);
  return d
    ? d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "";
};

//CHECK THE STOCK, IF IT ENOUGH TO FULFILL THE ORDER
function stockCheck(o) {
  if (!items.length) return { ok: true, unknown: true, problems: [] };

  //EMPTY ARRAY FOR PROBLEMS
  const problems = [];

  orderLines(o).forEach((line) => {
    //GET THE NUMBER OF UNITS
    const units = Number(line.numberOfUnits) || 0;

    //GET THE ITEM ID
    const it = itemById(line.id);

    //IF ITEM ID DOES NOT EXIST, ITEM IS NOT IN INVENTORY
    if (!it) problems.push("item " + line.id + " isn’t in the inventory");
    else if (stockQty(it.inStock) < units)
      //IF THE ITEM STOCK QUANTITY IS LESS THAN THE ORDER'S QTY
      //NEEDS MORE MESSAGE IS RENDERED
      problems.push(
        it.name + " needs " + units + ", has " + stockQty(it.inStock),
      );
  });
  return { ok: problems.length === 0, unknown: false, problems };
}

const emptyBlock = (title, body) =>
  el(
    "div",
    { class: "empty" },
    el("h2", { text: title }),
    el("p", { text: body }),
  );

const statusBadge = (s) =>
  el(
    "span",
    { class: "badge " + s },
    el("i", { "aria-hidden": "true" }),
    STATUS_LABEL[s],
  );

function ordersProblem(container) {
  if (!ordersError) return false;
  container.replaceChildren(
    el(
      "div",
      { class: "empty" },
      el("h2", { text: "Orders didn’t load" }),
      el("p", { text: ordersError }),
      el("button", {
        class: "btn",
        type: "button",
        text: "Try again",
        onclick: () => loadAll(),
      }),
    ),
  );
  return true;
}

/* ---------- order details, shared by Orders and Shipping ---------- */

//FOUND IN ORDERS TAB IN THE UI- order is passed into the function
function orderDetail(o) {
  //use orderStatus helper to get the status
  const status = orderStatus(o);

  //create a div that will serve as the outer container
  const box = el("div", { class: "detail-box" });

  //BUILD CUSTOMER DIV DELEMENT
  const who = el(
    "div",
    null,
    el("h3", { text: "Customer" }),
    el("p", { text: customerName(o) }),
  );

  //ASSIGN PHONE NUMBER VAR
  const phone = String(o.phone == null ? "" : o.phone).trim();

  //APPEND PHONE NUMBER
  if (phone) {
    const tel = phone.replace(/[^\d+]/g, "");
    who.append(
      tel
        ? el("p", null, el("a", { href: "tel:" + tel, text: phone }))
        : el("p", { text: phone }),
    );
  }

  //ASSIGN DESTINATION VAR
  const dest = destination(o);

  //APPEND DESTINATION
  if (dest) who.append(el("p", { text: dest }));

  //ASSIGN SHIPPING COMPANY
  const via = [o.shippingCompany, o.branch ? o.branch + " branch" : ""]
    .filter(Boolean)
    .join(", ");

  //APPEND SHIPPING COMPANY
  if (via) who.append(el("p", { class: "sub", text: "Ship via " + via }));

  //ASSIGN PHOTO
  const photo = resolveUrl(o.photoUrl, "");

  //APPEND PHOTO
  if (photo) {
    who.append(
      el(
        "p",
        null,
        el("a", {
          href: photo,
          target: "_blank",
          rel: "noopener noreferrer",
          text: "View transfer slip",
        }),
      ),
    );
  }

  //BUILD A DIV WITH A H3 WITH THE TEXT ITEMS
  const what = el("div", null, el("h3", { text: "Items" }));

  //splits the names of the items at the comma
  const texts = String(o.orderItems || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  //splits the img src at the comma
  const imgs = String(o.orderItemsImgSrc || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  //parses the numbers of units of the order items of a particular order
  const quantities = JSON.parse(o.orderItemIdsAndNumberOfUnits || "[]");

  //create ul with the class "lines"
  const list = el("ul", { class: "lines" });

  //each line of text
  texts.forEach((t, i) => {
    //create a list item
    const li = el("li");

    //get the image src for the current index
    const src = imgUrl(imgs[i]);

    //if there is an image source, create an image tag with the following attributes
    if (src) {
      const img = el("img", {
        src,
        alt: "",
        loading: "lazy",
        referrerpolicy: "no-referrer",
      });
      img.addEventListener("error", () => img.remove());
      li.append(img);
    }

    //get the quantity of the current index
    const quantity = quantities[i]?.numberOfUnits ?? 1;

    li.append(
      el("span", {
        text: `${t} × ${quantity}`,
      }),
    );
    list.append(li);
  });
  if (!texts.length)
    list.append(el("li", { text: "No item details were saved." }));
  what.append(list);

  //APPEND STOCK CHECK LINE IF ORDER IS PENDING
  if (status === "pending") {
    const chk = stockCheck(o);
    what.append(
      el("p", {
        class: "stockline" + (chk.ok ? "" : " short"),
        text: chk.unknown
          ? "Stock couldn’t be checked."
          : chk.ok
            ? "Stock is enough for every item."
            : "Not enough stock: " + chk.problems.join("; ") + ".",
      }),
    );
  }
  box.append(who, what);

  //RENDER SHIP AND CANCEL ORDER BUTTONS BASED ON USER PERMISSIONS
  if (canEdit() && status === "pending") {
    box.append(
      el(
        "div",
        { class: "detail-actions" },
        el("button", {
          class: "btn primary small",
          type: "button",
          text: "Ship order",
          "aria-label": "Ship order " + o.orderId,
          onclick: () => shipOrderFlow(o),
        }),
        el("button", {
          class: "btn small danger",
          type: "button",
          text: "Cancel order",
          "aria-label": "Cancel order " + o.orderId,
          onclick: () => cancelOrderFlow(o),
        }),
      ),
    );
  }
  return box;
}
