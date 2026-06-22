const IP_CATEGORY_BG = {
  Electronics: 'rgba(122,171,138,0.18)',
  Books: 'rgba(212,184,150,0.28)',
  'Lab Tools': 'rgba(122,171,215,0.18)',
  Clothing: 'rgba(210,160,60,0.14)',
  Others: 'rgba(158,144,132,0.18)',
};

const IP_CONDITION_CLASS = {
  New: 'ip-condition-new',
  Good: 'ip-condition-good',
  Used: 'ip-condition-used',
};

const IP_THUMB_OPACITIES = [1, 0.72, 0.52];
const IP_THUMB_SCALES = [1, 0.75, 0.55];

let _ipItem = null;
let _activeThumb = 0;

function _getItemId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'), 10);
}

function _setActiveThumb(idx) {
  _activeThumb = idx;
  document.querySelectorAll('.ip-thumb').forEach((t, i) => {
    t.classList.toggle('active', i === idx);
  });
  const main = document.getElementById('ip-main-img-inner');
  if (main) {
    const bg = IP_CATEGORY_BG[_ipItem.category] || IP_CATEGORY_BG.Others;
    const op = IP_THUMB_OPACITIES[idx] || 0.45;
    main.style.opacity = op;
    main.parentElement.style.background = bg;
  }
  const label = document.getElementById('ip-img-label');
  if (label) label.textContent = `Photo ${idx + 1} of 3`;
}

function _addToCartFromPage() {
  if (!_ipItem) return;
  if (_ipItem.status === 'claimed') {
    showToast('Already Claimed', 'This item has already been claimed and is no longer available.', 'warning');
    return;
  }
  showToast('Added to Cart', `"${_ipItem.name}" added to your cart.`, 'success');
}

function renderItemPage(item) {
  _ipItem = item;
  const wrap = document.getElementById('ip-layout-wrap');
  if (!wrap) return;

  document.title = `CampusCart | ${item.name}`;

  const bg = IP_CATEGORY_BG[item.category] || IP_CATEGORY_BG.Others;
  const condClass = IP_CONDITION_CLASS[item.condition] || 'ip-condition-used';
  const sellerInitial = (item.seller || 'S').charAt(0).toUpperCase();
  const createdDate = item.created ? new Date(item.created).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const cartSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;
    const catSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`;

  const thumbIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

  const mainIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

  wrap.innerHTML = `
    <div class="ip-layout">

      <div class="ip-gallery">
        <div class="ip-main-img" style="background:${bg}">
          <div id="ip-main-img-inner" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;transition:opacity 0.2s ease;">
            ${mainIcon}
          </div>
          <span class="ip-img-label" id="ip-img-label">Photo 1 of 3</span>
        </div>
        <div class="ip-thumbs">
          ${[0, 1, 2].map(i => `
            <div class="ip-thumb${i === 0 ? ' active' : ''}" style="background:${bg};opacity:${IP_THUMB_OPACITIES[i]};" onclick="_setActiveThumb(${i})">
              ${thumbIcon}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="ip-info-panel">
        <div>
          <p class="ip-cat-label">${item.category}</p>
          <h1 class="ip-title">${item.name}</h1>
        </div>

        <div class="ip-price-row">
          <span class="ip-price">₱${Number(item.price).toLocaleString()}</span>
          <span class="ip-condition-badge ${condClass}">${item.condition || 'Available'}</span>
        </div>

        <div class="ip-divider"></div>

        <div class="ip-seller-card" style="cursor:pointer;" onclick="window.location.href='viewUser.html?seller=${encodeURIComponent(item.seller || '')}'">
          <div class="ip-seller-avatar">${sellerInitial}</div>
          <div class="ip-seller-info">
            <p class="ip-seller-name">${item.seller || 'Campus Seller'}</p>
            <p class="ip-seller-meta">Seller · Tap to view profile</p>
          </div>
          <span style="color:var(--text-muted);font-size:12px;flex-shrink:0;">View →</span>
        </div>

        <div class="ip-desc-section">
          <h3>Description</h3>
          <p class="ip-desc-text">${item.description || 'No description provided.'}</p>
        </div>

        <div class="ip-details-grid">
          <div class="ip-detail-item">
            <p class="ip-detail-label">Category</p>
            <p class="ip-detail-value">${item.category}</p>
          </div>
          <div class="ip-detail-item">
            <p class="ip-detail-label">Condition</p>
            <p class="ip-detail-value">${item.condition || '—'}</p>
          </div>
          <div class="ip-detail-item">
            <p class="ip-detail-label">Item ID</p>
            <p class="ip-detail-value">#${item.id}</p>
          </div>
          <div class="ip-detail-item">
            <p class="ip-detail-label">Listed On</p>
            <p class="ip-detail-value">${createdDate}</p>
          </div>
        </div>

        <div class="ip-divider"></div>

        <div class="ip-actions">
          ${item.status === 'claimed'
            ? `<button class="ip-btn-cart" disabled style="opacity:0.45;cursor:not-allowed;">Already Claimed</button>`
            : `<button class="ip-btn-cart" onclick="_addToCartFromPage()">${cartSvg} Add to Cart</button>`
          }
        </div>
      </div>

    </div>
  `;
}

document.addEventListener('DOMContentLoaded', function () {
  const id = _getItemId();

  const cached = sessionStorage.getItem('cc_item');
  if (cached) {
    try {
      const item = JSON.parse(cached);
      if (item.id === id) {
        renderItemPage(item);
        return;
      }
    } catch (_) {}
  }

  fetch('../data/mock-listings.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(items => {
      const item = items.find(i => i.id === id);
      if (!item) {
        document.getElementById('ip-layout-wrap').innerHTML =
          `<div class="empty-state"><p>Item not found.</p></div>`;
        return;
      }
      renderItemPage(item);
    })
    .catch(() => {
      document.getElementById('ip-layout-wrap').innerHTML =
        `<div class="empty-state"><p>Could not load item details.</p></div>`;
    });
});
