let _vuUser     = null;
let _vuListings = [];
let _vuReviews  = [];

function _getSellerId() {
  return new URLSearchParams(window.location.search).get("seller_id") || "";
}

function _isAdmin() {
  return localStorage.getItem("session_role") === "admin";
}

function openAccountReportModal() {
  if (!_vuUser) return;
  if (!localStorage.getItem("session_user_id")) {
    showToast("Not Logged In", "Please log in to report an account.", "warning");
    return;
  }
  document.getElementById("report-account-modal-subtitle").textContent = _vuUser.name || "This user";
  document.getElementById("report-account-inp-reason").value = "";
  document.getElementById("report-account-modal").style.display = "flex";
}

function closeAccountReportModal() {
  document.getElementById("report-account-modal").style.display = "none";
}

function submitAccountReport() {
  const reason = document.getElementById("report-account-inp-reason").value.trim();
  if (!reason) {
    showToast("Missing Reason", "Please describe why this account violates platform rules.", "warning");
    return;
  }
  submitReportAPI({ reported_user_id: _getSellerId(), reason })
    .then(({ ok }) => {
      if (!ok) {
        showToast("Error", "Could not submit report.", "error");
        return;
      }
      closeAccountReportModal();
      showToast("Reported", "Your report has been submitted for admin review.", "info");
    })
    .catch(() => showToast("Error", "Could not submit report.", "error"));
}

document
  .getElementById("report-account-modal")
  .addEventListener("click", function (e) {
    if (e.target === this) closeAccountReportModal();
  });

function buildReviewsHtml(reviews) {
  if (!reviews.length) {
    return `<div class="empty-state"><div class="empty-icon-svg">${ICONS.star}</div><p>No reviews yet for this seller.</p></div>`;
  }
  const isAdmin = _isAdmin();
  return reviews
    .map(
      (r) => `
    <div class="item-row">
      <div class="item-thumb">${ICONS.package}</div>
      <div class="item-info">
        <p class="item-name">${r.item}</p>
        <p class="item-meta">by <strong>${r.buyer}</strong> · ${r.date}</p>
        ${r.review ? `<p class="item-review">"${r.review}"</p>` : ""}
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
        _vuReviews = _vuReviews.filter((r) => r.id !== ratingId);
        const sellerListings = _vuListings.filter((l) => l.seller_id === _getSellerId());
        renderSellerProfile(_vuUser, sellerListings, _vuReviews);
        showToast("Deleted", "Review has been removed.", "success");
      }).catch(() => showToast("Error", "Could not delete review.", "error"));
    },
    "Delete",
    "trash",
  );
}

function renderSellerProfile(user, listings, reviews) {
  const el = document.getElementById("vu-content");
  const initial = (user.name || "?").charAt(0).toUpperCase();
  const hasPhoto = user.profile_picture && user.profile_picture.startsWith("/uploads/");
  const avatarHtml = hasPhoto
    ? `<img src="${API}${user.profile_picture}" alt="${user.name}">`
    : initial;
  const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

  const activeListings = listings.filter((l) => l.status === "active");

  const listingsHtml = activeListings.length
    ? activeListings
        .map((item) => {
          const bg = CATEGORY_BG[item.category] || CATEGORY_BG.Others;
          const icon = CATEGORY_ICONS[item.category] || ICONS.package;
          return `
          <div class="item-row" style="cursor:pointer;" onclick="window.location.href='itempage.html?id=${item.id}'">
            <div class="item-thumb" style="background:${bg};color:var(--accent);">${icon}</div>
            <div class="item-info">
              <p class="item-name">${item.name}</p>
              <p class="item-meta">₱${Number(item.price).toLocaleString()} · ${item.category} · ${item.condition || ""}</p>
            </div>
            <button class="btn-outline" style="margin: 0;" onclick="event.stopPropagation();window.location.href='itempage.html?id=${item.id}'">View</button>
          </div>`;
        })
        .join("")
    : `<div class="empty-state"><div class="empty-icon-svg">${ICONS.tag}</div><p>No active listings from this seller.</p></div>`;

  const isOwnProfile = localStorage.getItem("session_user_id") === _getSellerId();
  const reportBtnHtml = isOwnProfile
    ? ""
    : `<button class="vu-report-btn" onclick="openAccountReportModal()">${ICONS.alert} Report Account</button>`;

  const reviewsHtml = buildReviewsHtml(reviews);
  const reviewsSummary = reviews.length
    ? (() => {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        return `${renderStars(Math.round(avg))}<span>${avg.toFixed(1)} · ${reviews.length} review${reviews.length > 1 ? "s" : ""}</span>`;
      })()
    : "";

  el.innerHTML = `
    <div class="vu-layout">

      <div class="vu-profile-card">
        <div class="vu-avatar">${avatarHtml}</div>
        <div class="vu-name">${user.name}</div>
        <div class="vu-rating-row">
          ${starSvg}
          ${user.rating ? user.rating.toFixed(1) + " / 5.0" : "No ratings yet"}
        </div>
        <p class="vu-school">${user.school || "CampusCart Member"}</p>
        ${user.bio ? `<p class="vu-bio">"${user.bio}"</p>` : ""}
        <div class="vu-stats-row">
          <div class="vu-stat-item">
            <span class="vu-stat-value">${user.itemsSold || 0}</span>
            <span class="vu-stat-label">Sold</span>
          </div>
          <div class="vu-stat-item">
            <span class="vu-stat-value">${activeListings.length}</span>
            <span class="vu-stat-label">Active</span>
          </div>
          <div class="vu-stat-item">
            <span class="vu-stat-value">${user.memberSince || "—"}</span>
            <span class="vu-stat-label">Member Since</span>
          </div>
        </div>
        ${reportBtnHtml}
      </div>

      <div class="vu-main-col">
        <div class="vu-section-card">
          <p class="section-title" style="margin-bottom:14px;">Active Listings</p>
          <div id="vu-listings-list">${listingsHtml}</div>
        </div>

        <div class="vu-section-card">
          <div class="vu-reviews-header">
            <p class="section-title">Reviews</p>
            <div class="vu-reviews-summary">${reviewsSummary}</div>
          </div>
          <div id="vu-reviews-list" class="item-list">${reviewsHtml}</div>
        </div>
      </div>

    </div>
  `;

  document.title = `CampusCart | ${user.name}`;
}

document.addEventListener("DOMContentLoaded", function () {
  const sellerId = _getSellerId();
  if (!sellerId) {
    document.getElementById("vu-content").innerHTML =
      `<div class="empty-state"><p>No seller specified.</p></div>`;
    return;
  }

  Promise.all([
    fetchSellerProfile(sellerId),
    fetchListings(),
    fetchSellerReviewsByUserId(sellerId),
  ])
    .then(([user, listings, reviews]) => {
      _vuUser     = user;
      _vuListings = listings;
      _vuReviews  = reviews;
      const sellerListings = listings.filter((l) => l.seller_id === sellerId);
      renderSellerProfile(user, sellerListings, reviews);
    })
    .catch(() => {
      document.getElementById("vu-content").innerHTML =
        `<div class="empty-state"><p>Could not load seller profile.</p></div>`;
    });
});
