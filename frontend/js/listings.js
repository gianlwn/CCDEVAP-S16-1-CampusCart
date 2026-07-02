const CAT_ICONS = {
  Electronics: ICONS.laptop,
  Books: ICONS.book,
  "Lab Tools": ICONS.flask,
  Clothing: ICONS.shirt,
  Others: ICONS.package,
};

let allListings = [];

const STATUS_LABEL = {
  active: "Active",
  pending_review: "Pending Review",
  rejected: "Rejected",
};

function goToItem(id) {
  window.location.href = "../homepage/itempage.html?id=" + id;
}

function renderListings() {
  const el = document.getElementById("listings-list");
  if (!allListings.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon-svg">${ICONS.tag}</div><p>No listings yet.</p></div>`;
    return;
  }
  el.innerHTML = allListings
    .map((item) => {
      const isRejected = item.status === "rejected";
      const editBtn = isRejected
        ? ""
        : `<button class="btn-icon" title="Edit" onclick="editListing('${item.id}')">${ICONS.edit}</button>`;
      return `
    <div class="listing-row" id="listing-${item.id}">
      <div class="listing-thumb" style="cursor:pointer;" onclick="goToItem('${item.id}')">${CAT_ICONS[item.category] || ICONS.package}</div>
      <div class="item-info" style="cursor:pointer;" onclick="goToItem('${item.id}')">
        <p class="item-name">${item.name}</p>
        <p class="item-meta">₱${Number(item.price).toLocaleString()} · ${item.category}${item.condition ? " · " + item.condition : ""} · ${item.quantity ?? 1} left</p>
        ${isRejected ? `<p class="item-meta" style="color:var(--danger-text, #dc2626);">This listing was rejected by an admin and can no longer be edited. Remove it to list a new item.</p>` : ""}
      </div>
      <span class="badge-status ${item.status}">${STATUS_LABEL[item.status] || item.status}</span>
      <div style="display:flex;gap:3px;flex-shrink:0;">
        ${editBtn}
        <button class="btn-icon danger" title="Remove" onclick="deleteListing('${item.id}')">${ICONS.trash}</button>
      </div>
    </div>
  `;
    })
    .join("");
}

let allSellerReviews = [];

function renderSellerReviews(reviews) {
  allSellerReviews = reviews;
  const el = document.getElementById("seller-reviews-list");
  if (!reviews.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon-svg">${ICONS.star}</div><p>No reviews yet on your listings.</p></div>`;
    return;
  }
  el.innerHTML = reviews
    .map(
      (r) => `
    <div class="item-row">
      <div class="item-thumb">${CAT_ICONS[r.category] || ICONS.package}</div>
      <div class="item-info">
        <p class="item-name">${r.item}</p>
        <p class="item-meta">from <strong>${r.buyer}</strong> · ${r.date}</p>
        ${r.review ? `<p class="item-review">"${r.review}"</p>` : ""}
      </div>
      ${renderStars(r.rating)}
      <button class="btn-icon" title="Report Review" onclick="reportReview('${r.id}')" style="color:var(--warning-text);flex-shrink:0;">${ICONS.alert}</button>
    </div>
  `,
    )
    .join("");
}

let editingListingId = null;
let editingImages = [];

function renderEditThumbs() {
  const el = document.getElementById("edit-img-thumbs");
  el.innerHTML = editingImages
    .map(
      (src, i) => `
    <div class="img-thumb-item">
      <img src="${src}" alt="img ${i + 1}">
      <button class="img-thumb-remove" title="Remove" onclick="removeEditImage(${i})">×</button>
    </div>
  `,
    )
    .join("");
}

function removeEditImage(i) {
  editingImages.splice(i, 1);
  renderEditThumbs();
}

