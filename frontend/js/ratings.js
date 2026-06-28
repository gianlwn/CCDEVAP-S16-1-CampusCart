let allRatings = [];
let editingId = null;
let pickedStar = 0;

function renderAvg(items) {
  if (!items.length) return;
  const avg = items.reduce((s, i) => s + i.rating, 0) / items.length;
  const avgStr = avg.toFixed(1);
  const rounded = Math.round(avg);
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<span class="star${i <= rounded ? ' filled' : ''}">★</span>`;
  }
  document.getElementById('avg-rating-display').innerHTML = `
    <div class="big-number">${avgStr}</div>
    <div class="stars-row">${stars}</div>
    <div class="count">${items.length} review${items.length !== 1 ? 's' : ''}</div>
  `;
}

function renderList() {
  const el = document.getElementById('ratings-list');
  if (!allRatings.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">⭐</div><p>No ratings yet.</p></div>`;
    return;
  }
  el.innerHTML = allRatings.map(createRatingsRow).join('');
}

function editRating(id) {
  editingId = id;
  const item = allRatings.find(r => r.id === id);
  if (!item) return;
  document.getElementById('modal-review').value = item.review || '';
  pickedStar = item.rating;
  _highlightStars(pickedStar);
  document.getElementById('edit-modal').style.display = 'flex';
}

function closeEdit() {
  document.getElementById('edit-modal').style.display = 'none';
  editingId = null;
}

function saveEdit() {
  if (!editingId) return;
  const star = pickedStar;
  const review = document.getElementById('modal-review').value.trim();
  const result = editRatingEntry(allRatings, editingId, star, review);
  if (!result.success) return;
  allRatings = result.ratings;
  closeEdit();
  renderList();
  renderAvg(allRatings);
  showToast('Updated', 'Your rating has been updated.', 'success');
}

function deleteRating(id) {
  showConfirm(
    'Remove this Rating?',
    'This will permanently remove the rating. This action cannot be undone.',
    () => {
      const result = deleteRatingRecord(allRatings, id);
      allRatings = result.ratings;
      renderList();
      renderAvg(allRatings);
      showToast('Removed', 'Rating has been removed.', 'success');
    }
  );
}

function _highlightStars(val) {
  document.querySelectorAll('.modal-star').forEach(s => {
    const v = parseInt(s.dataset.val);
    s.style.color = v <= val ? 'var(--star-fill)' : 'var(--star-empty)';
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.modal-star').forEach(star => {
    star.addEventListener('mouseover', () => _highlightStars(parseInt(star.dataset.val)));
    star.addEventListener('mouseleave', () => _highlightStars(pickedStar));
    star.addEventListener('click', () => {
      pickedStar = parseInt(star.dataset.val);
      _highlightStars(pickedStar);
    });
  });

  document.getElementById('edit-modal').addEventListener('click', function (e) {
    if (e.target === this) closeEdit();
  });

  fetchRatings()
    .then(items => {
      allRatings = items;
      renderList();
      renderAvg(items);
    })
    .catch(() => {
      document.getElementById('ratings-list').innerHTML =
        '<p style="color:var(--text-muted);">Could not load ratings.</p>';
      showToast('Error', 'Failed to load ratings.', 'error');
    });
});
