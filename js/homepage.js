const CATEGORY_ICONS = {
  Electronics: ICONS.laptop, 
  Books: ICONS.book,
  'Lab Tools': ICONS.flask,  
  Clothing: ICONS.shirt, 
  Others: ICONS.package,
};
let allItems = [];
let activeFilter = 'all';

function renderGrid(items) {
  const grid = document.getElementById('item-grid');
  if (!grid) return; // Prevent errors if the element isn't in the DOM yet

  if (!items.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1">
        <div class="empty-icon-svg">${ICONS.search}</div>
        <p>No items found.</p>
      </div>`;
    return;
  }
  
  grid.innerHTML = items.map(item => `
    <div class="hp-item-card" onclick="viewItem(${item.id})">
      <div class="hp-item-thumb">${CATEGORY_ICONS[item.category] || ICONS.package}</div>
      <div class="hp-item-info">
        <p class="hp-item-name">${item.name}</p>
        <p class="hp-item-price">₱${item.price}</p>
      </div>
    </div>
  `).join('');
}

function filterBy(cat, btn) {
  document.querySelectorAll('.hp-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  activeFilter = cat;
  applyFilters();
}

function handleSearch() {
  applyFilters();
}

function applyFilters() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  const q = searchInput.value.toLowerCase().trim();
  let results = allItems;
  
  if (activeFilter !== 'all') {
    results = results.filter(i => i.category === activeFilter);
  }
  
  if (q) {
    results = results.filter(i => 
      i.name.toLowerCase().includes(q) || 
      (i.description?.toLowerCase() || '').includes(q) // Safe check to prevent crashes
    );
  }
  renderGrid(results);
}

function viewItem(id) {
  showToast('Item Details', 'Item detail page coming soon!', 'info');
}

document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSearch();
    });
  }

  fetch('../data/mock-listings.json')
    .then(r => {
      if (!r.ok) throw new Error('Network response was not ok');
      return r.json();
    })
    .then(items => {
      allItems = items.filter(i => i.status === 'active');
      const extras = [
        { id: 10, name: 'Graph Paper Notebook', price: 60,  category: 'Books',       status: 'active', description: 'Engineering graph pad', image: null },
        { id: 11, name: 'Soldering Iron Set',   price: 280, category: 'Electronics', status: 'active', description: 'Adjustable temperature', image: null },
        { id: 12, name: 'Safety Goggles',       price: 75,  category: 'Lab Tools',   status: 'active', description: 'Clear polycarbonate lens', image: null },
        { id: 13, name: 'Denim Jacket (M)',      price: 250, category: 'Clothing',    status: 'active', description: 'Barely worn, good condition', image: null },
        { id: 14, name: 'Thermodynamics Book',   price: 400, category: 'Books',       status: 'active', description: 'Cengel & Boles 9th ed', image: null },
        { id: 15, name: 'Breadboard + Wires',    price: 120, category: 'Electronics', status: 'active', description: '830 tie-point breadboard', image: null },
      ];
      allItems = [...allItems, ...extras];
      renderGrid(allItems);
    })
    .catch(() => showToast('Error', 'Could not load listings.', 'error'));
});