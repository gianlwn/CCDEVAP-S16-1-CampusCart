/* ============================================================
   CampusCart — Shared Components
   ============================================================ */

/* Feather-style SVG icons — stroke="currentColor" inherits nav accent color */
const ICONS = {
  logo:   `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  moon:   `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  sun:    `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  bell:   `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  cart:   `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  home:   `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  user:   `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  logout: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
};

/* Cleaner top nav for user dashboard pages */
function loadDashboardTopNav() {
  const html = `
    <nav class="top-nav">
      <div class="nav-brand">
        ${ICONS.logo}
        <span>CampusCart</span>
      </div>
      <div class="nav-icons">
        <button id="theme-toggle" onclick="toggleTheme()" title="Toggle theme">${ICONS.moon}</button>
        <button id="btn-notifications" title="Notifications" style="position:relative;">
          ${ICONS.bell}<span class="nav-badge">3</span>
        </button>
        <div class="nav-user-chip"
             onclick="window.location.href='../user-profile-dashboard/userProfile.html'"
             title="My Profile">
          <span class="nav-avatar">S</span>
          <span class="nav-username">Sky</span>
        </div>
      </div>
    </nav>
  `;
  document.getElementById('top-nav').innerHTML = html;
}

function loadTopNav() {
  const html = `
    <nav class="top-nav">
      <div class="nav-brand">
        ${ICONS.logo}
        <span>CampusCart</span>
      </div>
      <div class="nav-icons">
        <button id="theme-toggle" onclick="toggleTheme()" title="Toggle theme">${ICONS.moon}</button>
        <button id="btn-notifications" title="Notifications" style="position:relative;">
          ${ICONS.bell}<span class="nav-badge">3</span>
        </button>
        <button onclick="window.location.href='../homepage/cart.html'" title="Cart">${ICONS.cart}</button>
        <button onclick="window.location.href='../homepage/homepage.html'" title="Home">${ICONS.home}</button>
        <button onclick="window.location.href='../user-profile-dashboard/dashboard.html'" title="Profile">${ICONS.user}</button>
      </div>
    </nav>
  `;
  document.getElementById('top-nav').innerHTML = html;
}

function loadSideNav() {
  const cur = window.location.pathname;
  const a = (p) => cur.includes(p) ? 'active' : '';

  const html = `
    <aside class="side-nav">
      <ul>
        <li class="${a('dashboard')}">
          <a href="../user-profile-dashboard/dashboard.html">Overview</a>
        </li>
        <li class="${a('userListings')}">
          <a href="../user-profile-dashboard/userListings.html">My Listings</a>
        </li>
        <li class="${a('claimed')}">
          <a href="../user-profile-dashboard/claimed.html">Claimed</a>
        </li>
        <li class="${a('ratings')}">
          <a href="../user-profile-dashboard/ratings.html">Ratings</a>
        </li>
        <li class="${a('userProfile')}">
          <a href="../user-profile-dashboard/userProfile.html">Profile</a>
        </li>
      </ul>
      <button class="signout-btn" onclick="window.location.href='../login-path/login.html'">
        ${ICONS.logout} Sign Out
      </button>
    </aside>
  `;
  document.getElementById('side-nav').innerHTML = html;
}

function loadAdminSideNav() {
  const cur = window.location.pathname;
  const a = (p) => cur.includes(p) ? 'active' : '';

  const html = `
    <aside class="side-nav">
      <ul>
        <li class="${a('adminDashboard')}">
          <a href="../admin-dashboard/adminDashboard.html">Admin Panel</a>
        </li>
        <li class="${a('listingApproval')}">
          <a href="../admin-dashboard/listingApproval.html">Listings Approval</a>
        </li>
        <li class="${a('reports')}">
          <a href="../admin-dashboard/reports.html">Reports</a>
        </li>
        <li class="${a('users')}">
          <a href="../admin-dashboard/users.html">Users</a>
        </li>
        <li class="${a('categories')}">
          <a href="../admin-dashboard/categories.html">Categories</a>
        </li>
        <li class="${a('admins')}">
          <a href="../admin-dashboard/admins.html">Admins</a>
        </li>
      </ul>
      <button class="signout-btn" onclick="window.location.href='../login-path/login.html'">
        ${ICONS.logout} Sign Out
      </button>
    </aside>
  `;
  document.getElementById('side-nav').innerHTML = html;
}

function loadBottomNav(type) {
  const cur = window.location.pathname;
  const a = (p) => cur.includes(p) ? 'active' : '';
  let links = '';

  if (type === 'admin') {
    links = `
      <a href="../admin-dashboard/adminDashboard.html" class="${a('adminDashboard')}">
        <span class="nav-icon">📊</span><span>Panel</span>
      </a>
      <a href="../admin-dashboard/listingApproval.html" class="${a('listingApproval')}">
        <span class="nav-icon">✅</span><span>Approval</span>
      </a>
      <a href="../admin-dashboard/reports.html" class="${a('reports')}">
        <span class="nav-icon">⚠️</span><span>Reports</span>
      </a>
      <a href="../admin-dashboard/users.html" class="${a('users')}">
        <span class="nav-icon">👥</span><span>Users</span>
      </a>
      <a href="../admin-dashboard/categories.html" class="${a('categories')}">
        <span class="nav-icon">🗂️</span><span>Categories</span>
      </a>
    `;
  } else {
    links = `
      <a href="../user-profile-dashboard/dashboard.html" class="${a('dashboard')}">
        <span class="nav-icon">📋</span><span>Overview</span>
      </a>
      <a href="../user-profile-dashboard/userListings.html" class="${a('userListings')}">
        <span class="nav-icon">🏷️</span><span>Listings</span>
      </a>
      <a href="../user-profile-dashboard/claimed.html" class="${a('claimed')}">
        <span class="nav-icon">🛍️</span><span>Claimed</span>
      </a>
      <a href="../user-profile-dashboard/ratings.html" class="${a('ratings')}">
        <span class="nav-icon">⭐</span><span>Ratings</span>
      </a>
      <a href="../user-profile-dashboard/userProfile.html" class="${a('userProfile')}">
        <span class="nav-icon">👤</span><span>Profile</span>
      </a>
    `;
  }

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.innerHTML = links;
  document.body.appendChild(nav);
}

/* ---- Helpers ---- */

/* Read chart colors from CSS variables — single source of truth */
function getChartTheme() {
  const s = getComputedStyle(document.documentElement);
  const get = v => s.getPropertyValue(v).trim();
  return {
    accent:     get('--accent'),
    text:       get('--text'),
    grid:       get('--chart-grid'),
    axisBorder: get('--chart-axis'),
    barBg:      get('--chart-bar'),
    cardBg:     get('--card-bg'),
    barRgb:     get('--chart-bar-rgb'),
  };
}

function renderStars(rating, max = 5) {
  let html = '<div class="stars">';
  for (let i = 1; i <= max; i++) {
    html += `<span class="star${i <= rating ? ' filled' : ''}">★</span>`;
  }
  return html + '</div>';
}

function createClaimedRow(item) {
  const cls = item.status === 'completed' ? 'completed' : 'pending';
  return `
    <div class="item-row">
      <div class="item-thumb">📦</div>
      <div class="item-info">
        <p class="item-name">${item.name}</p>
        <p class="item-meta">${item.price} · ${item.category} · ${item.seller || ''}</p>
      </div>
      ${renderStars(item.rating)}
      <span class="badge-status ${cls}">${item.status}</span>
      <button class="btn-msg" title="Message seller">💬</button>
    </div>
  `;
}

function createRatingsRow(item) {
  return `
    <div class="item-row" id="rating-row-${item.id}">
      <div class="item-thumb">📦</div>
      <div class="item-info">
        <p class="item-name">${item.name}</p>
        <p class="item-meta">${item.price} · ${item.category}</p>
        ${item.review ? `<p class="item-review">"${item.review}"</p>` : ''}
      </div>
      ${renderStars(item.rating)}
      <div style="display:flex;gap:3px;flex-shrink:0;">
        <button class="btn-icon"        title="Edit"   onclick="editRating(${item.id})">✏️</button>
        <button class="btn-icon danger" title="Delete" onclick="deleteRating(${item.id})">🗑️</button>
      </div>
    </div>
  `;
}

function loadClaimedRows(containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = '<p style="color:var(--text-muted);padding:16px 0;">Loading…</p>';

  fetch('../data/mock-claimed.json')
    .then(r => r.json())
    .then(items => {
      if (!items.length) {
        el.innerHTML = `<div class="empty-state"><div class="empty-icon">🛍️</div><p>No claimed items yet.</p></div>`;
        return;
      }
      el.innerHTML = items.map(createClaimedRow).join('');
    })
    .catch(() => {
      el.innerHTML = '<p style="color:var(--text-muted);padding:16px 0;">Could not load items.</p>';
    });
}

function loadRatingsRows(containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = '<p style="color:var(--text-muted);padding:16px 0;">Loading…</p>';

  fetch('../data/mock-ratings.json')
    .then(r => r.json())
    .then(items => {
      if (!items.length) {
        el.innerHTML = `<div class="empty-state"><div class="empty-icon">⭐</div><p>No ratings yet.</p></div>`;
        return;
      }
      el.innerHTML = items.map(createRatingsRow).join('');
    })
    .catch(() => {
      el.innerHTML = '<p style="color:var(--text-muted);padding:16px 0;">Could not load ratings.</p>';
    });
}
