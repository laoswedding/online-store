/* ---------- loading and rendering ---------- */

async function loadItems() {
  $("#count").textContent = "Loading items…";
  try {
    // items = await api('listItems', session.token);
    //calling Sheetsdb rather than Apps Script
    items = await api("listItems");
    populateCategories();
    render();
  } catch (err) {
    if (isSessionError(err)) return expired();
    items = [];
    $("#grid").replaceChildren();
    $("#count").textContent = "";
    showEmpty("Items didn’t load", messageOf(err), "Try again", () =>
      loadItems(),
    );
  }
}

function populateCategories() {
  const cats = [
    ...new Set(
      items.map((i) => String(i.category || "").trim()).filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  const sel = $("#filter-category");
  const prev = sel.value;
  sel.replaceChildren(
    el("option", { value: "", text: "All categories" }),
    ...cats.map((c) => el("option", { value: c, text: c })),
  );
  sel.value = cats.includes(prev) ? prev : "";
  $("#category-list").replaceChildren(
    ...cats.map((c) => el("option", { value: c })),
  );
}

function visibleItems() {
  const q = $("#search").value.trim().toLowerCase();
  const cat = $("#filter-category").value;
  const stock = $("#filter-stock").value;
  const list = items.filter((it) => {
    if (cat && String(it.category || "").trim() !== cat) return false;
    if (stock === "in" && stockQty(it.inStock) <= 0) return false;
    if (stock === "out" && stockQty(it.inStock) > 0) return false;
    if (q) {
      const hay = [it.name, it.category, it.description]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const byName = (a, b) =>
    String(a.name).localeCompare(String(b.name), undefined, {
      sensitivity: "base",
    });
  const num = (v) => (isFinite(Number(v)) && v !== "" ? Number(v) : Infinity);
  switch ($("#sort").value) {
    case "price-asc":
      list.sort((a, b) => num(a.price) - num(b.price) || byName(a, b));
      break;
    case "price-desc":
      list.sort((a, b) => num(b.price) - num(a.price) || byName(a, b));
      break;
    case "updated":
      list.sort((a, b) =>
        String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")),
      );
      break;
    default:
      list.sort(byName);
  }
  return list;
}

function showEmpty(title, body, label, action) {
  const box = $("#empty");
  box.replaceChildren(el("h2", { text: title }), el("p", { text: body }));
  if (label)
    box.append(
      el("button", {
        class: "btn",
        type: "button",
        text: label,
        onclick: action,
      }),
    );
  box.hidden = false;
}

function render() {
  const list = visibleItems();
  const total = items.length;
  $("#empty").hidden = true;
  $("#grid").replaceChildren(...list.map(tile));

  if (total === 0) {
    $("#count").textContent = "";
    showEmpty(
      "No items yet",
      canEdit()
        ? "Add your first item to start the inventory."
        : "Nothing has been added to the inventory yet.",
      canEdit() ? "Add item" : null,
      () => openForm(null),
    );
  } else {
    $("#count").textContent =
      list.length === total
        ? total + (total === 1 ? " item" : " items")
        : list.length + " of " + total + " items";
    if (list.length === 0) {
      showEmpty(
        "No items match",
        "Try a different search or clear the filters.",
        "Clear filters",
        () => {
          resetFilters();
          render();
        },
      );
    }
  }
}

function tile(it) {
  const qty = stockQty(it.inStock);
  const inStock = qty > 0;
  const name = String(it.name == null ? "" : it.name);
  const makePlaceholder = () =>
    el("div", {
      class: "ph",
      "aria-hidden": "true",
      text: (name.trim()[0] || "?").toUpperCase(),
    });

  const media = el("div", { class: "media" + (inStock ? "" : " is-out") });
  const src = imgUrl(it.imgSrc);
  if (src) {
    const img = el("img", {
      src,
      alt: "",
      loading: "lazy",
      referrerpolicy: "no-referrer",
    });
    img.addEventListener("error", () => img.replaceWith(makePlaceholder()));
    media.append(img);
  } else {
    media.append(makePlaceholder());
  }
  media.append(
    el(
      "span",
      { class: "stock " + (inStock ? "in" : "out") },
      el("i", { "aria-hidden": "true" }),
      inStock ? qty + " in stock" : "Out of stock",
    ),
  );

  const article = el(
    "article",
    null,
    media,
    el(
      "div",
      { class: "row" },
      el("h2", { class: "name", text: name }),
      el("span", { class: "price", text: fmtPrice(it.price) }),
    ),
  );

  if (it.category) article.append(el("p", { class: "cat", text: it.category }));
  if (it.description)
    article.append(el("p", { class: "desc", text: it.description }));

  const actions = el("div", { class: "actions" });
  if (canEdit()) {
    actions.append(
      el("button", {
        class: "btn small",
        type: "button",
        text: "Edit",
        "aria-label": "Edit " + name,
        onclick: () => openForm(it),
      }),
    );
  }
  if (canDelete()) {
    actions.append(
      el("button", {
        class: "btn small danger",
        type: "button",
        text: "Delete",
        "aria-label": "Delete " + name,
        onclick: () => openDelete(it),
      }),
    );
  }
  const more = linkUrl(it.learnMore);
  if (more) {
    actions.append(
      el("a", {
        class: "link",
        href: more,
        target: "_blank",
        rel: "noopener noreferrer",
        text: "Learn more",
        "aria-label": "Learn more about " + name,
      }),
    );
  }
  if (actions.childNodes.length) article.append(actions);
  return article;
}

["#filter-category", "#filter-stock", "#sort"].forEach((s) =>
  $(s).addEventListener("change", render),
);
$("#search").addEventListener("input", debounce(render, 150));
$("#refresh-btn").addEventListener("click", () => loadAll());
$("#add-btn").addEventListener("click", () => openForm(null));
