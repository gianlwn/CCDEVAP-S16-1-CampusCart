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
  logout:    `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  package:   `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  laptop:    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  book:      `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  flask:     `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6v4l3.5 9.5A2 2 0 0 1 16.6 19H7.4a2 2 0 0 1-1.9-2.5L9 7V3z"/><line x1="6.5" y1="11" x2="17.5" y2="11"/></svg>`,
  shirt:     `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>`,
  bag:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  star:      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  tag:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  search:    `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  message:   `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  trash:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  edit:      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  close:     `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  overview:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  chart:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  check:     `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  alert:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  users:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  categories:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  eye:       `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  ban:       `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
  shield:    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  userSlash: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" y1="2" x2="2" y2="22"/></svg>`,
  image:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  help:      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

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
          <a href="../user-profile-dashboard/dashboard.html">
            <span class="nav-item-icon">${ICONS.overview}</span>Overview
          </a>
        </li>
        <li class="${a('userListings')}">
          <a href="../user-profile-dashboard/userListings.html">
            <span class="nav-item-icon">${ICONS.tag}</span>My Listings
          </a>
        </li>
        <li class="${a('claimed')}">
          <a href="../user-profile-dashboard/claimed.html">
            <span class="nav-item-icon">${ICONS.bag}</span>Claimed
          </a>
        </li>
        <li class="${a('ratings')}">
          <a href="../user-profile-dashboard/ratings.html">
            <span class="nav-item-icon">${ICONS.star}</span>Ratings
          </a>
        </li>
        <li class="${a('userProfile')}">
          <a href="../user-profile-dashboard/userProfile.html">
            <span class="nav-item-icon">${ICONS.user}</span>Profile
          </a>
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
          <a href="../admin-dashboard/adminDashboard.html">
            <span class="nav-item-icon">${ICONS.chart}</span>Admin Panel
          </a>
        </li>
        <li class="${a('listingApproval')}">
          <a href="../admin-dashboard/listingApproval.html">
            <span class="nav-item-icon">${ICONS.check}</span>Listings Approval
          </a>
        </li>
        <li class="${a('reports')}">
          <a href="../admin-dashboard/reports.html">
            <span class="nav-item-icon">${ICONS.alert}</span>Reports
          </a>
        </li>
        <li class="${a('users')}">
          <a href="../admin-dashboard/users.html">
            <span class="nav-item-icon">${ICONS.users}</span>Users
          </a>
        </li>
        <li class="${a('categories')}">
          <a href="../admin-dashboard/categories.html">
            <span class="nav-item-icon">${ICONS.categories}</span>Categories
          </a>
        </li>
        <li class="${a('admins')}">
          <a href="../admin-dashboard/admins.html">
            <span class="nav-item-icon">${ICONS.user}</span>Admins
          </a>
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
        <span class="nav-icon">${ICONS.chart}</span><span>Panel</span>
      </a>
      <a href="../admin-dashboard/listingApproval.html" class="${a('listingApproval')}">
        <span class="nav-icon">${ICONS.check}</span><span>Approval</span>
      </a>
      <a href="../admin-dashboard/reports.html" class="${a('reports')}">
        <span class="nav-icon">${ICONS.alert}</span><span>Reports</span>
      </a>
      <a href="../admin-dashboard/users.html" class="${a('users')}">
        <span class="nav-icon">${ICONS.users}</span><span>Users</span>
      </a>
      <a href="../admin-dashboard/categories.html" class="${a('categories')}">
        <span class="nav-icon">${ICONS.categories}</span><span>Categories</span>
      </a>
    `;
  } else {
    links = `
      <a href="../user-profile-dashboard/dashboard.html" class="${a('dashboard')}">
        <span class="nav-icon">${ICONS.overview}</span><span>Overview</span>
      </a>
      <a href="../user-profile-dashboard/userListings.html" class="${a('userListings')}">
        <span class="nav-icon">${ICONS.tag}</span><span>Listings</span>
      </a>
      <a href="../user-profile-dashboard/claimed.html" class="${a('claimed')}">
        <span class="nav-icon">${ICONS.bag}</span><span>Claimed</span>
      </a>
      <a href="../user-profile-dashboard/ratings.html" class="${a('ratings')}">
        <span class="nav-icon">${ICONS.star}</span><span>Ratings</span>
      </a>
      <a href="../user-profile-dashboard/userProfile.html" class="${a('userProfile')}">
        <span class="nav-icon">${ICONS.user}</span><span>Profile</span>
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
  const CAT_ICON = {
    Electronics: ICONS.laptop, Books: ICONS.book,
    'Lab Tools': ICONS.flask, Clothing: ICONS.shirt,
  };
  return `
    <div class="item-row">
      <div class="item-thumb">${CAT_ICON[item.category] || ICONS.package}</div>
      <div class="item-info">
        <p class="item-name">${item.name}</p>
        <p class="item-meta">${item.price} · ${item.category} · ${item.seller || ''}</p>
      </div>
      ${renderStars(item.rating)}
      <span class="badge-status ${cls}">${item.status}</span>
      <button class="btn-msg" title="Message seller">${ICONS.message}</button>
    </div>
  `;
}

