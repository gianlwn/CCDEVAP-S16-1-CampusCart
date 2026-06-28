const VU_CAT_ICONS = {
  Electronics: ICONS.laptop,
  Books: ICONS.book,
  "Lab Tools": ICONS.flask,
  Clothing: ICONS.shirt,
  Others: ICONS.package,
};

const VU_CATEGORY_BG = {
  Electronics: "rgba(122,171,138,0.18)",
  Books: "rgba(212,184,150,0.28)",
  "Lab Tools": "rgba(122,171,215,0.18)",
  Clothing: "rgba(210,160,60,0.14)",
  Others: "rgba(158,144,132,0.18)",
};

function _getSellerId() {
  return new URLSearchParams(window.location.search).get("seller_id") || "";
}

function renderSellerProfile(user, listings) {
  const el = document.getElementById("vu-content");
  const initial = (user.name || "?").charAt(0).toUpperCase();
  const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

  const activeListings = listings.filter((l) => l.status === "active");

  const listingsHtml = activeListings.length
    ? activeListings
        .map((item) => {
          const bg = VU_CATEGORY_BG[item.category] || VU_CATEGORY_BG.Others;
          const icon = VU_CAT_ICONS[item.category] || ICONS.package;
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

  el.innerHTML = `
    <div class="vu-layout">

      <div class="vu-profile-card">
        <div class="vu-avatar">${initial}</div>
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
      </div>

      <div class="vu-main-col">
        <div class="vu-section-card">
          <p class="section-title" style="margin-bottom:14px;">Active Listings</p>
          <div id="vu-listings-list">${listingsHtml}</div>
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

  Promise.all([fetchSellerProfile(sellerId), fetchListings()])
    .then(([user, listings]) => {
      const sellerListings = listings.filter((l) => l.seller_id === sellerId);
      renderSellerProfile(user, sellerListings);
    })
    .catch(() => {
      document.getElementById("vu-content").innerHTML =
        `<div class="empty-state"><p>Could not load seller profile.</p></div>`;
    });
});
