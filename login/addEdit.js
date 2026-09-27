/* ---------- add / edit ---------- */

const itemDialog = $("#item-dialog");

let galleryRequestId = 0; // NEW: increments each time the form opens

function openForm(it) {
  if (!canEdit()) return;
  editingId = it ? it.id : null;
  $("#item-dialog-title").textContent = it ? "Edit item" : "Add item";
  $("#form-save").textContent = it ? "Save changes" : "Add item";
  $("#f-name").value = it ? it.name || "" : "";
  $("#f-price").value = it && it.price !== "" && it.price != null ? it.price : "";
  $("#f-category").value = it ? it.category || "" : "";
  $("#f-stock").value = it && it.inStock !== "" && it.inStock != null ? it.inStock : "";
  $("#f-description").value = it ? it.description || "" : "";
  $("#f-learn").value = it ? it.learnMore || "" : "";
  $("#form-error").textContent = "";
  $("#form-meta").textContent =
    it && it.updatedBy
      ? "Last updated by " + it.updatedBy + (fmtDate(it.updatedAt) ? " on " + fmtDate(it.updatedAt) : "")
      : "";
  itemDialog.showModal();
  $("#f-name").focus();

  galleryImages = [];
  galleryDeletes = [];
  renderGallery();

  const requestId = ++galleryRequestId; // NEW: this open's unique id
  if (it) {
    api("listItemImages", session.token, it.id).then((imgs) => {
      if (requestId !== galleryRequestId) return; // NEW: a newer openForm call happened, discard this
      galleryImages = imgs;
      renderGallery();
    });
  }
}

// $("#f-img-file").addEventListener("change", updatePreview);

// function updatePreview() {
//   const box = $("#img-preview");
//   const url = imgUrl($("#f-img").value);
//   if (!url) {
//     box.hidden = true;
//     box.replaceChildren();
//     return;
//   }
//   const img = el("img", {
//     src: url,
//     alt: "Preview of the image link",
//     referrerpolicy: "no-referrer",
//   });
//   img.addEventListener("error", () =>
//     box.replaceChildren(
//       el("span", {
//         class: "bad",
//         text: "This image couldn’t load. Check the link.",
//       }),
//     ),
//   );
//   box.replaceChildren(img);
//   box.hidden = false;
// }
// $("#f-img").addEventListener("input", debounce(updatePreview, 400));

function readForm() {
  return {
    name: $("#f-name").value.trim(),
    price: $("#f-price").value.trim(),
    inStock: $("#f-stock").value.trim(),
    category: $("#f-category").value.trim(),
    description: $("#f-description").value.trim(),
    learnMore: $("#f-learn").value.trim(),
  };
}

// Friendly checks only. The server re-validates everything.
function validate(d) {
  if (!d.name) return "Enter a name.";
  if (d.price === "" || !isFinite(Number(d.price)) || Number(d.price) < 0)
    return "Enter a price of 0 or more.";
  if (
    d.inStock === "" ||
    !Number.isInteger(Number(d.inStock)) ||
    Number(d.inStock) < 0
  ) {
    return "Enter a stock quantity of 0 or more, using whole numbers.";
  }
  if (hasOtherScheme(d.imgSrc) || hasOtherScheme(d.learnMore)) {
    return "Links must start with http:// or https://, or be a path like images/photo.jpg.";
  }
  return "";
}

$("#form-cancel").addEventListener("click", () => itemDialog.close());

