const CATEGORY_ICONS = {
  Electronics: ICONS.laptop,
  Books: ICONS.book,
  'Lab Tools': ICONS.flask,
  Clothing: ICONS.shirt,
  Others: ICONS.package,
};

const CATEGORY_BG = {
  Electronics: 'rgba(122,171,138,0.18)',
  Books: 'rgba(212,184,150,0.28)',
  'Lab Tools': 'rgba(122,171,215,0.18)',
  Clothing: 'rgba(210,160,60,0.14)',
  Others: 'rgba(158,144,132,0.18)',
};

let cartItems = [];

function renderCart() {
  const cartList = document.getElementById('cart-list');

  if (!cartItems || !cartItems.length) {
    cartList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-svg">${ICONS.cart}</div>
        <p>Your cart is empty.</p>
      </div>`;
    return;
  }

  cartList.innerHTML = cartItems.map(item => `
    <div class="cart-row" id="cart-row-${item.id}">
      <div class="cart-thumb" style="background:${CATEGORY_BG[item.category] || CATEGORY_BG.Others}">
        ${CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Others}
      </div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-meta">${item.category}${item.seller ? ' · ' + item.seller : ''}</p>
      </div>
      <p class="cart-item-price">₱${item.price.toLocaleString()}</p>
      <div class="cart-item-actions">
        <button class="btn-claim-item" onclick="claimItem('${item.id}')">Claim</button>
        <button class="btn-cancel-item" onclick="cancelItem('${item.id}')">Cancel</button>
      </div>
    </div>
  `).join('');
}

function claimItem(id) {
  const item = cartItems.find(i => String(i.id) === String(id));
  if (!item) return;
  showToast('Claimed!', `"${item.name}" reserved. Coordinate with the seller to arrange pickup.`, 'success', 4000);
  cartItems = cartItems.filter(i => String(i.id) !== String(id));
  renderCart();
}

function cancelItem(id) {
  const item = cartItems.find(i => String(i.id) === String(id));
  if (!item) return;
  showToast('Cancelled', `"${item.name}" has been cancelled and removed from your cart.`, 'warning');
  cartItems = cartItems.filter(i => String(i.id) !== String(id));
  renderCart();
}

document.addEventListener('DOMContentLoaded', function () {
  fetch('../data/mock-claimed.json')
    .then(r => r.json())
    .then(items => {
      cartItems = items.slice(0, 4).map(item => ({
        id: item.id,
        name: item.name,
        price: parseInt(item.price.replace('₱', '')),
        category: item.category,
        seller: item.seller || null,
      }));
      renderCart();
    })
    .catch(() => {
      document.getElementById('cart-list').innerHTML =
        `<p class="error-text">Could not load cart.</p>`;
    });
});
