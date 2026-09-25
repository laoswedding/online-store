  // Paste your Apps Script web app address here (the one ending in /exec).
  const SCRIPT_URL = `${APPS_SCRIPT_API_URL}`;

  const CURRENCY = 'LAK'; // change to your currency code, e.g. 'USD', 'EUR', 'THB'

  // Relative paths in the imgSrc / learnMore columns are resolved against these.
  // IMAGE_BASE_URL matches the one used in your order emails. Set LINK_BASE_URL to your store's address.
  const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/laoswedding/online-store/main/';
  const LINK_BASE_URL = ''; // e.g. 'https://your-store.example/'

    const STRINGS = {
    en: {
      "app.title": "Store admin",
      "login.lede": "Sign in with the email and password you were given.",
      "login.email": "Email",
      "login.password": "Password",
      "login.show": "Show password",
      "login.submit": "Sign in",
      "login.signingIn": "Signing in…",
      "login.expired": "Your session expired. Sign in again.",
      "btn.tryAgain": "Try again",
      "btn.goBack": "Go back",
      "btn.cancel": "Cancel",
      "btn.working": "Working…",
      "btn.saving": "Saving…",
      "hdr.changePassword": "Change password",
      "hdr.signOut": "Sign out",
      "hdr.refresh": "Refresh",
      "role.viewer": "Viewer",
      "role.editor": "Editor",
      "role.admin": "Admin",
      "nav.aria": "Sections",
      "nav.overview": "Overview",
      "nav.inventory": "Inventory",
      "nav.shipping": "Shipping",
      "nav.orders": "Orders",
      "nav.sales": "Sales",
      "inv.search.placeholder": "Search name, category or description",
      "inv.search.aria": "Search items",
      "inv.category.aria": "Category",
      "inv.allCategories": "All categories",
      "inv.stock.aria": "Stock",
      "inv.stock.all": "All stock",
      "stock.in": "In stock",
      "stock.out": "Out of stock",
      "inv.sort.aria": "Sort by",
      "sort.name": "Name A–Z",
      "sort.priceAsc": "Price: low to high",
      "sort.priceDesc": "Price: high to low",
      "sort.updated": "Recently updated",
      "inv.add": "Add item",
      "inv.loading": "Loading items…",
      "inv.count_one": "{n} item",
      "inv.count_other": "{n} items",
      "inv.countOf": "{a} of {b} items",
      "inv.emptyTitle": "No items yet",
      "inv.emptyEditor": "Add your first item to start the inventory.",
      "inv.emptyViewer": "Nothing has been added to the inventory yet.",
      "inv.noMatchTitle": "No items match",
      "inv.noMatchBody": "Try a different search or clear the filters.",
      "inv.clear": "Clear filters",
      "inv.loadFail": "Items didn’t load",
      "tile.inStock": "{n} in stock",
      "tile.edit": "Edit",
      "tile.delete": "Delete",
      "tile.learn": "Learn more",
      "tile.editAria": "Edit {name}",
      "tile.deleteAria": "Delete {name}",
      "tile.learnAria": "Learn more about {name}",
      "form.addTitle": "Add item",
      "form.editTitle": "Edit item",
      "form.save": "Save changes",
      "form.name": "Name",
      "form.price": "Price",
      "form.stock": "Stock",
      "form.category": "Category",
      "form.description": "Description",
      "form.image": "Image link or path",
      "form.learn": "Learn more link or path",
      "form.previewAlt": "Preview of the image link",
      "form.previewBad": "This image couldn’t load. Check the link.",
      "form.updatedBy": "Last updated by {who}",
      "form.updatedByOn": "Last updated by {who} on {when}",
      "form.errName": "Enter a name.",
      "form.errPrice": "Enter a price of 0 or more.",
      "form.errStock": "Enter a stock quantity of 0 or more, using whole numbers.",
      "form.errLinks": "Links must start with http:// or https://, or be a path like images/photo.jpg.",
      "toast.added": "Item added",
      "toast.saved": "Changes saved",
      "del.title": "Delete “{name}”?",
      "del.body": "This removes it from the sheet for everyone and can’t be undone.",
      "del.keep": "Keep item",
      "del.confirm": "Delete item",
      "del.working": "Deleting…",
      "toast.deleted": "Item deleted",
      "pw.title": "Change password",
      "pw.current": "Current password",
      "pw.new": "New password",
      "pw.confirm": "Confirm new password",
      "pw.show": "Show passwords",
      "pw.hint": "Use at least 10 characters. If you’re signed in on other devices, you’ll need to sign in again there.",
      "pw.errCurrent": "Enter your current password.",
      "pw.errShort": "Use at least {n} characters for the new password.",
      "pw.errMatch": "The new passwords don’t match.",
      "pw.errSame": "The new password must be different from the current one.",
      "toast.pwChanged": "Password changed",
      "ov.waiting": "Waiting to ship",
      "ov.oldest": "Oldest is from {date}",
      "ov.caughtUp": "All caught up",
      "ov.revenue30": "Revenue, last 30 days",
      "ov.shipped_one": "{n} order shipped",
      "ov.shipped_other": "{n} orders shipped",
      "ov.low": "Running low",
      "ov.outCount": "{n} out of stock",
      "ov.openShipping": "Open shipping",
      "ov.openInventory": "Open inventory",
      "ov.nothingWaiting": "Nothing is waiting to ship.",
      "ov.allStocked": "Every item has more than {n} in stock.",
      "ov.left": "{n} left",
      "ord.loadFail": "Orders didn’t load",
      "ord.search.placeholder": "Search order number, name or phone",
      "ord.search.aria": "Search orders",
      "ord.status.aria": "Status",
      "ord.status.all": "All statuses",
      "status.pending": "Pending",
      "status.shipped": "Shipped",
      "status.cancelled": "Cancelled",
      "ord.th.order": "Order",
      "ord.th.date": "Date",
      "ord.th.customer": "Customer",
      "ord.th.destination": "Destination",
      "ord.th.total": "Total",
      "ord.th.status": "Status",
      "ord.th.actions": "Actions",
      "ord.details": "Details",
      "ord.hide": "Hide",
      "ord.showAria": "Show details for order {id}",
      "ord.hideAria": "Hide details for order {id}",
      "ord.emptyTitle": "No orders yet",
      "ord.emptyBody": "Orders placed on your store will appear here.",
      "ord.noMatchTitle": "No orders match",
      "ord.noMatchBody": "Try a different search or status.",
      "ord.count_one": "{n} order",
      "ord.count_other": "{n} orders",
      "ord.countOf": "{a} of {b} orders",
      "det.customer": "Customer",
      "det.unnamed": "Unnamed customer",
      "det.shipVia": "Ship via {via}",
      "det.branch": "{name} branch",
      "det.photo": "View photo",
      "det.items": "Items",
      "det.noItems": "No item details were saved.",
      "det.stockUnknown": "Stock couldn’t be checked.",
      "det.stockOk": "Stock is enough for every item.",
      "det.stockShort": "Not enough stock: {list}.",
      "det.needs": "{name} needs {units}, has {have}",
      "det.missingItem": "item {id} isn’t in the inventory",
      "act.ship": "Ship order",
      "act.cancel": "Cancel order",
      "act.shipAria": "Ship order {id}",
      "act.cancelAria": "Cancel order {id}",
      "ship.title": "Ship order #{id}?",
      "ship.body": "This takes the ordered units out of inventory and marks the order as shipped. It can’t be undone.",
      "ship.bodyShort": "Not enough stock: {list}. Shipping will take stock below zero. It can’t be undone.",
      "toast.shipped": "Order shipped",
      "toast.notFound": "Not found in inventory: {ids}",
      "cancel.title": "Cancel order #{id}?",
      "cancel.body": "The order is marked as cancelled. Stock doesn’t change, because units only leave inventory when an order ships.",
      "cancel.keep": "Keep order",
      "toast.cancelled": "Order cancelled",
      "shp.nothingTitle": "Nothing to ship",
      "shp.nothingBody": "Every order is either shipped or cancelled.",
      "shp.waiting_one": "{n} order waiting",
      "shp.waiting_other": "{n} orders waiting",
      "shp.noCompany": "No shipping company",
      "shp.orderNo": "Order #{id}",
      "sal.period.aria": "Period",
      "sal.r7": "Last 7 days",
      "sal.r30": "Last 30 days",
      "sal.r90": "Last 90 days",
      "sal.all": "All time",
      "sal.revenue": "Revenue",
      "sal.shipped_one": "{n} shipped order",
      "sal.shipped_other": "{n} shipped orders",
      "sal.avg": "Average order",
      "sal.shippedOnly": "Shipped orders only",
      "sal.units": "Units sold",
      "sal.orders_one": "{n} order",
      "sal.orders_other": "{n} orders",
      "sal.cancelled": "Cancelled",
      "sal.notCollected": "{amount} not collected",
      "sal.ariaDay": "Revenue by day. Best day was {label} with {amount}.",
      "sal.ariaMonth": "Revenue by month. Best month was {label} with {amount}.",
      "sal.bestDay": "Best day: {label}, {amount}",
      "sal.bestMonth": "Best month: {label}, {amount}",
      "sal.bestSellers": "Best sellers",
      "sal.noShipped": "No shipped orders in this period.",
      "sal.unit_one": "{n} unit",
      "sal.unit_other": "{n} units",
      "sal.item": "Item {id}",
      "sal.note": "Sales are counted when an order ships. Days shown are the day each order was placed, because the sheet doesn’t record ship dates.",
      "err.scriptUrl": "Set SCRIPT_URL at the top of the script to your web app address.",
      "err.network": "Couldn’t reach the server. Check your connection and try again.",
      "err.unreadable": "The server sent an unexpected reply",
      "err.generic": "Something went wrong. Try again.",
      "srv.badLogin": "Invalid email or password.",
      "srv.tooMany": "Too many failed attempts. Try again in a few minutes.",
      "srv.forbidden": "You do not have permission to do that.",
      "srv.noRole": "Your account has no valid role. Ask the person who manages access.",
      "srv.wrongCurrent": "Your current password is incorrect.",
      "srv.pwLong": "The new password is too long.",
      "srv.itemNotFound": "Item not found (it may have been deleted).",
      "srv.orderShipped": "Order already shipped",
      "srv.cannotCancel": "Cannot cancel — order already shipped",
      "srv.orderCancelled": "Order already cancelled",
      "srv.orderNotFound": "Order not found: {id}"
    },
    lo: {
      "app.title": "ລະບົບຈັດການຮ້ານ",
      "login.lede": "ເຂົ້າສູ່ລະບົບດ້ວຍອີເມວ ແລະ ລະຫັດຜ່ານທີ່ທ່ານໄດ້ຮັບ.",
      "login.email": "ອີເມວ",
      "login.password": "ລະຫັດຜ່ານ",
      "login.show": "ສະແດງລະຫັດຜ່ານ",
      "login.submit": "ເຂົ້າສູ່ລະບົບ",
      "login.signingIn": "ກຳລັງເຂົ້າສູ່ລະບົບ…",
      "login.expired": "ເຊດຊັນຂອງທ່ານໝົດອາຍຸ. ກະລຸນາເຂົ້າສູ່ລະບົບອີກຄັ້ງ.",
      "btn.tryAgain": "ລອງອີກຄັ້ງ",
      "btn.goBack": "ກັບຄືນ",
      "btn.cancel": "ຍົກເລີກ",
      "btn.working": "ກຳລັງດຳເນີນການ…",
      "btn.saving": "ກຳລັງບັນທຶກ…",
      "hdr.changePassword": "ປ່ຽນລະຫັດຜ່ານ",
      "hdr.signOut": "ອອກຈາກລະບົບ",
      "hdr.refresh": "ໂຫຼດໃໝ່",
      "role.viewer": "ຜູ້ເບິ່ງ",
      "role.editor": "ຜູ້ແກ້ໄຂ",
      "role.admin": "ຜູ້ດູແລລະບົບ",
      "nav.aria": "ສ່ວນຕ່າງໆ",
      "nav.overview": "ພາບລວມ",
      "nav.inventory": "ສິນຄ້າຄົງຄັງ",
      "nav.shipping": "ການຈັດສົ່ງ",
      "nav.orders": "ຄຳສັ່ງຊື້",
      "nav.sales": "ຍອດຂາຍ",
      "inv.search.placeholder": "ຄົ້ນຫາຕາມຊື່, ໝວດໝູ່ ຫຼື ລາຍລະອຽດ",
      "inv.search.aria": "ຄົ້ນຫາສິນຄ້າ",
      "inv.category.aria": "ໝວດໝູ່",
      "inv.allCategories": "ທຸກໝວດໝູ່",
      "inv.stock.aria": "ສະຕັອກ",
      "inv.stock.all": "ສະຕັອກທັງໝົດ",
      "stock.in": "ມີໃນສະຕັອກ",
      "stock.out": "ສິນຄ້າໝົດ",
      "inv.sort.aria": "ຮຽງຕາມ",
      "sort.name": "ຊື່ (ກ–ຮ)",
      "sort.priceAsc": "ລາຄາ: ຕ່ຳໄປສູງ",
      "sort.priceDesc": "ລາຄາ: ສູງໄປຕ່ຳ",
      "sort.updated": "ອັບເດດຫຼ້າສຸດ",
      "inv.add": "ເພີ່ມສິນຄ້າ",
      "inv.loading": "ກຳລັງໂຫຼດສິນຄ້າ…",
      "inv.count_one": "{n} ລາຍການ",
      "inv.count_other": "{n} ລາຍການ",
      "inv.countOf": "{a} ຈາກ {b} ລາຍການ",
      "inv.emptyTitle": "ຍັງບໍ່ມີສິນຄ້າ",
      "inv.emptyEditor": "ເພີ່ມສິນຄ້າລາຍການທຳອິດເພື່ອເລີ່ມຕົ້ນ.",
      "inv.emptyViewer": "ຍັງບໍ່ໄດ້ເພີ່ມສິນຄ້າເຂົ້າສາງເທື່ອ.",
      "inv.noMatchTitle": "ບໍ່ພົບສິນຄ້າທີ່ກົງກັນ",
      "inv.noMatchBody": "ລອງຄົ້ນຫາແບບອື່ນ ຫຼື ລ້າງຕົວກອງ.",
      "inv.clear": "ລ້າງຕົວກອງ",
      "inv.loadFail": "ໂຫຼດສິນຄ້າບໍ່ໄດ້",
      "tile.inStock": "ມີ {n} ໃນສະຕັອກ",
      "tile.edit": "ແກ້ໄຂ",
      "tile.delete": "ລຶບ",
      "tile.learn": "ເບິ່ງເພີ່ມເຕີມ",
      "tile.editAria": "ແກ້ໄຂ {name}",
      "tile.deleteAria": "ລຶບ {name}",
      "tile.learnAria": "ເບິ່ງເພີ່ມເຕີມກ່ຽວກັບ {name}",
      "form.addTitle": "ເພີ່ມສິນຄ້າ",
      "form.editTitle": "ແກ້ໄຂສິນຄ້າ",
      "form.save": "ບັນທຶກການປ່ຽນແປງ",
      "form.name": "ຊື່",
      "form.price": "ລາຄາ",
      "form.stock": "ສະຕັອກ",
      "form.category": "ໝວດໝູ່",
      "form.description": "ລາຍລະອຽດ",
      "form.image": "ລິ້ງ ຫຼື ທີ່ຢູ່ຮູບພາບ",
      "form.learn": "ລິ້ງ ຫຼື ທີ່ຢູ່ໜ້າລາຍລະອຽດ",
      "form.previewAlt": "ຕົວຢ່າງຮູບພາບ",
      "form.previewBad": "ໂຫຼດຮູບພາບນີ້ບໍ່ໄດ້. ກະລຸນາກວດລິ້ງ.",
      "form.updatedBy": "ອັບເດດຫຼ້າສຸດໂດຍ {who}",
      "form.updatedByOn": "ອັບເດດຫຼ້າສຸດໂດຍ {who} ເມື່ອ {when}",
      "form.errName": "ກະລຸນາໃສ່ຊື່.",
      "form.errPrice": "ກະລຸນາໃສ່ລາຄາ 0 ຫຼື ຫຼາຍກວ່ານັ້ນ.",
      "form.errStock": "ກະລຸນາໃສ່ຈຳນວນສະຕັອກ 0 ຫຼື ຫຼາຍກວ່ານັ້ນ ເປັນຕົວເລກເຕັມ.",
      "form.errLinks": "ລິ້ງຕ້ອງເລີ່ມດ້ວຍ http:// ຫຼື https:// ຫຼື ເປັນທີ່ຢູ່ເຊັ່ນ images/photo.jpg.",
      "toast.added": "ເພີ່ມສິນຄ້າແລ້ວ",
      "toast.saved": "ບັນທຶກການປ່ຽນແປງແລ້ວ",
      "del.title": "ລຶບ “{name}” ບໍ?",
      "del.body": "ສິນຄ້ານີ້ຈະຖືກລຶບອອກຈາກຊີດສຳລັບທຸກຄົນ ແລະ ບໍ່ສາມາດຍ້ອນກັບໄດ້.",
      "del.keep": "ເກັບສິນຄ້າໄວ້",
      "del.confirm": "ລຶບສິນຄ້າ",
      "del.working": "ກຳລັງລຶບ…",
      "toast.deleted": "ລຶບສິນຄ້າແລ້ວ",
      "pw.title": "ປ່ຽນລະຫັດຜ່ານ",
      "pw.current": "ລະຫັດຜ່ານປັດຈຸບັນ",
      "pw.new": "ລະຫັດຜ່ານໃໝ່",
      "pw.confirm": "ຢືນຢັນລະຫັດຜ່ານໃໝ່",
      "pw.show": "ສະແດງລະຫັດຜ່ານ",
      "pw.hint": "ໃຊ້ຢ່າງໜ້ອຍ 10 ຕົວອັກສອນ. ຖ້າທ່ານເຂົ້າສູ່ລະບົບຢູ່ອຸປະກອນອື່ນ ທ່ານຈະຕ້ອງເຂົ້າສູ່ລະບົບຢູ່ບ່ອນນັ້ນອີກຄັ້ງ.",
      "pw.errCurrent": "ກະລຸນາໃສ່ລະຫັດຜ່ານປັດຈຸບັນ.",
      "pw.errShort": "ໃຊ້ຢ່າງໜ້ອຍ {n} ຕົວອັກສອນສຳລັບລະຫັດຜ່ານໃໝ່.",
      "pw.errMatch": "ລະຫັດຜ່ານໃໝ່ບໍ່ກົງກັນ.",
      "pw.errSame": "ລະຫັດຜ່ານໃໝ່ຕ້ອງແຕກຕ່າງຈາກລະຫັດຜ່ານປັດຈຸບັນ.",
      "toast.pwChanged": "ປ່ຽນລະຫັດຜ່ານແລ້ວ",
      "ov.waiting": "ລໍຖ້າຈັດສົ່ງ",
      "ov.oldest": "ເກົ່າສຸດແມ່ນຈາກ {date}",
      "ov.caughtUp": "ບໍ່ມີຄ້າງ",
      "ov.revenue30": "ລາຍຮັບ 30 ວັນຜ່ານມາ",
      "ov.shipped_one": "ຈັດສົ່ງແລ້ວ {n} ຄຳສັ່ງຊື້",
      "ov.shipped_other": "ຈັດສົ່ງແລ້ວ {n} ຄຳສັ່ງຊື້",
      "ov.low": "ສິນຄ້າໃກ້ໝົດ",
      "ov.outCount": "ໝົດສະຕັອກ {n} ລາຍການ",
      "ov.openShipping": "ເປີດການຈັດສົ່ງ",
      "ov.openInventory": "ເປີດສິນຄ້າຄົງຄັງ",
      "ov.nothingWaiting": "ບໍ່ມີຄຳສັ່ງຊື້ລໍຖ້າຈັດສົ່ງ.",
      "ov.allStocked": "ສິນຄ້າທຸກລາຍການມີຫຼາຍກວ່າ {n} ໃນສະຕັອກ.",
      "ov.left": "ເຫຼືອ {n}",
      "ord.loadFail": "ໂຫຼດຄຳສັ່ງຊື້ບໍ່ໄດ້",
      "ord.search.placeholder": "ຄົ້ນຫາເລກຄຳສັ່ງຊື້, ຊື່ ຫຼື ເບີໂທ",
      "ord.search.aria": "ຄົ້ນຫາຄຳສັ່ງຊື້",
      "ord.status.aria": "ສະຖານະ",
      "ord.status.all": "ທຸກສະຖານະ",
      "status.pending": "ລໍຖ້າ",
      "status.shipped": "ຈັດສົ່ງແລ້ວ",
      "status.cancelled": "ຍົກເລີກແລ້ວ",
      "ord.th.order": "ຄຳສັ່ງຊື້",
      "ord.th.date": "ວັນທີ",
      "ord.th.customer": "ລູກຄ້າ",
      "ord.th.destination": "ປາຍທາງ",
      "ord.th.total": "ລວມ",
      "ord.th.status": "ສະຖານະ",
      "ord.th.actions": "ການດຳເນີນການ",
      "ord.details": "ລາຍລະອຽດ",
      "ord.hide": "ເຊື່ອງ",
      "ord.showAria": "ສະແດງລາຍລະອຽດຂອງຄຳສັ່ງຊື້ {id}",
      "ord.hideAria": "ເຊື່ອງລາຍລະອຽດຂອງຄຳສັ່ງຊື້ {id}",
      "ord.emptyTitle": "ຍັງບໍ່ມີຄຳສັ່ງຊື້",
      "ord.emptyBody": "ຄຳສັ່ງຊື້ຈາກຮ້ານຂອງທ່ານຈະສະແດງຢູ່ບ່ອນນີ້.",
      "ord.noMatchTitle": "ບໍ່ພົບຄຳສັ່ງຊື້ທີ່ກົງກັນ",
      "ord.noMatchBody": "ລອງຄົ້ນຫາ ຫຼື ເລືອກສະຖານະອື່ນ.",
      "ord.count_one": "{n} ຄຳສັ່ງຊື້",
      "ord.count_other": "{n} ຄຳສັ່ງຊື້",
      "ord.countOf": "{a} ຈາກ {b} ຄຳສັ່ງຊື້",
      "det.customer": "ລູກຄ້າ",
      "det.unnamed": "ລູກຄ້າບໍ່ລະບຸຊື່",
      "det.shipVia": "ຈັດສົ່ງຜ່ານ {via}",
      "det.branch": "ສາຂາ {name}",
      "det.photo": "ເບິ່ງຮູບ",
      "det.items": "ລາຍການສິນຄ້າ",
      "det.noItems": "ບໍ່ໄດ້ບັນທຶກລາຍລະອຽດສິນຄ້າ.",
      "det.stockUnknown": "ບໍ່ສາມາດກວດສະຕັອກໄດ້.",
      "det.stockOk": "ສະຕັອກພຽງພໍສຳລັບທຸກລາຍການ.",
      "det.stockShort": "ສະຕັອກບໍ່ພໍ: {list}.",
      "det.needs": "{name} ຕ້ອງການ {units}, ມີ {have}",
      "det.missingItem": "ບໍ່ພົບສິນຄ້າ {id} ໃນສາງ",
      "act.ship": "ຈັດສົ່ງຄຳສັ່ງຊື້",
      "act.cancel": "ຍົກເລີກຄຳສັ່ງຊື້",
      "act.shipAria": "ຈັດສົ່ງຄຳສັ່ງຊື້ {id}",
      "act.cancelAria": "ຍົກເລີກຄຳສັ່ງຊື້ {id}",
      "ship.title": "ຈັດສົ່ງຄຳສັ່ງຊື້ #{id} ບໍ?",
      "ship.body": "ຈະຫັກຈຳນວນສິນຄ້າທີ່ສັ່ງອອກຈາກສະຕັອກ ແລະ ໝາຍຄຳສັ່ງຊື້ວ່າຈັດສົ່ງແລ້ວ. ບໍ່ສາມາດຍ້ອນກັບໄດ້.",
      "ship.bodyShort": "ສະຕັອກບໍ່ພໍ: {list}. ການຈັດສົ່ງຈະເຮັດໃຫ້ສະຕັອກຕ່ຳກວ່າສູນ. ບໍ່ສາມາດຍ້ອນກັບໄດ້.",
      "toast.shipped": "ຈັດສົ່ງຄຳສັ່ງຊື້ແລ້ວ",
      "toast.notFound": "ບໍ່ພົບໃນສາງ: {ids}",
      "cancel.title": "ຍົກເລີກຄຳສັ່ງຊື້ #{id} ບໍ?",
      "cancel.body": "ຄຳສັ່ງຊື້ຈະຖືກໝາຍວ່າຍົກເລີກ. ສະຕັອກບໍ່ປ່ຽນແປງ ເພາະສິນຄ້າຈະຖືກຫັກອອກເມື່ອຈັດສົ່ງເທົ່ານັ້ນ.",
      "cancel.keep": "ເກັບຄຳສັ່ງຊື້ໄວ້",
      "toast.cancelled": "ຍົກເລີກຄຳສັ່ງຊື້ແລ້ວ",
      "shp.nothingTitle": "ບໍ່ມີສິ່ງທີ່ຕ້ອງຈັດສົ່ງ",
      "shp.nothingBody": "ທຸກຄຳສັ່ງຊື້ຖືກຈັດສົ່ງ ຫຼື ຍົກເລີກແລ້ວ.",
      "shp.waiting_one": "ລໍຖ້າຈັດສົ່ງ {n} ຄຳສັ່ງຊື້",
      "shp.waiting_other": "ລໍຖ້າຈັດສົ່ງ {n} ຄຳສັ່ງຊື້",
      "shp.noCompany": "ບໍ່ມີບໍລິສັດຂົນສົ່ງ",
      "shp.orderNo": "ຄຳສັ່ງຊື້ #{id}",
      "sal.period.aria": "ໄລຍະເວລາ",
      "sal.r7": "7 ວັນຜ່ານມາ",
      "sal.r30": "30 ວັນຜ່ານມາ",
      "sal.r90": "90 ວັນຜ່ານມາ",
      "sal.all": "ທຸກໄລຍະ",
      "sal.revenue": "ລາຍຮັບ",
      "sal.shipped_one": "ຈັດສົ່ງແລ້ວ {n} ຄຳສັ່ງຊື້",
      "sal.shipped_other": "ຈັດສົ່ງແລ້ວ {n} ຄຳສັ່ງຊື້",
      "sal.avg": "ຄ່າສະເລ່ຍຕໍ່ຄຳສັ່ງຊື້",
      "sal.shippedOnly": "ສະເພາະຄຳສັ່ງຊື້ທີ່ຈັດສົ່ງແລ້ວ",
      "sal.units": "ຈຳນວນທີ່ຂາຍໄດ້",
      "sal.orders_one": "{n} ຄຳສັ່ງຊື້",
      "sal.orders_other": "{n} ຄຳສັ່ງຊື້",
      "sal.cancelled": "ຍົກເລີກແລ້ວ",
      "sal.notCollected": "{amount} ບໍ່ໄດ້ຮັບເງິນ",
      "sal.ariaDay": "ລາຍຮັບແຍກຕາມວັນ. ວັນທີ່ດີທີ່ສຸດແມ່ນ {label} ເຊິ່ງໄດ້ {amount}.",
      "sal.ariaMonth": "ລາຍຮັບແຍກຕາມເດືອນ. ເດືອນທີ່ດີທີ່ສຸດແມ່ນ {label} ເຊິ່ງໄດ້ {amount}.",
      "sal.bestDay": "ວັນທີ່ດີທີ່ສຸດ: {label}, {amount}",
      "sal.bestMonth": "ເດືອນທີ່ດີທີ່ສຸດ: {label}, {amount}",
      "sal.bestSellers": "ສິນຄ້າຂາຍດີ",
      "sal.noShipped": "ບໍ່ມີຄຳສັ່ງຊື້ທີ່ຈັດສົ່ງແລ້ວໃນໄລຍະນີ້.",
      "sal.unit_one": "{n} ຊິ້ນ",
      "sal.unit_other": "{n} ຊິ້ນ",
      "sal.item": "ສິນຄ້າ {id}",
      "sal.note": "ຍອດຂາຍນັບເມື່ອຄຳສັ່ງຊື້ຖືກຈັດສົ່ງ. ວັນທີ່ສະແດງແມ່ນວັນທີ່ສັ່ງຊື້ ເພາະຊີດບໍ່ໄດ້ບັນທຶກວັນຈັດສົ່ງ.",
      "err.scriptUrl": "ຕັ້ງຄ່າ SCRIPT_URL ຢູ່ເທິງສຸດຂອງສະຄຣິບໃຫ້ເປັນທີ່ຢູ່ເວັບແອັບຂອງທ່ານ.",
      "err.network": "ບໍ່ສາມາດເຊື່ອມຕໍ່ເຊີບເວີໄດ້. ກະລຸນາກວດອິນເຕີເນັດ ແລ້ວລອງໃໝ່.",
      "err.unreadable": "ເຊີບເວີຕອບກັບຜິດປົກກະຕິ",
      "err.generic": "ມີບາງຢ່າງຜິດພາດ. ກະລຸນາລອງໃໝ່.",
      "srv.badLogin": "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ.",
      "srv.tooMany": "ລອງຜິດຫຼາຍເທື່ອເກີນໄປ. ກະລຸນາລອງໃໝ່ໃນອີກສອງສາມນາທີ.",
      "srv.forbidden": "ທ່ານບໍ່ມີສິດເຮັດສິ່ງນີ້.",
      "srv.noRole": "ບັນຊີຂອງທ່ານບໍ່ມີບົດບາດທີ່ຖືກຕ້ອງ. ກະລຸນາຕິດຕໍ່ຜູ້ຈັດການສິດການເຂົ້າເຖິງ.",
      "srv.wrongCurrent": "ລະຫັດຜ່ານປັດຈຸບັນຂອງທ່ານບໍ່ຖືກຕ້ອງ.",
      "srv.pwLong": "ລະຫັດຜ່ານໃໝ່ຍາວເກີນໄປ.",
      "srv.itemNotFound": "ບໍ່ພົບສິນຄ້ານີ້ (ອາດຖືກລຶບໄປແລ້ວ).",
      "srv.orderShipped": "ຄຳສັ່ງຊື້ນີ້ຖືກຈັດສົ່ງແລ້ວ",
      "srv.cannotCancel": "ບໍ່ສາມາດຍົກເລີກໄດ້ — ຄຳສັ່ງຊື້ຖືກຈັດສົ່ງແລ້ວ",
      "srv.orderCancelled": "ຄຳສັ່ງຊື້ນີ້ຖືກຍົກເລີກແລ້ວ",
      "srv.orderNotFound": "ບໍ່ພົບຄຳສັ່ງຊື້: {id}"
    },
  };

  // Language: remembered in this browser, otherwise the browser's language, otherwise English.
  let lang = (() => {
    try { const saved = localStorage.getItem('admin-lang'); if (saved === 'en' || saved === 'lo') return saved; } catch (e) { /* storage can be blocked */ }
    return /^lo\b/i.test(navigator.language || '') ? 'lo' : 'en';
  })();
  const locale = () => (lang === 'lo' ? 'lo-LA' : undefined);

  // Looks a string up in the current language, falling back to English. {n} picks the singular
  // (key_one) or plural (key_other) form when the key has them.
  function t(key, vars) {
    const forms = vars && typeof vars.n === 'number'
      ? [key + (vars.n === 1 ? '_one' : '_other'), key + '_other', key]
      : [key];
    let str;
    for (const dict of [STRINGS[lang], STRINGS.en]) {
      for (const k of forms) { if (dict[k] !== undefined) { str = dict[k]; break; } }
      if (str !== undefined) break;
    }
    if (str === undefined) return key;
    return vars ? str.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? vars[name] : m)) : str;
  }

  function applyStaticText() {
    document.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((n) => { n.placeholder = t(n.dataset.i18nPlaceholder); });
    document.querySelectorAll('[data-i18n-aria]').forEach((n) => { n.setAttribute('aria-label', t(n.dataset.i18nAria)); });
  }

  function applyLanguage() {
    document.documentElement.lang = lang;
    document.title = t('app.title');
    applyStaticText();
    document.querySelectorAll('.lang-switch button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    if (session) {
      $('#role').textContent = t('role.' + session.role);
      populateCategories();
      renderNav();
      renderCurrent();
    }
  }

  function setLang(next) {
    if (next !== 'en' && next !== 'lo') return;
    lang = next;
    try { localStorage.setItem('admin-lang', lang); } catch (e) { /* not fatal */ }
    applyLanguage();
  }
  
  let session = null;   // { token, email, role } kept in memory only
  let items = [];
  let editingId = null;
  let deleteTarget = null;
  let orders = [];        // all rows from the Orders sheet (editors and admins only)
  let ordersError = '';
  let currentView = 'inventory';

  const $ = (s) => document.querySelector(s);
  const ROLE_LABEL = { viewer: 'Viewer', editor: 'Editor', admin: 'Admin' };
  const canEdit = () => !!session && (session.role === 'editor' || session.role === 'admin');
  const canDelete = () => !!session && session.role === 'admin';
  const stockQty = (v) => {
    const n = Number(v);
    return v !== '' && v != null && isFinite(n) ? n : 0;
  };
  const hasOtherScheme = (u) => /^[a-z][a-z0-9+.\-]*:/i.test(u) && !/^https?:\/\//i.test(u);

  // Turns a sheet value into a safe http(s) URL, or '' if it can't be used.
  function resolveUrl(u, base) {
    const s = String(u == null ? '' : u).trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    if (hasOtherScheme(s) || !base) return '';   // blocks javascript:, data:, etc.
    try { return new URL(s.replace(/^(\.\.?\/)+/, ''), base).href; } catch (e) { return ''; }
  }
  const imgUrl = (u) => resolveUrl(u, IMAGE_BASE_URL);
  const linkUrl = (u) => resolveUrl(u, LINK_BASE_URL);

  /* ---------- helpers ---------- */

  // Builds DOM nodes without innerHTML, so user-entered text can never run as markup.
  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
        else if (v !== false && v != null) node.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const c of children) if (c != null) node.append(c);
    return node;
  }

  // Which values each action sends to the server, in order.
  // const PARAMS = {
  //   login: ['email', 'password'],
  //   logout: ['token'],
  //   listItems: ['token'],
  //   createItem: ['token', 'item'],
  //   updateItem: ['token', 'id', 'changes'],
  //   deleteItem: ['token', 'id'],
  //   changePassword: ['token', 'currentPassword', 'newPassword'],
  //   listOrders: ['token'],
  //   shipOrder: ['token', 'orderId'],
  //   cancelOrder: ['orderId'],
  // };

  // async function api(action, ...args) {
  //   if (!SCRIPT_URL || SCRIPT_URL.startsWith('PASTE_')) {
  //     throw new Error('Set SCRIPT_URL at the top of the script to your web app address.');
  //   }
  //   const body = { action };
  //   (PARAMS[action] || []).forEach((key, i) => { body[key] = args[i]; });

  //   let res;
  //   try {
  //     res = await fetch(SCRIPT_URL, {
  //       method: 'POST',
  //       // text/plain avoids a CORS preflight request, which Apps Script can't answer.
  //       headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  //       body: JSON.stringify(body),
  //     });
  //   } catch (e) {
  //     throw new Error('Couldn’t reach the server. Check your connection and try again.');
  //   }

  //   let out;
  //   try {
  //     out = await res.json();
  //   } catch (e) {
  //     throw new Error('The server sent an unexpected reply. Check the script address and that it is deployed for "Anyone".');
  //   }
  //   if (out && out.success === false) {
  //     throw new Error(String(out.error || 'Something went wrong. Try again.'));
  //   }
  //   if (out && out.status === 'error') {
  //     throw new Error(String(out.message || 'Something went wrong. Try again.').replace(/^Error:\s*/i, ''));
  //   }
  //   if (out && out.status === 'success') return out.data;
  //   return out; // older actions such as shipOrder and cancelOrder reply with { success, ... }
  // }

  function messageOf(err) {
    const raw = err && err.message ? String(err.message) : '';
    return raw.replace(/^(Uncaught\s+)?Error:\s*/i, '') || 'Something went wrong. Try again.';
  }
  const isSessionError = (err) => /session expired|jwt expired|invalid jwt|not authenticated/i.test(messageOf(err));
  const expired = () => showLogin('Your session expired. Sign in again.');

  const moneyFmt = {};
  function fmtMoney(n) {
    n = Number(n);
    if (!isFinite(n)) return '';
    const whole = Number.isInteger(n);
    const key = whole ? 'whole' : 'full';
    try {
      moneyFmt[key] = moneyFmt[key] || new Intl.NumberFormat(undefined, Object.assign(
        { style: 'currency', currency: CURRENCY },
        whole ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}
      ));
      return moneyFmt[key].format(n);
    } catch (e) {
      return whole ? String(n) : n.toFixed(2);
    }
  }
  const fmtPrice = (v) => (v === '' || v == null ? '' : fmtMoney(v));

  function fmtDate(iso) {
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }

  let toastTimer;
  function toast(msg, ms) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms || 3000);
  }

  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }