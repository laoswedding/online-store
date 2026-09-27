// ============ Supabase adapter ============
//===========================================
//==============SESSION CODE=================
//===========================================
//when refreshing the page, if there is a valid session then enter the app otherwise you will login in again
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

//for more sensitive requests, you will need a session check from the database prior to carrying out a task
async function requireSession() {
  const { data } = await db.auth.getSession(); // also refreshes an expiring token
  if (!data.session) throw new Error("Session expired. Please sign in again.");
  return data.session;
}

// async function run(query) {
//   const { data, error } = await query;
//   if (error) throw new Error(error.message);
//   return data;
// }

async function run(query) {
  const { data, error } = await query;
  if (error) {
    console.error("Full Supabase error:", error);
    throw new Error(error.message);
  }
  return data;
}

//===========================================
//===============FORMAT CODE=================
//===========================================
//========JSON AND SQL COLUMN NAMES==========

//converts the ITEM returned from the database
//formats it into a json object, without all the underscores
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

//json object corresponding with the columns in the database
const ITEM_COLUMNS = {
  name: "name",
  price: "price",
  inStock: "in_stock",
  description: "description",
  category: "category",
  imgSrc: "img_src",
  learnMore: "learn_more",
};

//convert the json object into something that the database can read in terms of column names
function itemToDb(obj) {
  const row = {};
  for (const [key, col] of Object.entries(ITEM_COLUMNS))
    if (key in obj) row[col] = obj[key];
  return row;
}

//converts the ORDER returned from the database
//formats it into a json object, without all the underscores
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

//===========================================
//==============HANDLER CODE=================
//===========================================
const MAX_ITEM_IMAGES = 5;

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

    // Look up this item's images first, since the cascade delete below removes
    // the item_images rows before we'd have any other way to find their file paths.
    const images = await run(
      db.from("item_images").select("url").eq("item_id", id),
    );

    if (images.length) {
      const paths = images.map((img) => extractStoragePath(img.url));
      const { error: storageError } = await db.storage
        .from("product-images")
        .remove(paths);
      if (storageError) {
        console.error(
          "Could not delete storage files for item",
          id,
          storageError,
        );
        // Continue anyway — better to remove the item than leave it stuck
        // because of a storage cleanup failure.
      }
    }

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

  listItemImages: async (_token, itemId) => {
    await requireSession();
    const rows = await run(
      db.from("item_images").select().eq("item_id", itemId).order("sort_order"),
    );
    return rows.map((r) => ({ id: r.id, url: r.url, sortOrder: r.sort_order }));
  },

  addItemImage: async (_token, itemId, url) => {
    await requireSession();
    const existing = await run(
      db.from("item_images").select("id").eq("item_id", itemId),
    );
    if (existing.length >= MAX_ITEM_IMAGES) {
      throw new Error(`An item can have at most ${MAX_ITEM_IMAGES} images.`);
    }
    const row = await run(
      db
        .from("item_images")
        .insert({ item_id: itemId, url, sort_order: existing.length })
        .select()
        .single(),
    );
    return { id: row.id, url: row.url, sortOrder: row.sort_order };
  },

  deleteItemImage: async (_token, imageId) => {
    await requireSession();

    const row = await run(
      db.from("item_images").select("url").eq("id", imageId).single(),
    );
    console.log("Row url:", row.url);

    const path = extractStoragePath(row.url);
    console.log("Extracted path:", path);

    const { data, error: storageError } = await db.storage
      .from("product-images")
      .remove([path]);
    console.log("Storage remove result:", data, storageError);

    await run(db.from("item_images").delete().eq("id", imageId));
    return { deleted: imageId };
  },

  reorderItemImages: async (_token, itemId, orderedIds) => {
    await requireSession();
    await Promise.all(
      orderedIds.map((id, i) =>
        run(
          db
            .from("item_images")
            .update({ sort_order: i })
            .eq("id", id)
            .eq("item_id", itemId),
        ),
      ),
    );
    return { reordered: true };
  },
};

//help to extract image storage path
function extractStoragePath(publicUrl) {
  const marker = "/product-images/";
  const i = publicUrl.indexOf(marker);
  return i === -1 ? publicUrl : publicUrl.slice(i + marker.length);
}

//===========================================
//==============API CALL CODE================
//===========================================
async function api(action, ...args) {
  //BASED ON THE ACTION, EXECUTE THE APPROPRIATE HANDLER
  const handler = HANDLERS[action];
  if (!handler) throw new Error("Unknown action: " + action);
  return handler(...args);
}

//===========================================
//================SHOW LOGIN=================
//===========================================
function showLogin(message) {
  //IF A SESSION IS NOT RETURN FROM THE DATABASE
  //CLEAR OUT THE VARIABLES LISTED BELOW
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

  //HIDE THE APP
  $("#app-view").hidden = true;

  //SHOW THE LOGIN PAGE
  $("#login-view").hidden = false;
  $("#login-error").textContent = message || "";
  ($("#login-email").value ? $("#login-password") : $("#login-email")).focus();
}

//PICTURE UPLOAD
const IMAGE_BUCKET = "product-images";

async function uploadItemImage(file, itemId) {
  const ext = file.name.split(".").pop();
  const path = `${itemId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await db.storage // was: supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (uploadError)
    throw new Error("Image upload failed: " + uploadError.message);
  console.error("Full upload error:", uploadError);
  const { data } = db.storage.from(IMAGE_BUCKET).getPublicUrl(path); // was: supabase.storage
  return data.publicUrl;
}
