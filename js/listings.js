const CAT_ICONS = {
      Electronics: ICONS.laptop, Books: ICONS.book,
      'Lab Tools': ICONS.flask, Clothing: ICONS.shirt, Others: ICONS.package,
    };

    let allListings = [];
    let reportsChart = null;
    let uploadedImages = [];

    const STATUS_LABEL = {
      active: 'Active',
      pending_review: 'Pending Review',
      claimed: 'Claimed',
    };

function renderListings() {
      const el = document.getElementById('listings-list');
      if (!allListings.length) {
        el.innerHTML = `<div class="empty-state"><div class="empty-icon-svg">${ICONS.tag}</div><p>No listings yet. Add one above!</p></div>`;
        return;
      }
      el.innerHTML = allListings.map(item => `
        <div class="listing-row" id="listing-${item.id}">
          <div class="listing-thumb">${CAT_ICONS[item.category] || ICONS.package}</div>
          <div class="item-info">
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

function buildReportsChart(items) {
      const t = getChartTheme();
      const counts = { active: 0, pending_review: 0, claimed: 0 };
      items.forEach(i => { if (counts[i.status] !== undefined) counts[i.status]++; });

      const labels = ['Active', 'Pending', 'Claimed'];
      const values = [counts.active, counts.pending_review, counts.claimed];
      const colors = ['rgba(18,124,112,0.85)', 'rgba(201,138,46,0.85)', 'rgba(122,144,141,0.85)'];

      if (reportsChart) reportsChart.destroy();

      reportsChart = new Chart(document.getElementById('chart-reports'), {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: colors,
            borderColor: t.cardBg,
            borderWidth: 3,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '58%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: t.text, font: { size: 11 }, padding: 12 }
            }
          }
        }
      });
    }

function updatePreview() {
      const name = document.getElementById('inp-name').value.trim();
      const price = document.getElementById('inp-price').value;
      const cat = document.getElementById('inp-category').value;
      const cond = document.getElementById('inp-condition').value;

      document.getElementById('preview-name').textContent = name || 'Item Name';
      document.getElementById('preview-price').textContent =
        price ? '₱' + parseFloat(price).toLocaleString() : '₱ –';
      document.getElementById('preview-category').textContent = cat || 'Category';
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
      buildReportsChart(allListings);
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
          buildReportsChart(allListings);
          showToast('Deleted', 'Listing removed.', 'success');
        }
      );
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

      const newItem = {
        id: Date.now(),
        name,
        price: parseFloat(price),
        category: cat,
        condition,
        description: desc,
        quantity: qty,
        location,
        status: 'pending_review',
      };
      allListings.unshift(newItem);
      renderListings();
      buildReportsChart(allListings);

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

      showToast('Listing Added', 'Your listing is pending admin review.', 'success');
    }

    document.addEventListener('themeChanged', () => {
      if (!reportsChart) return;
      const t = getChartTheme();
      reportsChart.data.datasets[0].borderColor = t.cardBg;
      reportsChart.options.plugins.legend.labels.color = t.text;
      reportsChart.update('none');
    });

    document.addEventListener('DOMContentLoaded', function () {
      const descEl = document.getElementById('inp-desc');
      const counterEl = document.getElementById('desc-counter');
      descEl.addEventListener('input', function () {
        const n = this.value.length;
        counterEl.textContent = n + ' / 500';
        counterEl.className = 'char-counter' + (n >= 500 ? ' at-limit' : n >= 450 ? ' near-limit' : '');
      });

      ['inp-name', 'inp-price', 'inp-category', 'inp-condition'].forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
        document.getElementById(id).addEventListener('change', updatePreview);
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

      fetch('../data/mock-listings.json')
        .then(r => r.json())
        .then(items => {
          allListings = items;
          renderListings();
          buildReportsChart(items);
        })
        .catch(() => {
          document.getElementById('listings-list').innerHTML =
            '<p style="color:var(--text-muted);font-size:13px;">Could not load listings.</p>';
          showToast('Error', 'Failed to load listings.', 'error');
        });
    });