function createRatingsRow(item) {
  const CAT_ICON = {
    Electronics: ICONS.laptop, Books: ICONS.book,
    'Lab Tools': ICONS.flask, Clothing: ICONS.shirt,
  };
  return `
    <div class="item-row" id="rating-row-${item.id}">
      <div class="item-thumb">${CAT_ICON[item.category] || ICONS.package}</div>
      <div class="item-info">
        <p class="item-name">${item.name}</p>
        <p class="item-meta">${item.price} · ${item.category}</p>
        ${item.review ? `<p class="item-review">"${item.review}"</p>` : ''}
      </div>
      ${renderStars(item.rating)}
      <div style="display:flex;gap:3px;flex-shrink:0;">
        <button class="btn-icon"        title="Edit"   onclick="editRating(${item.id})">${ICONS.edit}</button>
        <button class="btn-icon danger" title="Delete" onclick="deleteRating(${item.id})">${ICONS.trash}</button>
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

function createListingRow(item) {
  const CAT_ICON = {
    Electronics: ICONS.laptop, Books: ICONS.book,
    'Lab Tools': ICONS.flask, Clothing: ICONS.shirt, Others: ICONS.package,
  };
  const STATUS_LABEL = { active: 'Active', pending_review: 'Pending Review', claimed: 'Claimed' };
  return `
    <div class="listing-row" id="listing-${item.id}">
      <div class="listing-thumb">${CAT_ICON[item.category] || ICONS.package}</div>
      <div class="item-info">
        <p class="item-name">${item.name}</p>
        <p class="item-meta">₱${item.price} · ${item.category}</p>
      </div>
      <span class="badge-status ${item.status}">${STATUS_LABEL[item.status] || item.status}</span>
      <div style="display:flex;gap:3px;flex-shrink:0;">
        <button class="btn-icon" title="Edit">${ICONS.edit}</button>
        <button class="btn-icon danger" title="Delete">${ICONS.trash}</button>
      </div>
    </div>
  `;
}

function loadUserListingsRows(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '<p style="color:var(--text-muted);padding:16px 0;">Loading…</p>';

  fetch('../data/mock-listings.json')
    .then(r => r.json())
    .then(items => {
      if (!items.length) {
        el.innerHTML = `<div class="empty-state"><div class="empty-icon">🏷️</div><p>No listings yet.</p></div>`;
        return;
      }
      el.innerHTML = items.map(createListingRow).join('');
    })
    .catch(() => {
      el.innerHTML = '<p style="color:var(--text-muted);padding:16px 0;">Could not load listings.</p>';
    });
}