//SUMBIT HANDLER FOR FORM
$("#item-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = readForm();
  const problem = validate(data);
  if (problem) {
    $("#form-error").textContent = problem;
    return;
  }
  data.price = Number(data.price);
  data.inStock = Number(data.inStock);

  const wasEdit = editingId !== null && editingId !== undefined;
  const btn = $("#form-save");
  const label = btn.textContent;
  $("#form-error").textContent = "";
  btn.disabled = true;
  btn.textContent = "Saving…";
  try {
    // 1. Create or update the item row itself (no image fields here anymore)
    if (wasEdit) {
      await api("updateItem", session.token, editingId, data);
    } else {
      const created = await api("createItem", session.token, data);
      editingId = created.id;
    }

    // 2. Remove any images the user deleted from the gallery
    for (const id of galleryDeletes) {
      await api("deleteItemImage", session.token, id);
    }

    // 3. Upload and save any newly picked images
    for (const img of galleryImages) {
      if (img.file) {
        btn.textContent = "Uploading image…";
        const url = await uploadItemImage(img.file, editingId);
        const saved = await api("addItemImage", session.token, editingId, url);
        img.id = saved.id;
        img.url = saved.url;
      }
    }
    btn.textContent = "Saving…";

    // 4. Save the final order
    await api(
      "reorderItemImages",
      session.token,
      editingId,
      galleryImages.map((img) => img.id)
    );

    // 5. Keep items.img_src pointing at the first gallery photo, so the catalog grid
    //    still shows a cover image without needing changes elsewhere.
    const cover = galleryImages[0]?.url || "";
    await api("updateItem", session.token, editingId, { imgSrc: cover });

    itemDialog.close();
    toast(wasEdit ? "Changes saved" : "Item added");
    await loadItems();
  } catch (err) {
    if (isSessionError(err)) return expired();
    $("#form-error").textContent = messageOf(err);
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
});

// $("#item-form").addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const data = readForm();
//   const problem = validate(data);
//   if (problem) {
//     $("#form-error").textContent = problem;
//     return;
//   }
//   data.price = Number(data.price);
//   data.inStock = Number(data.inStock);

//   const wasEdit = editingId !== null && editingId !== undefined;
//   const btn = $("#form-save");
//   const label = btn.textContent;
//   $("#form-error").textContent = "";
//   btn.disabled = true;
//   btn.textContent = "Saving…";
//   try {
//     const file = $("#f-img-file").files[0]; // NEW
//     if (file) {
//       // NEW
//       if (!wasEdit) editingId = crypto.randomUUID(); // NEW: pin the id now so image + row match
//       btn.textContent = "Uploading image…"; // NEW
//       data.imgSrc = await uploadItemImage(file, editingId); // NEW
//       if (!wasEdit) data.id = editingId; // NEW: createItem uses item.id if present
//       btn.textContent = "Saving…"; // NEW
//     }

//     if (wasEdit) await api("updateItem", session.token, editingId, data);
//     else await api("createItem", session.token, data);
//     itemDialog.close();
//     toast(wasEdit ? "Changes saved" : "Item added");
//     await loadItems();
//   } catch (err) {
//     if (isSessionError(err)) return expired();
//     $("#form-error").textContent = messageOf(err);
//   } finally {
//     btn.disabled = false;
//     btn.textContent = label;
//   }

//   for (const id of galleryDeletes) {
//   await api('deleteItemImage', session.token, id);
// }
// for (const img of galleryImages) {
//   if (img.file) {
//     const url = await uploadItemImage(img.file, editingId);
//     const saved = await api('addItemImage', session.token, editingId, url);
//     img.id = saved.id;
//     img.url = saved.url;
//   }
// }
// await api('reorderItemImages', session.token, editingId, galleryImages.map((img) => img.id));
// });
// $("#item-form").addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const data = readForm();
//   const problem = validate(data);
//   if (problem) {
//     $("#form-error").textContent = problem;
//     return;
//   }
//   data.price = Number(data.price);
//   data.inStock = Number(data.inStock);

//   const wasEdit = editingId !== null && editingId !== undefined;
//   const btn = $("#form-save");
//   const label = btn.textContent;
//   $("#form-error").textContent = "";
//   btn.disabled = true;
//   btn.textContent = "Saving…";
//   try {
//     if (wasEdit) await api("updateItem", session.token, editingId, data);
//     else await api("createItem", session.token, data);
//     itemDialog.close();
//     toast(wasEdit ? "Changes saved" : "Item added");
//     await loadItems();
//   } catch (err) {
//     if (isSessionError(err)) return expired();
//     $("#form-error").textContent = messageOf(err);
//   } finally {
//     btn.disabled = false;
//     btn.textContent = label;
//   }
// });
