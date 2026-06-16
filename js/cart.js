const CATEGORY_ICONS = {
  Electronics: ICONS.laptop,
  Books: ICONS.book,
  'Lab Tools': ICONS.flask,
  Clothing: ICONS.shirt,
  Others: ICONS.package
};

let cartItems = [];

function renderCart() {
  const cartList = document.getElementById('cart-list');
  const cartFooter = document.getElementById('cart-footer');

  if (!cartItems || !cartItems.length) {
    cartList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-svg">
          ${ICONS.cart}
        </div>
        <p>Your cart is empty.</p>
      </div>
    `;
    cartFooter.classList.add('hidden');
    return;
  }

  cartList.innerHTML = cartItems.map(item => `
    <div class="cart-row">
      <button class="cart-remove" onclick="removeItem('${item.id}')">
        ${ICONS.close}
      </button>

      <div class="cart-thumb">
        ${CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Others}
      </div>

      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-meta">${item.category}</p>
      </div>

      <p class="cart-item-price">₱${item.price}</p>

      <button class="btn-msg">
        ${ICONS.message}
      </button>
    </div>
  `).join('');

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  document.getElementById('cart-total').textContent = `₱${total}`;

  cartFooter.classList.remove('hidden');
}

// 2. Remove Specific Item From Cart
function removeItem(id) {
  // Safe comparison converts both IDs to strings to prevent type mismatch bugs
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
        id: item.id,
        name: item.name,
        price: parseInt(item.price.replace('₱', '')),
        category: item.category
      }));

      renderCart();
    })
    .catch(() => {
      document.getElementById('cart-list').innerHTML = `
        <p class="error-text">Could not load cart.</p>
      `;
    });
});