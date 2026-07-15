const CART_PER_PAGE = 5;
let cartItems = [];
let _cartPage = 1;

function renderCart() {
  _cartPage = 1;
  _renderCartPage();
}

function _renderCartPage() {
  const cartList = document.getElementById("cart-list");
  const pag = document.getElementById("cart-pagination");

  if (!cartItems || !cartItems.length) {
    cartList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-svg">${ICONS.cart}</div>
        <p>Your cart is empty.</p>
      </div>`;
    if (pag) pag.innerHTML = "";
    return;
  }

  const start = (_cartPage - 1) * CART_PER_PAGE;
  const pageItems = cartItems.slice(start, start + CART_PER_PAGE);

  cartList.innerHTML = pageItems
    .map((item) => {
      const qty = Math.min(Math.max(item.quantity || 1, 1), item.maxQuantity || 1);
      return `
    <div class="cart-row" id="cart-row-${item.id}">
      <div class="cart-thumb" style="background:${CATEGORY_BG[item.category] || CATEGORY_BG.Others};cursor:pointer;" onclick="viewCartItem('${item.listing_id}')">
        ${CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Others}
      </div>
      <div class="cart-item-info" style="cursor:pointer;" onclick="viewCartItem('${item.listing_id}')">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-meta">${item.category}${item.seller ? " · " + item.seller : ""}</p>
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
        <label style="font-size:11px;font-weight:600;color:var(--text-muted);white-space:nowrap;">Qty</label>
        <div class="number-spinner-wrap" onclick="event.stopPropagation()">
          <input id="qty-${item.id}" type="number" min="1" max="${item.maxQuantity}" value="${qty}" class="has-spinner"
            style="width:64px;padding:5px 7px;border:1px solid var(--border);border-radius:var(--radius-xs);
            background:var(--bg);color:var(--text);font-size:13px;font-family:inherit;outline:none;text-align:center;"
            oninput="_updateCartItemPrice('${item.id}')">
          <div class="number-spinner">
            <button type="button" class="spinner-btn spinner-up" tabindex="-1" aria-label="Increase quantity">${ICONS.chevronUp}</button>
            <button type="button" class="spinner-btn spinner-down" tabindex="-1" aria-label="Decrease quantity">${ICONS.chevronDown}</button>
          </div>
        </div>
        <span style="font-size:11px;color:var(--text-muted);">/ ${item.maxQuantity}</span>
      </div>
      <p class="cart-item-price" id="price-${item.id}">₱${(item.price * qty).toLocaleString()}</p>
      <div class="cart-item-actions">
        <button class="btn-claim-item" onclick="claimItem('${item.id}', ${item.maxQuantity})">Claim</button>
        <button class="btn-cancel-item" onclick="cancelItem('${item.id}')">Cancel</button>
      </div>
    </div>
  `;
    })
    .join("");

  pageItems.forEach((item) => bindNumberSpinner("qty-" + item.id));

  if (pag) _renderCartPagination(pag);
}

function _renderCartPagination(pag) {
  const totalPages = Math.ceil(cartItems.length / CART_PER_PAGE);
  if (totalPages <= 1) {
    pag.innerHTML = "";
    return;
  }

  let btns = `<button class="pg-btn${_cartPage === 1 ? " pg-disabled" : ""}" onclick="_cartPageTo(${_cartPage - 1})">&#8592;</button>`;
  for (let p = 1; p <= totalPages; p++) {
    btns += `<button class="pg-btn${p === _cartPage ? " pg-active" : ""}" onclick="_cartPageTo(${p})">${p}</button>`;
  }
  btns += `<button class="pg-btn${_cartPage === totalPages ? " pg-disabled" : ""}" onclick="_cartPageTo(${_cartPage + 1})">&#8594;</button>`;
  pag.innerHTML = `<div class="pg-wrap">${btns}</div>`;
}

function _cartPageTo(p) {
  const totalPages = Math.ceil(cartItems.length / CART_PER_PAGE);
  if (p < 1 || p > totalPages) return;
  _cartPage = p;
  _renderCartPage();
  document
    .getElementById("cart-list")
    ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function viewCartItem(id) {
  window.location.href = "itempage.html?id=" + id;
}

const _cartQtySaveTimers = {};

function _updateCartItemPrice(id) {
  const item = cartItems.find((i) => String(i.id) === String(id));
  if (!item) return;
  const qtyInput = document.getElementById("qty-" + id);
  const priceEl = document.getElementById("price-" + id);
  if (!qtyInput || !priceEl) return;
  const quantity = Math.min(
    Math.max(parseInt(qtyInput.value) || 1, 1),
    item.maxQuantity || 1,
  );
  priceEl.textContent = "₱" + (item.price * quantity).toLocaleString();
  item.quantity = quantity;

  clearTimeout(_cartQtySaveTimers[id]);
  _cartQtySaveTimers[id] = setTimeout(() => {
    updateCartQuantityAPI(id, quantity).catch(() => {});
  }, 400);
}

async function claimItem(id, maxQuantity) {
  const item = cartItems.find((i) => String(i.id) === String(id));
  if (!item) return;
  const qtyInput = document.getElementById("qty-" + id);
  const quantity = Math.min(
    Math.max(parseInt(qtyInput?.value) || 1, 1),
    maxQuantity || item.maxQuantity || 1,
  );
  try {
    const { ok, data } = await claimCartItemAPI(id, quantity);
    if (ok) {
      const contactLines = [`Contact: ${item.seller}`];
      if (item.seller_contact) contactLines.push(`<span class="meta-icon">${ICONS.phone}</span> ${item.seller_contact}`);
      if (item.seller_email) contactLines.push(`<span class="meta-icon">${ICONS.mail}</span> ${item.seller_email}`);
      showToast(
        "Bought!",
        `${quantity}× "${item.name}" reserved.<br><span class="meta-icon">${ICONS.pin}</span> ${item.location || "location not set"}<br>${contactLines.join("<br>")}`,
        "success",
        6000,
      );
      cartItems = cartItems.filter((i) => String(i.id) !== String(id));
      clearTimeout(_cartQtySaveTimers[id]);
      if (_cartPage > Math.ceil(cartItems.length / CART_PER_PAGE))
        _cartPage = Math.max(1, _cartPage - 1);
      _renderCartPage();
      bumpCartBadge(-1);
    } else if (data.error === "listing_unavailable") {
      showToast(
        "Unavailable",
        "This item has already been collected by someone else.",
        "warning",
      );
    } else if (data.error === "invalid_quantity") {
      showToast(
        "Not Enough Stock",
        data.max > 0
          ? `Only ${data.max} unit${data.max > 1 ? "s" : ""} left available to buy.`
          : "All units of this item have already been collected.",
        "warning",
      );
    } else {
      showToast("Error", "Could not complete the claim.", "error");
    }
  } catch {
    showToast("Error", "Could not reach the server.", "error");
  }
}

async function cancelItem(id) {
  const item = cartItems.find((i) => String(i.id) === String(id));
  if (!item) return;
  try {
    const { ok } = await removeFromCartAPI(id);
    if (ok) {
      showToast(
        "Cancelled",
        `"${item.name}" has been removed from your cart.`,
        "warning",
      );
      cartItems = cartItems.filter((i) => String(i.id) !== String(id));
      clearTimeout(_cartQtySaveTimers[id]);
      if (_cartPage > Math.ceil(cartItems.length / CART_PER_PAGE))
        _cartPage = Math.max(1, _cartPage - 1);
      _renderCartPage();
      bumpCartBadge(-1);
    } else {
      showToast("Error", "Could not remove item from cart.", "error");
    }
  } catch {
    showToast("Error", "Could not reach the server.", "error");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  fetchClaimedItems()
    .then((items) => {
      cartItems = items;
      renderCart();
    })
    .catch(() => {
      document.getElementById("cart-list").innerHTML =
        `<p class="error-text">Could not load cart.</p>`;
    });
});
