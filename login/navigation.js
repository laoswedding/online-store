/* ---------- navigation ---------- */

const VIEW_LABEL = {
  overview: "Overview",
  inventory: "Inventory",
  shipping: "Shipping",
  orders: "Orders",
  sales: "Sales",
};
const canSeeOrders = () => canEdit(); // orders hold customer contact details, so viewers don't get them
const availableViews = () =>
  canSeeOrders()
    ? ["overview", "inventory", "shipping", "orders", "sales"]
    : ["inventory"];

function viewFromHash() {
  const v = location.hash.replace("#", "");
  return availableViews().includes(v) ? v : availableViews()[0];
}

function renderNav() {
  $("#tabs").replaceChildren(
    ...availableViews().map((v) => {
      const a = el("a", { class: "tab", href: "#" + v, text: VIEW_LABEL[v] });
      if (v === currentView) a.setAttribute("aria-current", "page");
      const waiting = v === "shipping" ? pendingOrders().length : 0;
      if (waiting)
        a.append(el("span", { class: "pill", text: String(waiting) }));
      return a;
    }),
  );
}

function renderCurrent() {
  switch (currentView) {
    case "overview":
      return renderOverview();
    case "shipping":
      return renderShipping();
    case "orders":
      return renderOrders();
    case "sales":
      return renderSales();
    default:
      return render();
  }
}

function showView(view) {
  currentView = view;
  document.querySelectorAll(".view").forEach((sec) => {
    sec.hidden = sec.id !== "view-" + view;
  });
  renderNav();
  renderCurrent();
}

window.addEventListener("hashchange", () => {
  if (session) showView(viewFromHash());
});

async function loadOrders() {
  try {
    // orders = await api('listOrders', session.token);
    //calling Sheetsdb rather than Apps Script
    orders = await api("listOrders");
    console.log("this is the order", orders)
    ordersError = "";
  } catch (err) {
    if (isSessionError(err)) return expired();
    orders = [];
    ordersError = messageOf(err);
  }
}

async function loadAll() {
  const refresh = $("#refresh-btn");
  refresh.disabled = true;
  try {
    const tasks = [loadItems()];
    if (canSeeOrders()) tasks.push(loadOrders());
    await Promise.all(tasks);
    if (!session) return; // signed out while loading
    renderNav();
    renderCurrent();
  } finally {
    refresh.disabled = false;
  }
}
