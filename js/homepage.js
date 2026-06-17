const CATEGORY_ICONS = {
  Electronics: ICONS.laptop,
  Books: ICONS.book,
  'Lab Tools': ICONS.flask,
  Clothing: ICONS.shirt,
  Others: ICONS.package,
};

const CATEGORY_BG = {
  Electronics: 'rgba(122,171,138,0.18)',
  Books: 'rgba(212,184,150,0.28)',
  'Lab Tools': 'rgba(122,171,215,0.18)',
  Clothing: 'rgba(210,160,60,0.14)',
  Others: 'rgba(158,144,132,0.18)',
};

const CONDITION_COLOR = {
  'Like new': '#42a364',
  'New': '#7aab8a',
  'Used': '#d4883a',
  'Good': '#7aaac8',
};

let allItems = [];
let activeFilter = 'all';

let _advConditions = [];
let _advMinPrice = 0;
let _advMaxPrice = Infinity;

function renderGrid(items) {
  const grid = document.getElementById('item-grid');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon-svg">${ICONS.search}</div>
        <p>No items found.</p>
      </div>`;
    return;
  }

  grid.innerHTML = items.map(item => {
    const bg = CATEGORY_BG[item.category] || CATEGORY_BG.Others;
    const cond = item.condition || 'Available';
    const dotColor = CONDITION_COLOR[cond] || '#9e9084';
    const seller = item.seller || 'Campus Seller';
    const icon = CATEGORY_ICONS[item.category] || ICONS.package;

    return `
      <div class="hp-item-card" onclick="viewItem(${item.id})">
        <div class="hp-item-thumb" style="background:${bg}">
          <span class="hp-condition-badge">
            <span class="hp-condition-dot" style="background:${dotColor}"></span>
            ${cond}
          </span>
          ${icon}
        </div>
        <div class="hp-item-info">
          <p class="hp-cat-label">${item.category}</p>
          <p class="hp-item-name">${item.name}</p>
          <p class="hp-item-seller">${ICONS.user} ${seller}</p>
          <div class="hp-item-footer">
            <p class="hp-item-price">₱${item.price}</p>
            <button class="hp-view-btn" onclick="event.stopPropagation();viewItem(${item.id})">Add to Cart</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function filterBy(cat, btn) {
  document.querySelectorAll('.hp-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  activeFilter = cat;
  applyFilters();
}

function handleSearch() { applyFilters(); }

function applyFilters() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;
  const q = searchInput.value.toLowerCase().trim();
  let results = allItems;
  if (activeFilter !== 'all') results = results.filter(i => i.category === activeFilter);
  if (q) results = results.filter(i =>
    i.name.toLowerCase().includes(q) ||
    (i.description?.toLowerCase() || '').includes(q)
  );
  if (_advConditions.length) results = results.filter(i => _advConditions.includes(i.condition));
  if (_advMinPrice > 0) results = results.filter(i => i.price >= _advMinPrice);
  if (_advMaxPrice < Infinity) results = results.filter(i => i.price <= _advMaxPrice);
  renderGrid(results);
}

function openFiltersPanel() {
  const existing = document.getElementById('hp-adv-filters');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.id = 'hp-adv-filters';
  panel.className = 'hp-adv-filters';

  const condOpts = ['New', 'Like new', 'Good', 'Used'];
  const checks = condOpts.map(c =>
    `<label class="hp-afp-check"><input type="checkbox" value="${c}" ${_advConditions.includes(c) ? 'checked' : ''}> ${c}</label>`
  ).join('');

  panel.innerHTML = `
    <div class="hp-afp-header">
      <span class="hp-afp-title">Advanced Filters</span>
      <button class="hp-afp-close" onclick="document.getElementById('hp-adv-filters').remove()">✕</button>
    </div>
    <div class="hp-afp-section">
      <p class="hp-afp-label">Condition</p>
      <div class="hp-afp-checks">${checks}</div>
    </div>
    <div class="hp-afp-section">
      <p class="hp-afp-label">Price Range (₱)</p>
      <div class="hp-afp-price-row">
        <input type="number" id="afp-min" placeholder="Min" min="0" value="${_advMinPrice || ''}">
        <span>–</span>
        <input type="number" id="afp-max" placeholder="Max" min="0" value="${_advMaxPrice === Infinity ? '' : _advMaxPrice}">
      </div>
    </div>
    <div class="hp-afp-footer">
      <button class="hp-afp-reset" onclick="resetAdvFilters()">Reset</button>
      <button class="hp-afp-apply" onclick="applyAdvFilters()">Apply</button>
    </div>
  `;

  document.querySelector('.hp-filters').insertAdjacentElement('afterend', panel);
}

function applyAdvFilters() {
  _advConditions = [...document.querySelectorAll('#hp-adv-filters input[type=checkbox]:checked')].map(c => c.value);
  _advMinPrice = parseFloat(document.getElementById('afp-min')?.value) || 0;
  _advMaxPrice = parseFloat(document.getElementById('afp-max')?.value) || Infinity;
  applyFilters();
  document.getElementById('hp-adv-filters')?.remove();
}

function resetAdvFilters() {
  _advConditions = [];
  _advMinPrice = 0;
  _advMaxPrice = Infinity;
  document.querySelectorAll('#hp-adv-filters input[type=checkbox]').forEach(c => c.checked = false);
  const minEl = document.getElementById('afp-min');
  const maxEl = document.getElementById('afp-max');
  if (minEl) minEl.value = '';
  if (maxEl) maxEl.value = '';
}

function viewItem(id) {
  showToast('Item Details', 'Item detail page coming soon!', 'info');
}

document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(); });

  fetch('../data/mock-listings.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(items => {
      allItems = items
        .filter(i => i.status === 'active')
        .map(i => ({
          ...i,
          seller: i.seller || 'Campus Seller',
          condition: i.condition || 'Used',
        }));

      const extras = [
        { id: 10, name: 'Graph Paper Notebook', price: 60, category: 'Books', status: 'active', condition: 'New', seller: 'Ana D.', description: 'Engineering graph pad' },
        { id: 11, name: 'Soldering Iron Set', price: 280, category: 'Electronics', status: 'active', condition: 'Like new', seller: 'Marco T.', description: 'Adjustable temperature' },
        { id: 12, name: 'Safety Goggles', price: 75, category: 'Lab Tools', status: 'active', condition: 'Good', seller: 'Reina V.', description: 'Clear polycarbonate lens' },
        { id: 13, name: 'Denim Jacket (M)', price: 250, category: 'Clothing', status: 'active', condition: 'Used', seller: 'Cleo R.', description: 'Barely worn, good condition' },
        { id: 14, name: 'Thermodynamics Book', price: 400, category: 'Books', status: 'active', condition: 'Good', seller: 'Bea L.', description: 'Cengel & Boles 9th ed' },
        { id: 15, name: 'Breadboard + Wires', price: 120, category: 'Electronics', status: 'active', condition: 'Like new', seller: 'Juno P.', description: '830 tie-point breadboard' },
      ];
      allItems = [...allItems, ...extras];
      renderGrid(allItems);
    })
    .catch(() => showToast('Error', 'Could not load listings.', 'error'));
});
