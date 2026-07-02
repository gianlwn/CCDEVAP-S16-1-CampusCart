const CLAIMED_CAT_ICONS = {
  Electronics: ICONS.laptop,
  Books: ICONS.book,
  "Lab Tools": ICONS.flask,
  Clothing: ICONS.shirt,
};

let claimedItems = [];
let reviewingId  = null;
let pickedStar   = 0;

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
  el.innerHTML = claimedItems.map((item) => {
    const icon      = CLAIMED_CAT_ICONS[item.category] || ICONS.package;
    const hasReview = item.userRating != null;

    const canReview = item.buyer_completed && item.seller_completed;

    let actionBtns = "";
    if (!item.buyer_completed) {
      actionBtns += `<button class="btn-icon" title="Mark as Complete" onclick="markBuyerComplete('${item.id}')" style="color:var(--success-text);">${ICONS.check}</button>`;
    }
    if (canReview) {
      actionBtns += `<button class="btn-icon" title="${hasReview ? "Edit Review" : "Write a Review"}" onclick="openReviewModal('${item.id}')">${ICONS.edit}</button>`;
    }
    if (!item.seller_completed) {
      actionBtns += `<button class="btn-icon danger" title="Cancel Claim" onclick="cancelClaim('${item.id}')">${ICONS.trash}</button>`;
    }
    actionBtns += `<button class="btn-icon" title="Report Seller" onclick="reportClaimedItem('${item.id}')" style="color:var(--warning-text);">${ICONS.alert}</button>`;

    const statusOrStars = hasReview
      ? renderStars(item.userRating)
      : `<span class="badge-status ${item.status}">${item.status}</span>`;

    return `
      <div class="item-row claimed-item-row" id="claimed-row-${item.id}">
        <div class="item-thumb" style="cursor:pointer;" onclick="goToItem('${item.listing_id}')">${icon}</div>
        <div class="item-info" style="flex:1;min-width:0;cursor:pointer;" onclick="goToItem('${item.listing_id}')">
          <p class="item-name">${item.name}</p>
          <p class="item-meta">${item.price} · Qty: ${item.quantity ?? 1} · ${item.category} · ${item.seller || ""} · ${item.date}</p>
          <p class="item-meta">📍 ${item.location || "Location not set"}${item.seller_contact ? ` · 📞 ${item.seller_contact}` : ""}${item.seller_email ? ` · ✉️ ${item.seller_email}` : ""}</p>
          ${hasReview && item.userComment ? `<p class="item-review">"${item.userComment}"</p>` : ""}
        </div>
        ${statusOrStars}
        <div style="display:flex;gap:3px;flex-shrink:0;">${actionBtns}</div>
      </div>
    `;
  }).join("");
}

function markBuyerComplete(id) {
  showConfirm(
    "Confirm Receipt?",
    "This confirms you received the item from the seller. This cannot be undone.",
    () => {
      markBuyerCompleteAPI(id).then(({ ok, data }) => {
        if (!ok) { showToast("Error", "Could not update transaction.", "error"); return; }
        claimedItems = claimedItems.map(c =>
          c.id === id ? { ...c, buyer_completed: true, status: data.status } : c
        );
        renderClaimed();
        showToast("Confirmed", "Transaction marked as received.", "success");
      }).catch(() => showToast("Error", "Could not update transaction.", "error"));
    },
    "Confirm",
    "check",
  );
}

function cancelClaim(id) {
  const item = claimedItems.find((c) => c.id === id);
  if (!item) return;
  showConfirm(
    "Cancel this Claim?",
    `This will cancel your claim on "${item.name}". This action cannot be undone.`,
    () => {
      cancelClaimAPI(id).then(({ ok, data }) => {
        if (!ok) {
          const msg =
            data.error === "already_completed"
              ? "This transaction is already completed and can't be cancelled."
              : data.error === "seller_confirmed"
              ? "The seller already confirmed this handoff, so it can no longer be cancelled."
              : "Could not cancel claim.";
          showToast("Error", msg, "error");
          return;
        }
        claimedItems = claimedItems.filter((c) => c.id !== id);
        renderClaimed();
        showToast("Cancelled", "Claim has been cancelled.", "success");
      }).catch(() => showToast("Error", "Could not cancel claim.", "error"));
    },
    "Cancel Claim",
    "trash",
  );
}

