/* ---------- loading and rendering ---------- */

//===========================================
//=============LOAD ITEMS CODE===============
//===========================================
async function loadItems() {
  //GRAB THE ELEMENT WITH COUNT ID AND SET THE TEXT CONTENT
  $("#count").textContent = "Loading items…";
  try {
    //PASS IN THE HANDLER ACTION TO MAKE AN API CALL
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

//===========================================
//==========POPULATE CATEGORIES CODE=========
//===========================================
function populateCategories() {
  //LOOP THROUGH THE ITEMS AFTER THEY ARE RETURN FROM THE DATABASE
  //CREATE A SET (A GROUP UNIQUE VALUES) OF CATEGORIES
  const cats = [
    ...new Set(
      items.map((i) => String(i.category || "").trim()).filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  //GRAB ELEMENT
  const sel = $("#filter-category");

  //CREATE VAR TO TARGET THE VALUE OF THE SELECT
  const prev = sel.value;

  //REPLACE THE CHILDREN OF THE SELECT WITH OPTIONS
  //USING THE EL HELPER FUNCTION, VALUES AND TEXT ARE CATEGORY NAMES
  sel.replaceChildren(
    el("option", { value: "", text: "All categories" }),
    ...cats.map((c) => el("option", { value: c, text: c })),
  );

  //IF THE CATEGORY SET INCLUDES THE PREV, IT IS PREV, OTHERWISE EMPTY STRING
  sel.value = cats.includes(prev) ? prev : "";

  //TARGET CATEGORY LIST ELEMENT AND REPLACE THE CHILDREN WITH OPTIONS AGAIN
  $("#category-list").replaceChildren(
    ...cats.map((c) => el("option", { value: c })),
  );
}

//===========================================
//============PRODUCT FILTER CODE============
//===========================================
function visibleItems() {
  //GET THE SEARCH INPUT AND ASSIGN TO A VARIABLE
  const q = $("#search").value.trim().toLowerCase();

  //GET THE CATEGORY VALUE AND ASSIGN TO A VARIABLE
  const cat = $("#filter-category").value;

  //GET THE INSTOCK VALUE AND ASSIGN TO A VARIABLE
  const stock = $("#filter-stock").value;

  //CREATE A LIST OF FILTERED PRODUCTS BASED ON THE CONDITIONS
  const list = items.filter((it) => {
    //IF ITEM CATEGORY IS NOT THE SAME AS THE SELECTED CATEGORY - DO NOT INCLUDE IN THE LIST
    if (cat && String(it.category || "").trim() !== cat) return false;

    //IF YOU CHOSE IN STOCK AND THE ITEM'S STOCK IS LESS THEN OR EQUAL TO ZERO - DO NOT INCLUDE IN THE LIST
    if (stock === "in" && stockQty(it.inStock) <= 0) return false;

    //IF YOU CHOSE OUT OF STOCK AND THE ITEM'S STOCK IS GREATER THAN ZERO - DO NOT INCLUDE IN THE LIST
    if (stock === "out" && stockQty(it.inStock) > 0) return false;

    //IF THERE IS A SEARCH QUERY
    //JOIN ALL THE TEXT FROM THE ITEM'S NAME, CATEGORY, AND DESCRIPTION
    if (q) {
      const hay = [it.name, it.category, it.description]
        .join(" ")
        .toLowerCase();
      //IF JOINED TEXT DOES NOT INCLUDE THE USER'S SEARCH QUERY - DO NOT INCLUDE IN THE LIST
      if (!hay.includes(q)) return false;
    }

    //OTHERWISE, INCLUDE IN THE LIST
    return true;
  });

  //SORT PRODUCT NAMES FROM A TO Z
  const byName = (a, b) =>
    String(a.name).localeCompare(String(b.name), undefined, {
      sensitivity: "base",
    });

  //PRICE LOW TO HIGH, HIGH TO LOW, AND RECENTLY UPDATED SORTING
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

//SHOW EMPTY ELEMENT HELPER FUNCTION
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

//RENDERING OF PRODUCTS
function render() {
  //LIST VAR OF FILTERED ITEMS
  const list = visibleItems();

  //TOTAL NUMBER OF ITEMS
  const total = items.length;

  //HIDE EMPTY COMPONENT
  $("#empty").hidden = true;

  //CALL THE TILE TO FORM EACH ITEM'S MARKUP
  //THEN MAP THROUGH THE LIST OF THOSE ITEMS
  $("#grid").replaceChildren(...list.map(tile));

  //NO ITEMS RENDERED
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

//===========================================
//==============TILE MARKUP CODE=============
//===========================================

//just before rendering/mapping the items on a grid, (  $("#grid").replaceChildren(...list.map(tile));)
//tile is passed into the map
//tile takes in an item
function tile(it) {
  //gets the quantity from the inStock value
  const qty = stockQty(it.inStock);

  //inStock true or value boolean
  const inStock = qty > 0;

  //product name
  const name = String(it.name == null ? "" : it.name);

  //create the div to make a placeholder
  const makePlaceholder = () =>
    el("div", {
      class: "ph",
      "aria-hidden": "true",
      text: (name.trim()[0] || "?").toUpperCase(),
    });

  //create the div for media
  const media = el("div", { class: "media" + (inStock ? "" : " is-out") });

  //get the image source for the product
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

  //create the element to go inside the media div
  media.append(
    el(
      "span",
      { class: "stock " + (inStock ? "in" : "out") },
      el("i", { "aria-hidden": "true" }),
      inStock ? qty + " in stock" : "Out of stock",
    ),
  );

  //create the div container for the product
  //article tag, no props, include media after and a row div, name h2, and span for price as children

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

  //if item has a category, add a p tag with the category text
  if (it.category) article.append(el("p", { class: "cat", text: it.category }));

  //if there is a description, add a p tag with the description text
  if (it.description)
    article.append(el("p", { class: "desc", text: it.description }));

  //add a container for user inventory actions
  const actions = el("div", { class: "actions" });

  //if the user has edit permissions, add a small edit button
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
  //if the user has delete permissions, add a small delete button
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

  //assign learn more to a variable
  const more = linkUrl(it.learnMore);

  //if it is not an empty string, add a link and add it into the actions container
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

  //if the actions container has children, then add the actions container to the product car (article tag)
  if (actions.childNodes.length) article.append(actions);

  //return the product card
  return article;
}

//add event listeners to elements with the following id's
["#filter-category", "#filter-stock", "#sort"].forEach((s) =>
  $(s).addEventListener("change", render),
);
$("#search").addEventListener("input", debounce(render, 150));
$("#refresh-btn").addEventListener("click", () => loadAll());
$("#add-btn").addEventListener("click", () => openForm(null));
