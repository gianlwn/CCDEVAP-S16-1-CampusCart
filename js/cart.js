

const CATEGORY_ICONS = {
  Electronics: ICONS.laptop,
  Books:       ICONS.book,
  'Lab Tools': ICONS.flask,
  Clothing:    ICONS.shirt,
  Others:      ICONS.package,
};

const CATEGORY_BG = {
  Electronics: 'rgba(122,171,138,0.18)',
  Books:       'rgba(212,184,150,0.28)',
  'Lab Tools': 'rgba(122,171,215,0.18)',
  Clothing:    'rgba(210,160,60,0.14)',
  Others:      'rgba(158,144,132,0.18)',
};

let cartItems = [];

function renderCart() {
  const cartList     = document.getElementById('cart-list');
  const cartSummary  = document.getElementById('cart-summary');
  const summaryItems = document.getElementById('summary-items');

  if (!cartItems || !cartItems.length) {
    cartList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-svg">${ICONS.cart}</div>
        <p>Your cart is empty.</p>
      </div>`;
    if (cartSummary) cartSummary.classList.add('hidden');
    return;
  }

  
  cartList.innerHTML = cartItems.map(item => `
    <div class="cart-row">
      <button class="cart-remove" onclick="removeItem('${item.id}')" title="Remove">
        ${ICONS.close}
      </button>
      <div class="cart-thumb" style="background:${CATEGORY_BG[item.category] || CATEGORY_BG.Others}">
        ${CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Others}
      </div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-meta">${item.category}${item.seller ? ' · ' + item.seller : ''}</p>
      </div>
      <p class="cart-item-price">₱${item.price.toLocaleString()}</p>
    </div>
  `).join('');

  const total = cartItems.reduce((sum, i) => sum + i.price, 0);

  
  if (cartSummary) {
    cartSummary.classList.remove('hidden');
    document.getElementById('summary-count').textContent =
      `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''}`;

    summaryItems.innerHTML = cartItems.map(item => `
      <div class="summary-item-row">
        <span class="summary-item-name">${item.name}</span>
        <span class="summary-item-price">₱${item.price.toLocaleString()}</span>
      </div>
    `).join('');

    document.getElementById('cart-total').textContent = `₱${total.toLocaleString()}`;
  }
}

function removeItem(id) {
  cartItems = cartItems.filter(item => String(item.id) !== String(id));
  renderCart();
  showToast('Removed', 'Item removed from cart.', 'warning');
}

function handleClaim() {
  showToast('Claimed!', 'Items reserved. Coordinate with sellers to complete exchange.', 'success', 4000);
  cartItems = [];
  renderCart();
}

document.addEventListener('DOMContentLoaded', function () {
  fetch('../data/mock-claimed.json')
    .then(r => r.json())
    .then(items => {
      cartItems = items.slice(0, 4).map(item => ({
        id:       item.id,
        name:     item.name,
        price:    parseInt(item.price.replace('₱', '')),
        category: item.category,
        seller:   item.seller || null,
      }));
      renderCart();
    })
    .catch(() => {
      document.getElementById('cart-list').innerHTML =
        `<p class="error-text">Could not load cart.</p>`;
    });
});
