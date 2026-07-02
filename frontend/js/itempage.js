const IP_CATEGORY_BG = {
  Electronics: "rgba(122,171,138,0.18)",
  Books: "rgba(212,184,150,0.28)",
  "Lab Tools": "rgba(122,171,215,0.18)",
  Clothing: "rgba(210,160,60,0.14)",
  Others: "rgba(158,144,132,0.18)",
};

const IP_CONDITION_CLASS = {
  New: "ip-condition-new",
  Good: "ip-condition-good",
  Used: "ip-condition-used",
};

let _ipItem = null;
let _activeThumb = 0;

function _getItemId() {
  return new URLSearchParams(window.location.search).get("id");
}

function _setActiveThumb(idx) {
  const images = (_ipItem && _ipItem.images) || [];
  if (!images.length) return;
  _activeThumb = idx;
  document.querySelectorAll(".ip-thumb").forEach((t, i) => {
    t.classList.toggle("active", i === idx);
  });
  const mainPhoto = document.getElementById("ip-main-photo");
  if (mainPhoto) mainPhoto.src = images[idx];
  const label = document.getElementById("ip-img-label");
  if (label) label.textContent = `Photo ${idx + 1} of ${images.length}`;
}

async function _addToCartFromPage() {
  if (!_ipItem) return;
  if (_ipItem.seller_id === getSessionUserId()) {
    showToast("Not Allowed", "You cannot add your own listing to your cart.", "warning");
    return;
  }
  if (_ipItem.status === "claimed") {
    showToast("Already Claimed", "This item has already been claimed.", "warning");
    return;
  }
  try {
    const { ok, data } = await addToCartAPI(_ipItem.id);
    if (ok) {
      showToast("Added to Cart", `"${_ipItem.name}" added to your cart.`, "success");
      bumpCartBadge(1);
    } else if (data.error === "already_in_cart") {
      showToast("Already in Cart", "This item is already in your cart.", "warning");
    } else if (data.error === "listing_unavailable") {
      showToast("Unavailable", "This item is no longer available.", "warning");
    } else {
      showToast("Error", "Could not add to cart.", "error");
    }
  } catch {
    showToast("Not Logged In", "Please log in to add items to your cart.", "warning");
  }
}

function renderItemPage(item) {
  _ipItem = item;
  const wrap = document.getElementById("ip-layout-wrap");
  if (!wrap) return;

  document.title = `CampusCart | ${item.name}`;

  const bg = IP_CATEGORY_BG[item.category] || IP_CATEGORY_BG.Others;
  const condClass = IP_CONDITION_CLASS[item.condition] || "ip-condition-used";
  const sellerInitial = (item.seller || "S").charAt(0).toUpperCase();
  const isOwn = item.seller_id && item.seller_id === getSessionUserId();
  const createdDate = item.created
    ? new Date(item.created).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const cartSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;

  const mainIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

  const images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];

  wrap.innerHTML = `
    <div class="ip-layout">

      <div class="ip-gallery">
        <div class="ip-main-img" style="background:${bg}">
          ${images.length
            ? `<img id="ip-main-photo" class="ip-main-photo" src="${images[0]}" alt="${item.name}">`
            : `<div id="ip-main-img-inner" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${mainIcon}</div>`}
          ${images.length > 1 ? `<span class="ip-img-label" id="ip-img-label">Photo 1 of ${images.length}</span>` : ""}
        </div>
        ${images.length > 1
          ? `<div class="ip-thumbs">
          ${images
            .map(
              (src, i) => `
            <div class="ip-thumb${i === 0 ? " active" : ""}" onclick="_setActiveThumb(${i})">
              <img src="${src}" alt="Photo ${i + 1}">
            </div>
          `,
            )
            .join("")}
        </div>`
          : ""}
      </div>

      <div class="ip-info-panel">
        <div>
          <div class="ip-cat-pills">
            ${(item.categories || [item.category]).map(c => `<span class="ip-cat-pill">${c}</span>`).join("")}
          </div>
          <h1 class="ip-title">${item.name}</h1>
        </div>

        <div class="ip-price-row">
          <span class="ip-price">₱${Number(item.price).toLocaleString()}</span>
          <span class="ip-condition-badge ${condClass}">${item.condition || "Available"}</span>
        </div>

        <div class="ip-divider"></div>

        <div class="ip-seller-card" style="cursor:pointer;" onclick="window.location.href='viewUser.html?seller_id=${encodeURIComponent(item.seller_id || "")}'">
          <div class="ip-seller-avatar">${sellerInitial}</div>
          <div class="ip-seller-info">
            <p class="ip-seller-name">${item.seller || "Campus Seller"}</p>
            <p class="ip-seller-meta">Seller · Tap to view profile</p>
          </div>
          <span style="color:var(--text-muted);font-size:12px;flex-shrink:0;">View →</span>
        </div>

        <div class="ip-desc-section">
          <h3>Description</h3>
          <p class="ip-desc-text">${item.description || "No description provided."}</p>
        </div>

        <div class="ip-details-grid">
          <div class="ip-detail-item">
            <p class="ip-detail-label">Category</p>
            <p class="ip-detail-value">${(item.categories || [item.category]).join(", ")}</p>
          </div>
          <div class="ip-detail-item">
            <p class="ip-detail-label">Condition</p>
            <p class="ip-detail-value">${item.condition || "—"}</p>
          </div>
          <div class="ip-detail-item">
            <p class="ip-detail-label">Quantity</p>
            <p class="ip-detail-value">${item.quantity ?? 1}</p>
          </div>
          <div class="ip-detail-item">
            <p class="ip-detail-label">Listed On</p>
            <p class="ip-detail-value">${createdDate}</p>
          </div>
          <div class="ip-detail-item">
            <p class="ip-detail-label">Pickup Location</p>
            <p class="ip-detail-value">${item.location || "—"}</p>
          </div>
        </div>

        <div class="ip-divider"></div>

        <div class="ip-actions">
          ${
            isOwn
              ? `<button class="ip-btn-cart" disabled style="opacity:0.45;cursor:not-allowed;">Your Listing</button>`
              : item.status === "claimed"
              ? `<button class="ip-btn-cart" disabled style="opacity:0.45;cursor:not-allowed;">Already Claimed</button>`
              : `<button class="ip-btn-cart" onclick="_addToCartFromPage()">${cartSvg} Add to Cart</button>`
          }
        </div>
      </div>

    </div>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  const id = _getItemId();

  const cached = sessionStorage.getItem("cc_item");
  if (cached) {
    try {
      const item = JSON.parse(cached);
      if (String(item.id) === String(id)) {
        renderItemPage(item);
        return;
      }
    } catch (_) {}
  }

  fetchListings()
    .then((items) => {
      const item = items.find((i) => String(i.id) === String(id));
      if (!item) {
        document.getElementById("ip-layout-wrap").innerHTML =
          `<div class="empty-state"><p>Item not found.</p></div>`;
        return;
      }
      renderItemPage(item);
    })
    .catch(() => {
      document.getElementById("ip-layout-wrap").innerHTML =
        `<div class="empty-state"><p>Could not load item details.</p></div>`;
    });
});
