// ============ Supabase adapter ============
(async function restoreSession() {
  const { data } = await db.auth.getSession();
  if (!data.session) {
    showLogin("");
    return;
  }
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", data.session.user.id)
    .single();
  session = {
    ...data.session,
    token: data.session.access_token,
    role: profile?.role || "viewer",
  };
  enterApp();
})();

async function requireSession() {
  const { data } = await db.auth.getSession(); // also refreshes an expiring token
  if (!data.session) throw new Error("Session expired. Please sign in again.");
  return data.session;
}

async function run(query) {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

// Database row -> the camelCase shape your UI already uses
const itemFromDb = (r) => ({
  id: r.id,
  name: r.name,
  price: r.price,
  inStock: r.in_stock,
  description: r.description,
  category: r.category,
  imgSrc: r.img_src,
  learnMore: r.learn_more,
  updatedBy: r.updated_by,
  updatedAt: r.updated_at,
});

const ITEM_COLUMNS = {
  name: "name",
  price: "price",
  inStock: "in_stock",
  description: "description",
  category: "category",
  imgSrc: "img_src",
  learnMore: "learn_more",
};
function itemToDb(obj) {
  const row = {};
  for (const [key, col] of Object.entries(ITEM_COLUMNS))
    if (key in obj) row[col] = obj[key];
  return row;
}

const orderFromDb = (r) => {
  const lines = r.order_items || [];
  return {
    firstName: r.first_name,
    lastName: r.last_name,
    phone: r.phone,
    shippingCompany: r.shipping_company,
    branch: r.branch,
    province: r.province,
    city: r.city,
    village: r.village,
    photoUrl: r.photo_url,
    timestamp: r.created_at,
    orderId: r.order_id,
    orderTotal: r.order_total,
    orderTotalItems: r.order_total_items,
    orderStatus: r.order_status,
    tracking: r.tracking,
    hasDiscountCode: r.has_discount_code,
    discountCode: r.discount_code,
    // Rebuilt from order_items so your existing rendering code keeps working:
    orderItems: lines.map((l) => l.item_name).join(", "), // CHECK format
    orderItemsImgSrc: lines
      .map((l) => (l.items && l.items.img_src) || "")
      .join(", "), // CHECK format RIGHT HERE
    orderItemIdsAndNumberOfUnits: JSON.stringify(
      lines.map((l) => ({ id: l.item_id, numberOfUnits: l.qty })),
    ), //AND HERE
    lines, // cleaner structure for any new code
  };
};

// New payment slips are private files: swap the stored path for a temporary link (1 hour).
// Old imported orders already hold a full http(s) URL and are left alone.
async function withSlipUrls(orders) {
  const paths = orders
    .map((o) => o.photoUrl)
    .filter((p) => p && !/^https?:/i.test(p));
  if (!paths.length) return orders;
  const { data } = await db.storage
    .from("payment-slips")
    .createSignedUrls(paths, 3600);
  const urls = Object.fromEntries(
    (data || []).filter((d) => d.signedUrl).map((d) => [d.path, d.signedUrl]),
  );
  return orders.map((o) =>
    urls[o.photoUrl] ? { ...o, photoUrl: urls[o.photoUrl] } : o,
  );
}

const HANDLERS = {
  listItems: async () => {
    await requireSession();
    return (await run(db.from("items").select("*").order("name"))).map(
      itemFromDb,
    );
  },
  createItem: async (_token, item) => {
    await requireSession();
    const row = itemToDb(item);
    if (item.id) row.id = item.id; // otherwise the database generates one
    return itemFromDb(
      await run(db.from("items").insert(row).select().single()),
    );
  },
  updateItem: async (_token, id, changes) => {
    await requireSession();
    return itemFromDb(
      await run(
        db
          .from("items")
          .update(itemToDb(changes))
          .eq("id", id)
          .select()
          .single(),
      ),
    );
  },
  deleteItem: async (_token, id) => {
    await requireSession();
    const rows = await run(db.from("items").delete().eq("id", id).select("id"));
    if (!rows.length) throw new Error("Item not found.");
    return true;
  },
  listOrders: async () => {
    await requireSession();

    //call supabase
    const rows = await run(
      db
        .from("orders")
        .select("*, order_items(*, items(img_src))")
        .order("created_at", { ascending: false }),
    );

    //show orders in console
    // console.log("ORDERS FROM SUPABASE:", rows);

    return withSlipUrls(rows.map(orderFromDb));
  },
  shipOrder: async (_token, orderId) => {
    await requireSession();
    return run(db.rpc("ship_order", { p_order_id: orderId })); // { warnings: { itemsNotFoundInInventory } }
  },
  cancelOrder: (orderId) =>
    run(db.rpc("cancel_order", { p_order_id: orderId })),
  changePassword: async (_token, currentPassword, newPassword) => {
    const session = await requireSession();
    // Supabase doesn't check the current password itself, so re-verify it first
    const { error: bad } = await db.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword,
    });
    if (bad) throw new Error("Your current password is incorrect.");
    const { error } = await db.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
    return true;
  },
};

async function api(action, ...args) {
  const handler = HANDLERS[action];
  if (!handler) throw new Error("Unknown action: " + action);
  return handler(...args);
}

function showLogin(message) {
  session = null;
  items = [];
  orders = [];
  ordersError = "";
  openOrderIds.clear();
  $("#orders-search").value = "";
  $("#orders-status").value = "";
  if (location.hash)
    history.replaceState(null, "", location.pathname + location.search);
  document.querySelectorAll("dialog[open]").forEach((d) => d.close());
  $("#app-view").hidden = true;
  $("#login-view").hidden = false;
  $("#login-error").textContent = message || "";
  ($("#login-email").value ? $("#login-password") : $("#login-email")).focus();
}

// const isSessionError = (err) => /session expired|jwt|not authenticated/i.test((err && err.message) || '');