function openReviewModal(id) {
  const item = claimedItems.find((c) => c.id === id);
  if (!item) return;
  reviewingId = id;
  pickedStar  = item.userRating || 0;

  document.getElementById("review-modal-title").textContent    = item.userRating ? "Edit Review" : "Rate & Review";
  document.getElementById("review-modal-subtitle").textContent = `"${item.name}" from ${item.seller}`;
  document.getElementById("review-comment").value              = item.userComment || "";
  _highlightReviewStars(pickedStar);
  document.getElementById("review-modal").style.display = "flex";
}

function closeReviewModal() {
  document.getElementById("review-modal").style.display = "none";
  reviewingId = null;
  pickedStar  = 0;
}

function saveReview() {
  if (!reviewingId) return;
  if (!pickedStar) {
    showToast("Rating Required", "Please select a star rating.", "warning");
    return;
  }
  const item    = claimedItems.find((c) => c.id === reviewingId);
  if (!item) return;
  const comment = document.getElementById("review-comment").value.trim();

  const apiCall = item.rating_id
    ? updateRatingAPI(item.rating_id, pickedStar, comment)
    : submitRatingAPI(item.listing_id, pickedStar, comment);

  apiCall.then(({ ok, data }) => {
    if (!ok) { showToast("Error", "Could not save review.", "error"); return; }
    claimedItems = claimedItems.map((c) =>
      c.id === reviewingId
        ? { ...c, userRating: pickedStar, userComment: comment, rating_id: data.rating_id || c.rating_id }
        : c
    );
    closeReviewModal();
    renderClaimed();
    showToast("Review Saved", "Your review has been submitted.", "success");
  });
}

let reportingClaimedItem = null;

function reportClaimedItem(id) {
  const item = claimedItems.find((c) => c.id === id);
  if (!item) return;
  reportingClaimedItem = item;
  document.getElementById("report-claimed-subtitle").textContent = `"${item.name}" from ${item.seller}`;
  document.getElementById("report-claimed-reason").value = "";
  document.getElementById("report-claimed-modal").style.display = "flex";
}

function closeClaimedReportModal() {
  document.getElementById("report-claimed-modal").style.display = "none";
  reportingClaimedItem = null;
}

function submitClaimedReport() {
  const reason = document.getElementById("report-claimed-reason").value.trim();
  if (!reason) {
    showToast("Missing Reason", "Please describe what went wrong.", "warning");
    return;
  }
  submitReportAPI({
    reported_user_id: reportingClaimedItem.seller_id,
    reported_listing_id: reportingClaimedItem.listing_id,
    reason,
  }).then(({ ok }) => {
    if (!ok) { showToast("Error", "Could not submit report.", "error"); return; }
    closeClaimedReportModal();
    showToast("Reported", "Your report has been submitted for admin review.", "info");
  }).catch(() => showToast("Error", "Could not submit report.", "error"));
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".review-star").forEach((star) => {
    star.addEventListener("mouseover", () => _highlightReviewStars(parseInt(star.dataset.val)));
    star.addEventListener("mouseleave", () => _highlightReviewStars(pickedStar));
    star.addEventListener("click", () => {
      pickedStar = parseInt(star.dataset.val);
      _highlightReviewStars(pickedStar);
    });
  });

  document.getElementById("review-modal").addEventListener("click", function (e) {
    if (e.target === this) closeReviewModal();
  });

  document.getElementById("report-claimed-modal").addEventListener("click", function (e) {
    if (e.target === this) closeClaimedReportModal();
  });

  fetchClaims()
    .then((items) => {
      claimedItems = items;
      renderClaimed();
      showToast("Claimed Items", `You have ${items.length} claimed items.`, "info", 2500);
    })
    .catch(() => {
      document.getElementById("claimed-list").innerHTML =
        '<p style="color:var(--text-muted);">Could not load items.</p>';
      showToast("Error", "Failed to load claimed items.", "error");
    });
});
