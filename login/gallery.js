let galleryImages = []; // [{ id, url, sortOrder }] for the item currently open in the form
let galleryDeletes = []; // ids queued for deletion on save
// const MAX_ITEM_IMAGES = 5;

function renderGallery() {
  const ul = $('#img-gallery');
  ul.replaceChildren(...galleryImages.map((img, i) =>
    el('li', { class: 'gallery-item' },
      el('img', { src: img.url, alt: '' }),
      el('div', { class: 'gallery-controls' },
        el('button', { type: 'button', disabled: i === 0, onclick: () => moveImage(i, -1), text: '↑' }),
        el('button', { type: 'button', disabled: i === galleryImages.length - 1, onclick: () => moveImage(i, 1), text: '↓' }),
        el('button', { type: 'button', onclick: () => removeImage(i), text: 'Remove' })
      )
    )
  ));
  $('#f-img-file').disabled = galleryImages.length >= MAX_ITEM_IMAGES;
}

function moveImage(i, dir) {
  const j = i + dir;
  [galleryImages[i], galleryImages[j]] = [galleryImages[j], galleryImages[i]];
  renderGallery();
}

function removeImage(i) {
  const [img] = galleryImages.splice(i, 1);
  if (img.id) galleryDeletes.push(img.id); // only queue a delete if it was already saved
  renderGallery();
}

$('#f-img-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file || galleryImages.length >= MAX_ITEM_IMAGES) return;
  const objectUrl = URL.createObjectURL(file);
  galleryImages.push({ id: null, url: objectUrl, file }); // file kept until save uploads it
  renderGallery();
});