function editListing(id) {
  const item = allListings.find((l) => l.id === id);
  if (!item) return;
  if (item.status === "rejected") {
    showToast(
      "Not Allowed",
      "This listing was rejected and can no longer be edited. Remove it instead.",
      "warning",
    );
    return;
  }
  editingListingId = id;
  document.getElementById("edit-inp-name").value = item.name || "";
  document.getElementById("edit-inp-price").value = item.price || "";
  document.getElementById("edit-inp-qty").value = item.quantity ?? 1;
  document.getElementById("edit-inp-category").value = item.category || "";
  document.getElementById("edit-inp-condition").value = item.condition || "";
  document.getElementById("edit-inp-location").value = item.location || "";
  document.getElementById("edit-inp-desc").value = item.description || "";
  editingImages = Array.isArray(item.images) ? [...item.images] : [];
  renderEditThumbs();
  document.getElementById("edit-listing-modal").style.display = "flex";
}

function closeEditListing() {
  document.getElementById("edit-listing-modal").style.display = "none";
  editingListingId = null;
  editingImages = [];
}

function saveEditListing() {
  const name = document.getElementById("edit-inp-name").value.trim();
  const price = document.getElementById("edit-inp-price").value.trim();
  if (!name || !price) {
    showToast("Missing Fields", "Name and Price are required.", "warning");
    return;
  }
  if (editingImages.length < 1) {
    showToast("Missing Image", "Please keep at least 1 photo of your item.", "warning");
    return;
  }
  const prevStatus = allListings.find(
    (l) => l.id === editingListingId,
  )?.status;

  const parsedQty = parseInt(document.getElementById("edit-inp-qty").value);

  updateListingAPI(editingListingId, {
    product_name: name,
    price: parseFloat(price),
    quantity: Number.isNaN(parsedQty) ? 1 : parsedQty,
    category: document.getElementById("edit-inp-category").value,
    condition: document.getElementById("edit-inp-condition").value,
    description: document.getElementById("edit-inp-desc").value.trim(),
    location: document.getElementById("edit-inp-location").value.trim(),
    images: editingImages,
  }).then(({ ok, data }) => {
    if (!ok) {
      showToast("Error", "Could not update listing.", "error");
      return;
    }
    allListings = allListings.map((l) =>
      l.id === editingListingId ? data : l,
    );
    renderListings();
    closeEditListing();
    const sentForReReview =
      data.status === "pending_review" && prevStatus !== "pending_review";
    showToast(
      "Updated",
      sentForReReview
        ? "Listing has been updated and sent for re-review."
        : "Listing has been updated.",
      "success",
    );
  });
}

document.getElementById("edit-img-file-input").addEventListener("change", function (e) {
  const remaining = 5 - editingImages.length;
  Array.from(e.target.files)
    .slice(0, remaining)
    .forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        editingImages.push(ev.target.result);
        renderEditThumbs();
      };
      reader.readAsDataURL(file);
    });
  this.value = "";
});

document
  .getElementById("edit-listing-modal")
  .addEventListener("click", function (e) {
    if (e.target === this) closeEditListing();
  });

document
  .getElementById("report-review-modal")
  .addEventListener("click", function (e) {
    if (e.target === this) closeReportModal();
  });

function deleteListing(id) {
  showConfirm(
    "Delete this Listing?",
    "This will permanently remove the listing. This action cannot be undone.",
    () => {
      deleteListingAPI(id).then(({ ok }) => {
        if (!ok) {
          showToast("Error", "Could not delete listing.", "error");
          return;
        }
        allListings = allListings.filter((l) => l.id !== id);
        renderListings();
        showToast("Deleted", "Listing removed.", "success");
      });
    },
  );
}

let reportingReview = null;

function reportReview(id) {
  const r = allSellerReviews.find((rv) => rv.id === id);
  if (!r) return;
  reportingReview = r;
  document.getElementById("report-modal-subtitle").textContent =
    `Review by ${r.buyer} on "${r.item}"`;
  document.getElementById("report-inp-reason").value = "";
  document.getElementById("report-review-modal").style.display = "flex";
}

function closeReportModal() {
  document.getElementById("report-review-modal").style.display = "none";
  reportingReview = null;
}

