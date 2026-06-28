const CLAIMED_CAT_ICONS = {
  Electronics: ICONS.laptop,
  Books: ICONS.book,
  "Lab Tools": ICONS.flask,
  Clothing: ICONS.shirt,
};

let claimedItems = [];
let reviewingId = null;
let pickedStar = 0;

function _highlightReviewStars(val) {
  document.querySelectorAll(".review-star").forEach((s) => {
    const v = parseInt(s.dataset.val);
    s.style.color = v <= val ? "var(--star-fill)" : "var(--star-empty)";
  });
}

function goToItem(id) {
  window.location.href = "../homepage/itempage.html?id=" + id;
}

function renderClaimed() {
  const el = document.getElementById("claimed-list");
  if (!claimedItems.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🛍️</div><p>No claimed items yet.</p></div>`;
    return;
  }
  el.innerHTML = claimedItems
    .map((item) => {
      const statusCls = item.status === "completed" ? "completed" : "pending";
      const icon = CLAIMED_CAT_ICONS[item.category] || ICONS.package;
      const hasReview =
        item.userRating !== null && item.userRating !== undefined;

      if (hasReview) {
        return `
        <div class="item-row claimed-item-row" id="claimed-row-${item.id}">
          <div class="item-thumb" style="cursor:pointer;" onclick="goToItem(${item.id})">${icon}</div>
          <div class="item-info" style="flex:1;min-width:0;cursor:pointer;" onclick="goToItem(${item.id})">
            <p class="item-name">${item.name}</p>
            <p class="item-meta">${item.price} · ${item.category} · ${item.seller || ""} · ${item.date}</p>
            ${item.userComment ? `<p class="item-review">"${item.userComment}"</p>` : ""}
          </div>
          ${renderStars(item.userRating)}
          <div style="display:flex;gap:3px;flex-shrink:0;">
            <button class="btn-icon" title="Edit Review" onclick="openReviewModal(${item.id})">${ICONS.edit}</button>
            <button class="btn-icon" title="Report" onclick="reportClaimedItem(${item.id})" style="color:var(--warning-text);">${ICONS.alert}</button>
          </div>
        </div>
      `;
      } else {
        const reviewBtn =
          item.status === "completed"
            ? `<button class="btn-icon" title="Write a Review" onclick="openReviewModal(${item.id})">${ICONS.edit}</button>`
            : "";
        return `
        <div class="item-row claimed-item-row" id="claimed-row-${item.id}">
          <div class="item-thumb" style="cursor:pointer;" onclick="goToItem(${item.id})">${icon}</div>
          <div class="item-info" style="flex:1;min-width:0;cursor:pointer;" onclick="goToItem(${item.id})">
            <p class="item-name">${item.name}</p>
            <p class="item-meta">${item.price} · ${item.category} · ${item.seller || ""} · ${item.date}</p>
          </div>
          <span class="badge-status ${statusCls}">${item.status}</span>
          <div style="display:flex;gap:3px;flex-shrink:0;">
            ${reviewBtn}
            <button class="btn-icon" title="Report" onclick="reportClaimedItem(${item.id})" style="color:var(--warning-text);">${ICONS.alert}</button>
          </div>
        </div>
      `;
      }
    })
    .join("");
}

function openReviewModal(id) {
  const item = claimedItems.find((c) => c.id === id);
  if (!item) return;
  reviewingId = id;
  pickedStar = item.userRating || 0;

  document.getElementById("review-modal-title").textContent = item.userRating
    ? "Edit Review"
    : "Rate & Review";
  document.getElementById("review-modal-subtitle").textContent =
    `"${item.name}" from ${item.seller}`;
  document.getElementById("review-comment").value = item.userComment || "";
  _highlightReviewStars(pickedStar);
  document.getElementById("review-modal").style.display = "flex";
}

function closeReviewModal() {
  document.getElementById("review-modal").style.display = "none";
  reviewingId = null;
  pickedStar = 0;
}

function saveReview() {
  if (!reviewingId) return;
  const comment = document.getElementById("review-comment").value.trim();
  const result = submitItemReview(
    claimedItems,
    reviewingId,
    pickedStar,
    comment,
  );
  if (!result.success) {
    if (result.error === "no_rating")
      showToast("Rating Required", "Please select a star rating.", "warning");
    return;
  }
  claimedItems = result.items;
  closeReviewModal();
  renderClaimed();
  showToast("Review Saved", "Your review has been submitted.", "success");
}

function reportClaimedItem(id) {
  const item = claimedItems.find((c) => c.id === id);
  if (!item) return;
  showConfirm(
    "Report this Transaction?",
    `Report your claim of "${item.name}" from ${item.seller}? Only report if there was an issue with this transaction.`,
    () => {
      showToast(
        "Reported",
        "Your report has been submitted for review.",
        "info",
      );
    },
    "Submit Report",
    "ban",
  );
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".review-star").forEach((star) => {
    star.addEventListener("mouseover", () =>
      _highlightReviewStars(parseInt(star.dataset.val)),
    );
    star.addEventListener("mouseleave", () =>
      _highlightReviewStars(pickedStar),
    );
    star.addEventListener("click", () => {
      pickedStar = parseInt(star.dataset.val);
      _highlightReviewStars(pickedStar);
    });
  });

  document
    .getElementById("review-modal")
    .addEventListener("click", function (e) {
      if (e.target === this) closeReviewModal();
    });

  fetchClaimedItems()
    .then((items) => {
      claimedItems = items;
      renderClaimed();
      showToast(
        "Claimed Items",
        `You have ${items.length} claimed items.`,
        "info",
        2500,
      );
    })
    .catch(() => {
      document.getElementById("claimed-list").innerHTML =
        '<p style="color:var(--text-muted);">Could not load items.</p>';
      showToast("Error", "Failed to load claimed items.", "error");
    });
});
