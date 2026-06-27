const CAT_ICONS = {
  Electronics: ICONS.laptop, Books: ICONS.book,
  'Lab Tools': ICONS.flask, Clothing: ICONS.shirt, Others: ICONS.package,
};

let allListings = [];

const STATUS_LABEL = {
  active: 'Active',
  pending_review: 'Pending Review',
  claimed: 'Claimed',
};

function goToItem(id) {
  window.location.href = '../homepage/itempage.html?id=' + id;
}

function renderListings() {
  const el = document.getElementById('listings-list');
  if (!allListings.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon-svg">${ICONS.tag}</div><p>No listings yet.</p></div>`;
    return;
  }
  el.innerHTML = allListings.map(item => `
    <div class="listing-row" id="listing-${item.id}">
      <div class="listing-thumb" style="cursor:pointer;" onclick="goToItem(${item.id})">${CAT_ICONS[item.category] || ICONS.package}</div>
      <div class="item-info" style="cursor:pointer;" onclick="goToItem(${item.id})">
        <p class="item-name">${item.name}</p>
        <p class="item-meta">₱${Number(item.price).toLocaleString()} · ${item.category}${item.condition ? ' · ' + item.condition : ''}</p>
      </div>
      <span class="badge-status ${item.status}">${STATUS_LABEL[item.status] || item.status}</span>
      <div style="display:flex;gap:3px;flex-shrink:0;">
        <button class="btn-icon" title="Edit" onclick="editListing(${item.id})">${ICONS.edit}</button>
        <button class="btn-icon danger" title="Delete" onclick="deleteListing(${item.id})">${ICONS.trash}</button>
      </div>
    </div>
  `).join('');
}

let allSellerReviews = [];

function renderSellerReviews(reviews) {
  allSellerReviews = reviews;
  const el = document.getElementById('seller-reviews-list');
  if (!reviews.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon-svg">${ICONS.star}</div><p>No reviews yet on your listings.</p></div>`;
    return;
  }
  el.innerHTML = reviews.map(r => `
    <div class="item-row">
      <div class="item-thumb">${CAT_ICONS[r.category] || ICONS.package}</div>
      <div class="item-info">
        <p class="item-name">${r.item}</p>
        <p class="item-meta">from <strong>${r.buyer}</strong> · ${r.date}</p>
        ${r.review ? `<p class="item-review">"${r.review}"</p>` : ''}
      </div>
      ${renderStars(r.rating)}
      <button class="btn-icon" title="Report Review" onclick="reportReview(${r.id})" style="color:var(--warning-text);flex-shrink:0;">${ICONS.alert}</button>
    </div>
  `).join('');
}

let editingListingId = null;

function editListing(id) {
  const item = allListings.find(l => l.id === id);
  if (!item) return;
  editingListingId = id;
  document.getElementById('edit-inp-name').value = item.name || '';
  document.getElementById('edit-inp-price').value = item.price || '';
  document.getElementById('edit-inp-qty').value = item.quantity || 1;
  document.getElementById('edit-inp-category').value = item.category || '';
  document.getElementById('edit-inp-condition').value = item.condition || '';
  document.getElementById('edit-inp-location').value = item.location || '';
  document.getElementById('edit-inp-desc').value = item.description || '';
  document.getElementById('edit-listing-modal').style.display = 'flex';
}

function closeEditListing() {
  document.getElementById('edit-listing-modal').style.display = 'none';
  editingListingId = null;
}

function saveEditListing() {
  const item = allListings.find(l => l.id === editingListingId);
  if (!item) return;
  const name = document.getElementById('edit-inp-name').value.trim();
  const price = document.getElementById('edit-inp-price').value.trim();
  if (!name || !price) {
    showToast('Missing Fields', 'Name and Price are required.', 'warning');
    return;
  }
  item.name = name;
  item.price = parseFloat(price);
  item.quantity = parseInt(document.getElementById('edit-inp-qty').value) || 1;
  item.category = document.getElementById('edit-inp-category').value;
  item.condition = document.getElementById('edit-inp-condition').value;
  item.location = document.getElementById('edit-inp-location').value.trim();
  item.description = document.getElementById('edit-inp-desc').value.trim();
  renderListings();
  closeEditListing();
  showToast('Updated', 'Listing has been updated.', 'success');
}

document.getElementById('edit-listing-modal').addEventListener('click', function (e) {
  if (e.target === this) closeEditListing();
});

function deleteListing(id) {
  showConfirm(
    'Delete this Listing?',
    'This will permanently remove the listing. This action cannot be undone.',
    () => {
      allListings = allListings.filter(l => l.id !== id);
      renderListings();
      showToast('Deleted', 'Listing removed.', 'success');
    }
  );
}

function reportReview(id) {
  const r = allSellerReviews.find(rv => rv.id === id);
  if (!r) return;
  showConfirm(
    'Report this Review?',
    `Report the review by ${r.buyer} on "${r.item}" for admin review? Only report if this review violates platform rules.`,
    () => {
      showToast('Reported', 'Your report has been submitted for admin review.', 'info');
    },
    'Submit Report',
    'ban'
  );
}

document.addEventListener('DOMContentLoaded', function () {
  fetchListings()
    .then(items => {
      allListings = items;
      renderListings();
    })
    .catch(() => {
      document.getElementById('listings-list').innerHTML =
        '<p style="color:var(--text-muted);font-size:13px;">Could not load listings.</p>';
      showToast('Error', 'Failed to load listings.', 'error');
    });

  fetchSellerReviews()
    .then(reviews => renderSellerReviews(reviews))
    .catch(() => {
      document.getElementById('seller-reviews-list').innerHTML =
        '<p style="color:var(--text-muted);font-size:13px;">Could not load reviews.</p>';
    });
});
