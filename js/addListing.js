let uploadedImages = [];

function updatePreview() {
  const name = document.getElementById('inp-name').value.trim();
  const price = document.getElementById('inp-price').value;
  const cat = document.getElementById('inp-category').value;
  const cat2 = document.getElementById('inp-category-2').value;
  const cat3 = document.getElementById('inp-category-3').value;
  const cond = document.getElementById('inp-condition').value;

  document.getElementById('preview-name').textContent = name || 'Item Name';
  document.getElementById('preview-price').textContent =
    price ? '₱' + parseFloat(price).toLocaleString() : '₱ –';
  document.getElementById('preview-category').textContent = cat || 'Category';
  document.getElementById('preview-category-2').textContent = cat2 || '';
  document.getElementById('preview-category-3').textContent = cat3 || '';
  document.getElementById('preview-condition').textContent = cond;

  const imgZone = document.getElementById('preview-img');
  if (uploadedImages.length > 0) {
    imgZone.innerHTML = `<img src="${uploadedImages[0]}" alt="Preview">`;
  } else {
    imgZone.innerHTML = `<div class="preview-img-placeholder">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
    </div>`;
  }
}

function renderThumbs() {
  const el = document.getElementById('img-thumbs');
  el.innerHTML = uploadedImages.map((src, i) => `
    <div class="img-thumb-item">
      <img src="${src}" alt="img ${i + 1}">
      <button class="img-thumb-remove" title="Remove" onclick="removeImage(${i})">×</button>
    </div>
  `).join('');
}

function removeImage(i) {
  uploadedImages.splice(i, 1);
  renderThumbs();
  updatePreview();
}

function handleAddListing() {
  const name = document.getElementById('inp-name').value.trim();
  const price = document.getElementById('inp-price').value.trim();
  const cat = document.getElementById('inp-category').value;
  const condition = document.getElementById('inp-condition').value;
  const desc = document.getElementById('inp-desc').value.trim();
  const qty = parseInt(document.getElementById('inp-qty').value) || 1;
  const location = document.getElementById('inp-location').value.trim();

  if (!name || !price || !cat) {
    showToast('Missing Fields', 'Please fill in Name, Price, and Category.', 'warning');
    return;
  }

  showToast('Listing Submitted', 'Your listing is pending admin review.', 'success');

  ['inp-name', 'inp-price', 'inp-desc', 'inp-location'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('inp-category').value = '';
  document.getElementById('inp-condition').value = '';
  document.getElementById('inp-qty').value = '1';
  document.getElementById('desc-counter').textContent = '0 / 500';
  uploadedImages = [];
  renderThumbs();
  updatePreview();

  setTimeout(() => {
    window.location.href = '../user-profile-dashboard/userListings.html';
  }, 1400);
}

document.addEventListener('DOMContentLoaded', function () {
  const descEl = document.getElementById('inp-desc');
  const counterEl = document.getElementById('desc-counter');
  descEl.addEventListener('input', function () {
    const n = this.value.length;
    counterEl.textContent = n + ' / 500';
    counterEl.className = 'char-counter' + (n >= 500 ? ' at-limit' : n >= 450 ? ' near-limit' : '');
  });

  ['inp-name', 'inp-price', 'inp-category', 'inp-category-2', 'inp-category-3', 'inp-condition'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  });

  document.getElementById('img-file-input').addEventListener('change', function (e) {
    const remaining = 5 - uploadedImages.length;
    Array.from(e.target.files).slice(0, remaining).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        uploadedImages.push(ev.target.result);
        renderThumbs();
        updatePreview();
      };
      reader.readAsDataURL(file);
    });
    this.value = '';
  });
});