function submitReport() {
  const reason = document.getElementById("report-inp-reason").value.trim();
  if (!reason) {
    showToast(
      "Missing Reason",
      "Please describe why this review violates platform rules.",
      "warning",
    );
    return;
  }
  submitReportAPI({ reported_user_id: reportingReview.rater_id, reason })
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

function switchTab(tab) {
  const isListings = tab === "listings";
  document.getElementById("pane-listings").style.display = isListings
    ? ""
    : "none";
  document.getElementById("pane-claimed").style.display = isListings
    ? "none"
    : "";

  const btnListings = document.getElementById("tab-btn-listings");
  const btnClaimed = document.getElementById("tab-btn-claimed");
  btnListings.style.color = isListings ? "var(--accent)" : "var(--text-muted)";
  btnListings.style.borderBottomColor = isListings
    ? "var(--accent)"
    : "transparent";
  btnListings.style.fontWeight = isListings ? "700" : "600";
  btnClaimed.style.color = isListings ? "var(--text-muted)" : "var(--accent)";
  btnClaimed.style.borderBottomColor = isListings
    ? "transparent"
    : "var(--accent)";
  btnClaimed.style.fontWeight = isListings ? "600" : "700";
}

let allSellerClaims = [];

function renderSellerClaims() {
  const el = document.getElementById("seller-claimed-list");
  if (!allSellerClaims.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon-svg">${ICONS.bag}</div><p>No claimed listings yet.</p></div>`;
    return;
  }
  el.innerHTML = allSellerClaims
    .map((item) => {
      const icon = CAT_ICONS[item.category] || ICONS.package;
      const markBtn = !item.seller_completed
        ? `<button class="btn-icon" title="Mark as Delivered" onclick="markSellerComplete('${item.id}')" style="color:var(--success-text);">${ICONS.check}</button>`
        : `<span title="Delivered" style="display:inline-flex;align-items:center;padding:4px;color:var(--success-text);opacity:.6;">${ICONS.check}</span>`;

      return `
      <div class="listing-row" id="seller-claim-${item.id}">
        <div class="listing-thumb">${icon}</div>
        <div class="item-info" style="flex:1;min-width:0;">
          <p class="item-name">${item.name}</p>
          <p class="item-meta">${item.price} · Qty: ${item.quantity ?? 1} · ${item.category} · Buyer: <strong>${item.buyer}</strong> · ${item.date}</p>
        </div>
        <span class="badge-status ${item.status}">${STATUS_LABEL[item.status] || item.status}</span>
        <div style="display:flex;gap:3px;flex-shrink:0;">${markBtn}</div>
      </div>
    `;
    })
    .join("");
}

function markSellerComplete(id) {
  showConfirm(
    "Confirm Delivery?",
    "This confirms the item has been handed off to the buyer. The buyer will then be able to leave a review.",
    () => {
      markSellerCompleteAPI(id)
        .then(({ ok, data }) => {
          if (!ok) {
            showToast("Error", "Could not update transaction.", "error");
            return;
          }
          allSellerClaims = allSellerClaims.map((c) =>
            c.id === id
              ? { ...c, seller_completed: true, status: data.status }
              : c,
          );
          renderSellerClaims();
          showToast(
            "Confirmed",
            "Delivery confirmed. Buyer can now leave a review.",
            "success",
          );
        })
        .catch(() =>
          showToast("Error", "Could not update transaction.", "error"),
        );
    },
    "Confirm",
    "check",
  );
}

document.addEventListener("DOMContentLoaded", function () {
  fetchUserListings()
    .then((items) => {
      allListings = items;
      renderListings();
    })
    .catch(() => {
      document.getElementById("listings-list").innerHTML =
        '<p style="color:var(--text-muted);font-size:13px;">Could not load listings.</p>';
      showToast("Error", "Failed to load listings.", "error");
    });

  fetchSellerReviews()
    .then((reviews) => renderSellerReviews(reviews))
    .catch(() => {
      document.getElementById("seller-reviews-list").innerHTML =
        '<p style="color:var(--text-muted);font-size:13px;">Could not load reviews.</p>';
    });

  fetchSellerClaims()
    .then((items) => {
      allSellerClaims = items;
      renderSellerClaims();
    })
    .catch(() => {
      document.getElementById("seller-claimed-list").innerHTML =
        '<p style="color:var(--text-muted);font-size:13px;">Could not load claimed listings.</p>';
    });
});
