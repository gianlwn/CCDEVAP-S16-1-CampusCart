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
  if (mainPhoto) mainPhoto.src = resolveImageSrc(images[idx]);
  const label = document.getElementById("ip-img-label");
  if (label) label.textContent = `Photo ${idx + 1} of ${images.length}`;
}

async function _addToCartFromPage() {
  if (!_ipItem) return;
  if (_ipItem.seller_id === getSessionUserId()) {
    showToast("Not Allowed", "You cannot add your own listing to your cart.", "warning");
    return;
  }
  const available = _ipItem.available ?? _ipItem.quantity ?? 1;
  if (_ipItem.status === "claimed" || available <= 0) {
    showToast("Already Collected", "This item has already been collected.", "warning");
    return;
  }
  try {
    const { ok, data } = await addToCartAPI(_ipItem.id);
    if (ok) {
      showToast("Added to Cart", `"${escapeHtml(_ipItem.name)}" added to your cart.`, "success");
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

  const bg = CATEGORY_BG[item.category] || CATEGORY_BG.Others;
  const condClass = IP_CONDITION_CLASS[item.condition] || "ip-condition-used";
  const sellerInitial = (item.seller || "S").charAt(0).toUpperCase();
  const sellerHasPhoto =
    item.seller_profile_picture &&
    item.seller_profile_picture.startsWith("/uploads/");
  const sellerAvatarHtml = sellerHasPhoto
    ? `<img src="${API}${item.seller_profile_picture}" alt="${escapeHtml(item.seller || "Seller")}">`
    : sellerInitial;
  const isOwn = item.seller_id && item.seller_id === getSessionUserId();
  const createdDate = item.created
    ? new Date(item.created).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const cartSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;

  const flagSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`;

  const mainIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

  const images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];

  wrap.innerHTML = `
    <div class="ip-layout">

      <div class="ip-gallery">
        <div class="ip-main-img" style="background:${bg}">
          ${images.length
            ? `<img id="ip-main-photo" class="ip-main-photo" src="${resolveImageSrc(images[0])}" alt="${escapeHtml(item.name)}">`
            : `<div id="ip-main-img-inner" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${mainIcon}</div>`}
          ${images.length > 1 ? `<span class="ip-img-label" id="ip-img-label">Photo 1 of ${images.length}</span>` : ""}
        </div>
        ${images.length > 1
          ? `<div class="ip-thumbs">
          ${images
            .map(
              (src, i) => `
            <div class="ip-thumb${i === 0 ? " active" : ""}" onclick="_setActiveThumb(${i})">
              <img src="${resolveImageSrc(src)}" alt="Photo ${i + 1}">
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
            ${(item.categories || [item.category]).map(c => `<span class="ip-cat-pill">${escapeHtml(c)}</span>`).join("")}
          </div>
          <h1 class="ip-title">${escapeHtml(item.name)}</h1>
        </div>

        <div class="ip-price-row">
          <span class="ip-price">₱${Number(item.price).toLocaleString()}</span>
          <span class="ip-condition-badge ${condClass}">${item.condition || "Available"}</span>
        </div>

        <div class="ip-divider"></div>

        <div class="ip-seller-card" style="cursor:pointer;" onclick="window.location.href='viewUser.html?seller_id=${encodeURIComponent(item.seller_id || "")}'">
          <div class="ip-seller-avatar">${sellerAvatarHtml}</div>
          <div class="ip-seller-info">
            <p class="ip-seller-name">${escapeHtml(item.seller || "Campus Seller")}</p>
            <p class="ip-seller-meta">Seller · Tap to view profile</p>
          </div>
          <span style="color:var(--text-muted);font-size:12px;flex-shrink:0;">View →</span>
        </div>

        <div class="ip-desc-section">
          <h3>Description</h3>
          <p class="ip-desc-text">${escapeHtml(item.description || "No description provided.")}</p>
        </div>

        <div class="ip-details-grid">
          <div class="ip-detail-item">
            <p class="ip-detail-label">Category</p>
            <p class="ip-detail-value">${(item.categories || [item.category]).map(escapeHtml).join(", ")}</p>
          </div>
          <div class="ip-detail-item">
            <p class="ip-detail-label">Condition</p>
            <p class="ip-detail-value">${item.condition || "—"}</p>
          </div>
          <div class="ip-detail-item">
            <p class="ip-detail-label">Quantity</p>
            <p class="ip-detail-value">${item.available ?? item.quantity ?? 1}</p>
          </div>
          <div class="ip-detail-item">
            <p class="ip-detail-label">Listed On</p>
            <p class="ip-detail-value">${createdDate}</p>
          </div>
          <div class="ip-detail-item">
            <p class="ip-detail-label">Pickup Location</p>
            <p class="ip-detail-value">${escapeHtml(item.location || "—")}</p>
          </div>
        </div>

        <div class="ip-divider"></div>

        <div class="ip-actions">
          ${
            isOwn
              ? `<button class="ip-btn-cart" disabled style="opacity:0.45;cursor:not-allowed;">Your Listing</button>`
              : item.status === "claimed" || (item.available ?? item.quantity ?? 1) <= 0
              ? `<button class="ip-btn-cart" disabled style="opacity:0.45;cursor:not-allowed;">Already Collected</button>`
              : `<button class="ip-btn-cart" onclick="_addToCartFromPage()">${cartSvg} Add to Cart</button>`
          }
          ${
            isOwn
              ? ""
              : `<button class="ip-btn-report" onclick="openReportModal()">${flagSvg} Report Listing</button>`
          }
        </div>
      </div>

    </div>
  `;

  loadSellerReviews(item.seller_id);
}

let _ipSellerId = null;
let _ipReviews  = [];

function _isAdmin() {
  return localStorage.getItem("session_role") === "admin";
}

function renderSellerReviews(reviews) {
  const section = document.getElementById("ip-reviews-section");
  const summaryEl = document.getElementById("ip-reviews-summary");
  const listEl = document.getElementById("ip-reviews-list");
  if (!section || !listEl) return;
  section.style.display = "block";

  if (!reviews.length) {
    summaryEl.innerHTML = "";
    listEl.innerHTML = `<div class="empty-state"><div class="empty-icon-svg">${ICONS.star}</div><p>No reviews yet for this seller.</p></div>`;
    return;
  }

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  summaryEl.innerHTML = `${renderStars(Math.round(avg))}<span>${avg.toFixed(1)} · ${reviews.length} review${reviews.length > 1 ? "s" : ""}</span>`;

  const isAdmin = _isAdmin();
  listEl.innerHTML = reviews
    .map(
      (r) => `
    <div class="item-row">
      <div class="item-thumb">${ICONS.package}</div>
      <div class="item-info">
        <p class="item-name">${escapeHtml(r.item)}</p>
        <p class="item-meta">by <strong>${escapeHtml(r.buyer)}</strong> · ${r.date}</p>
        ${r.review ? `<p class="item-review">"${escapeHtml(r.review)}"</p>` : ""}
      </div>
      ${renderStars(r.rating)}
      ${isAdmin ? `<button class="btn-icon danger" title="Delete Review" onclick="adminDeleteReview('${r.id}')">${ICONS.trash}</button>` : ""}
    </div>
  `,
    )
    .join("");
}

function adminDeleteReview(ratingId) {
  showConfirm(
    "Delete this Review?",
    "This will permanently remove this review from the seller's profile. This cannot be undone.",
    () => {
      removeRatingAPI(ratingId).then(({ ok }) => {
        if (!ok) { showToast("Error", "Could not delete review.", "error"); return; }
        _ipReviews = _ipReviews.filter((r) => r.id !== ratingId);
        renderSellerReviews(_ipReviews);
        showToast("Deleted", "Review has been removed.", "success");
      }).catch(() => showToast("Error", "Could not delete review.", "error"));
    },
    "Delete",
    "trash",
  );
}

function loadSellerReviews(sellerId) {
  const section = document.getElementById("ip-reviews-section");
  if (!sellerId || !section) return;
  _ipSellerId = sellerId;
  fetchSellerReviewsByUserId(sellerId)
    .then((reviews) => {
      _ipReviews = reviews;
      renderSellerReviews(reviews);
    })
    .catch(() => {
      section.style.display = "block";
      document.getElementById("ip-reviews-list").innerHTML =
        `<p style="color:var(--text-muted);font-size:13px;">Could not load reviews.</p>`;
    });
}

document
  .getElementById("report-listing-modal")
  .addEventListener("click", function (e) {
    if (e.target === this) closeReportModal();
  });

function openReportModal() {
  if (!_ipItem) return;
  if (!getSessionUserId()) {
    showToast("Not Logged In", "Please log in to report a listing.", "warning");
    return;
  }
  document.getElementById("report-modal-subtitle").textContent =
    `"${_ipItem.name}" by ${_ipItem.seller || "Campus Seller"}`;
  document.getElementById("report-inp-reason").value = "";
  document.getElementById("report-listing-modal").style.display = "flex";
}

function closeReportModal() {
  document.getElementById("report-listing-modal").style.display = "none";
}

function submitReport() {
  const reason = document.getElementById("report-inp-reason").value.trim();
  if (!reason) {
    showToast(
      "Missing Reason",
      "Please describe why this listing violates platform rules.",
      "warning",
    );
    return;
  }
  submitReportAPI({
    reported_listing_id: _ipItem.id,
    reported_user_id: _ipItem.seller_id,
    reason,
  })
    .then(({ ok }) => {
      if (!ok) {
        showToast("Error", "Could not submit report.", "error");
        return;
      }
      closeReportModal();
      showToast(
        "Reported",
        "Your report has been submitted for admin review.",
        "info",
      );
    })
    .catch(() => showToast("Error", "Could not submit report.", "error"));
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
