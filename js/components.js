/* ============================================================
   CampusCart — Shared Components
   ============================================================ */

function loadTopNav() {
  const html = `
    <nav class="top-nav">
      <div class="nav-brand">
        <span class="logo-icon">🛒</span>
        <span>CampusCart</span>
      </div>
      <div class="nav-icons">
        <button id="theme-toggle" onclick="toggleTheme()" title="Toggle theme">🌙</button>
        <button id="btn-notifications" title="Notifications" style="position:relative;">
          🔔<span class="nav-badge">3</span>
        </button>
        <button onclick="window.location.href='../homepage/cart.html'" title="Cart">🛒</button>
        <button onclick="window.location.href='../homepage/homepage.html'" title="Home">🏠</button>
        <button onclick="window.location.href='../user-profile-dashboard/dashboard.html'" title="Profile">👤</button>
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
            <span class="nav-icon">📋</span> Overview
          </a>
        </li>
        <li class="${a('userListings')}">
          <a href="../user-profile-dashboard/userListings.html">
            <span class="nav-icon">🏷️</span> My Listings
          </a>
        </li>
        <li class="${a('claimed')}">
          <a href="../user-profile-dashboard/claimed.html">
            <span class="nav-icon">🛍️</span> Claimed
          </a>
        </li>
        <li class="${a('ratings')}">
          <a href="../user-profile-dashboard/ratings.html">
            <span class="nav-icon">⭐</span> Ratings
          </a>
        </li>
        <li class="${a('userProfile')}">
          <a href="../user-profile-dashboard/userProfile.html">
            <span class="nav-icon">👤</span> Profile
          </a>
        </li>
      </ul>
      <button class="signout-btn" onclick="window.location.href='../login-path/login.html'">
        <span class="nav-icon">🚪</span> Sign Out
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
            <span class="nav-icon">📊</span> Admin Panel
          </a>
        </li>
        <li class="${a('listingApproval')}">
          <a href="../admin-dashboard/listingApproval.html">
            <span class="nav-icon">✅</span> Listings Approval
          </a>
        </li>
        <li class="${a('reports')}">
          <a href="../admin-dashboard/reports.html">
            <span class="nav-icon">⚠️</span> Reports
          </a>
        </li>
        <li class="${a('users')}">
          <a href="../admin-dashboard/users.html">
            <span class="nav-icon">👥</span> Users
          </a>
        </li>
        <li class="${a('categories')}">
          <a href="../admin-dashboard/categories.html">
            <span class="nav-icon">🗂️</span> Categories
          </a>
        </li>
        <li class="${a('admins')}">
          <a href="../admin-dashboard/admins.html">
            <span class="nav-icon">🔑</span> Admins
          </a>
        </li>
      </ul>
      <button class="signout-btn" onclick="window.location.href='../login-path/login.html'">
        <span class="nav-icon">🚪</span> Sign Out
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
