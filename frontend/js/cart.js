const CATEGORY_ICONS = {
  Electronics: ICONS.laptop,
  Books: ICONS.book,
  "Lab Tools": ICONS.flask,
  Clothing: ICONS.shirt,
  Others: ICONS.package,
};

const CATEGORY_BG = {
  Electronics: "rgba(122,171,138,0.18)",
  Books: "rgba(212,184,150,0.28)",
  "Lab Tools": "rgba(122,171,215,0.18)",
  Clothing: "rgba(210,160,60,0.14)",
  Others: "rgba(158,144,132,0.18)",
};

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
    .map(
      (item) => `
    <div class="cart-row" id="cart-row-${item.id}">
      <div class="cart-thumb" style="background:${CATEGORY_BG[item.category] || CATEGORY_BG.Others};cursor:pointer;" onclick="viewCartItem(${item.id})">
        ${CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Others}
      </div>
      <div class="cart-item-info" style="cursor:pointer;" onclick="viewCartItem(${item.id})">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-meta">${item.category}${item.seller ? " · " + item.seller : ""}</p>
      </div>
      <p class="cart-item-price">₱${item.price.toLocaleString()}</p>
      <div class="cart-item-actions">
        <button class="btn-claim-item" onclick="claimItem('${item.id}')">Claim</button>
        <button class="btn-cancel-item" onclick="cancelItem('${item.id}')">Cancel</button>
      </div>
    </div>
  `,
    )
    .join("");

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

function claimItem(id) {
  const result = claimCartItem(cartItems, id);
  if (!result.success) return;
  showToast(
    "Claimed!",
    `"${result.itemName}" reserved. Coordinate with the seller to arrange pickup.`,
    "success",
    4000,
  );
  cartItems = result.items;
  if (_cartPage > Math.ceil(cartItems.length / CART_PER_PAGE))
    _cartPage = Math.max(1, _cartPage - 1);
  _renderCartPage();
}

function cancelItem(id) {
  const result = cancelCartItem(cartItems, id);
  if (!result.success) return;
  showToast(
    "Cancelled",
    `"${result.itemName}" has been cancelled and removed from your cart.`,
    "warning",
  );
  cartItems = result.items;
  if (_cartPage > Math.ceil(cartItems.length / CART_PER_PAGE))
    _cartPage = Math.max(1, _cartPage - 1);
  _renderCartPage();
}

document.addEventListener("DOMContentLoaded", function () {
  fetchClaimedItems()
    .then((items) => {
      cartItems = items.slice(0, 8).map((item) => ({
        id: item.id,
        name: item.name,
        price: parseInt(item.price.replace("₱", "")),
        category: item.category,
        seller: item.seller || null,
      }));
      renderCart();
    })
    .catch(() => {
      document.getElementById("cart-list").innerHTML =
        `<p class="error-text">Could not load cart.</p>`;
    });
});
