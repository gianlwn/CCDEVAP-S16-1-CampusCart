function handleAdminSignOut() {
  logoutAPI();
  localStorage.removeItem("session_email");
  localStorage.removeItem("session_role");
  localStorage.removeItem("session_user_id");
  localStorage.removeItem("campuscart-theme");
  sessionStorage.setItem('cc_signout', '1');
  window.location.replace('../login-path/login.html');
}

function renderPagination(containerId, total, currentPage, onPageChange, itemsPerPage,) {
  const totalPages = Math.ceil(total / itemsPerPage);

  const existing = document.getElementById(
    `${containerId}-pagination`,
  );

  if (existing) {
    existing.remove();
  }

  if (totalPages <= 1) {
    return;
  }

  const pag = document.createElement("div");
  pag.id = `${containerId}-pagination`;

  pag.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    margin-top: 18px;
    flex-wrap: wrap;
  `;

  const createButton = (
    label,
    page,
    disabled = false,
  ) => {
    const button = document.createElement("button");

    button.textContent = label;
    button.disabled = disabled;

    button.style.cssText = `
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: ${
        page === currentPage
          ? "var(--accent)"
          : "var(--card-bg)"
      };
      color: ${
        page === currentPage
          ? "#fff"
          : "var(--text)"
      };
      cursor: ${disabled ? "default" : "pointer"};
      font-size: 12px;
      font-family: inherit;
      opacity: ${disabled ? "0.45" : "1"};
      transition: all var(--transition);
    `;

    if (!disabled && page !== currentPage) {
      button.addEventListener("click", () => {
        onPageChange(page);
      });
    }

    return button;
  };

  const createEllipsis = () => {
    const ellipsis = document.createElement("span");

    ellipsis.textContent = "…";

    ellipsis.style.cssText = `
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--card-bg);
      color: var(--text-muted);
      font-size: 12px;
      font-family: inherit;
      user-select: none;
    `;

    return ellipsis;
  };

  pag.appendChild(
    createButton(
      "‹ Prev",
      currentPage - 1,
      currentPage === 1,
    ),
  );

  getCompactPaginationItems(
    totalPages,
    currentPage,
  ).forEach((item) => {
    if (item === "ellipsis") {
      pag.appendChild(createEllipsis());
      return;
    }

    pag.appendChild(
      createButton(String(item), item),
    );
  });

  pag.appendChild(
    createButton(
      "Next ›",
      currentPage + 1,
      currentPage === totalPages,
    ),
  );
  
  appendGoToPageControl(
    pag,
    totalPages,
    currentPage,
    onPageChange,
  );
  
  document.getElementById(containerId).after(pag);
}

function getItemsPerPage(type) {
  const w = window.innerWidth;
  switch (type) {
    case 'users':
    case 'admins':
      return w >= 1024 ? 10 : w >= 768 ? 8 : 5;
    case 'listings':
      return w >= 1200 ? 12 : w >= 900 ? 9 : w >= 600 ? 6 : 4;
    case 'reports':
      return w >= 1024 ? 8 : w >= 768 ? 5 : 3;
    case 'categories':
      return getCategoriesPerPage();
    default:
      return 10;
  }
}

function getCategoriesPerPage() {
  const grid = document.getElementById('category-grid');
  if (!grid) return 12;

  const gap = 18;
  const stacked = window.innerWidth <= 480;
  const cardMinWidth = stacked ? window.innerWidth : 280;
  const cardHeight = stacked ? 108 : 64;

  const gridWidth = grid.clientWidth || window.innerWidth;
  const columns = Math.max(1, Math.floor((gridWidth + gap) / (cardMinWidth + gap)));

  const top = grid.getBoundingClientRect().top;
  const bottomReserve = stacked ? 160 : 110;
  const availableHeight = window.innerHeight - top - bottomReserve;
  const rows = Math.max(1, Math.floor((availableHeight + gap) / (cardHeight + gap)));

  return Math.max(columns * rows, columns);
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

function updateCounter(selector, label, count) {
  const el = document.querySelector(selector);
  if (el) el.textContent = `${label}: ${count}`;
}

const _resizeHandlers = {};
let _resizeDebounce = null;
window.addEventListener('resize', () => {
  clearTimeout(_resizeDebounce);
  _resizeDebounce = setTimeout(() => { Object.values(_resizeHandlers).forEach(fn => fn()); }, 200);
});
function setupResizePagination(type, resetFn) {
  _resizeHandlers[type] = resetFn;
}

function openModal(html) {
  document.getElementById('cc-modal-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'cc-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:500;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px);';
  const box = document.createElement('div');
  box.style.cssText = 'background:var(--card-bg);border:1px solid var(--border);border-radius:var(--radius);padding:24px;min-width:320px;max-width:460px;width:90%;box-shadow:var(--shadow-card);';
  box.innerHTML = html;
  overlay.appendChild(box);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function closeModal() {
  document.getElementById('cc-modal-overlay')?.remove();
}

const MS = {
  label: 'display:block;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.5px;margin-bottom:4px;',
  input: 'display:block;width:100%;padding:8px 10px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;',
  select: 'display:block;width:100%;padding:8px 10px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;cursor:pointer;',
  primary: 'padding:8px 18px;border:none;background:var(--accent);border-radius:999px;cursor:pointer;color:#fff;font-size:13px;font-weight:700;font-family:inherit;',
  cancel: 'padding:8px 18px;border:1px solid var(--border);background:transparent;border-radius:999px;cursor:pointer;color:var(--text);font-size:13px;font-family:inherit;',
  footer: 'display:flex;justify-content:flex-end;gap:8px;margin-top:20px;',
  title: 'margin:0 0 16px;font-size:15px;font-weight:700;color:var(--text);',
  body: 'display:flex;flex-direction:column;gap:14px;',
  row: 'display:flex;flex-direction:column;gap:4px;',
};

// Filters the full data array (not just what's currently rendered on the
// visible page) so search results aren't limited to the current pagination
// page. `textFn` extracts the searchable text from one data item.
function filterBySearch(data, textFn) {
  const q = (document.querySelector('.search-input-field')?.value || '').toLowerCase().trim();
  if (!q) return data;
  return data.filter(item => textFn(item).toLowerCase().includes(q));
}

// Binds the search input/button once (call from a page's display*() setup,
// not from its render*Page() function, so listeners aren't re-added on every
// re-render). `onSearch` should reset that page's current-page var to 1 and
// re-render, so pagination reflects the filtered result set from page 1.
function initSearch(onSearch) {
  const input = document.querySelector('.search-input-field');
  const btn = document.querySelector('.search-glass-btn');
  if (!input) return;

  input.addEventListener('input', onSearch);
  if (btn) btn.addEventListener('click', onSearch);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') onSearch(); });
}

function filterUsers() {
  const statusVal = (document.querySelector('.status-filter-dropdown')?.value || 'all').toLowerCase();
  const byStatus = statusVal === 'all' ? _usersData : _usersData.filter(u => u.status === statusVal);
  return filterBySearch(byStatus, u => `${u.username} ${u.email}`);
}

function initUserSearch(onSearch) {
  initSearch(onSearch);
  const select = document.querySelector('.status-filter-dropdown');
  if (select) select.addEventListener('change', onSearch);
}

function renderAccessDenied() {
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:inherit;">
      <div style="max-width:420px;">
        <div style="color:var(--accent,#0e8878);margin-bottom:16px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="9.5" y1="12" x2="14.5" y2="12"/></svg>
        </div>
        <h1 style="font-size:22px;margin:0 0 10px;">Access Denied</h1>
        <p style="color:var(--text-muted,#667);font-size:14px;line-height:1.5;margin:0 0 22px;">
          You don't have permission to view the admin dashboard. This area is restricted to administrator accounts.
        </p>
        <a href="../user-profile-dashboard/dashboard.html" style="display:inline-block;padding:10px 20px;background:var(--accent,#0e8878);color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Back to My Dashboard</a>
      </div>
    </div>`;
}

// Blocks non-admin accounts from any admin page. Called first by every admin
// page's init; throwing halts the rest of that page's inline script.
function guardAdmin() {
  if (localStorage.getItem("session_role") === "admin") return;
  renderAccessDenied();
  throw new Error("access_denied");
}

function loadAdminSideNav(page) {
  guardAdmin();

  const html = `
    <div class="nav-links">
      <a href="adminDashboard.html"   class="nav-item">${ICONS.chart}<span class="nav-item-label">Admin Dashboard</span></a>
      <a href="listingApproval.html"  class="nav-item">${ICONS.check}<span class="nav-item-label">Listings Approval</span></a>
      <a href="reports.html"          class="nav-item">${ICONS.alert}<span class="nav-item-label">Reports</span></a>
      <a href="users.html"            class="nav-item">${ICONS.users}<span class="nav-item-label">Users</span></a>
      <a href="categories.html"       class="nav-item">${ICONS.categories}<span class="nav-item-label">Categories</span></a>
      <a href="admins.html"           class="nav-item">${ICONS.user}<span class="nav-item-label">Admins</span></a>
    </div>
    <div class="sign-out-box">
      <button class="sign-out-btn" onclick="handleAdminSignOut()">${ICONS.logout}<span class="nav-item-label">Sign Out</span></button>
    </div>
  `;

  const sidebar = document.getElementById('admin-side-nav');
  sidebar.innerHTML = html;

  const activeLink = sidebar.querySelector(`a[href="${page}"]`);
  if (activeLink) activeLink.classList.add('active');
}

let _adminPage = 1;
let _adminsData = [];

function renderAdminPage() {
  const container = document.getElementById('admins-stack-list');
  if (!container) return;
  const filtered = filterBySearch(_adminsData, a => `${a.username} ${a.email}`);
  const perPage = getItemsPerPage('admins');
  const start = (_adminPage - 1) * perPage;
  const slice = filtered.slice(start, start + perPage);

  if (!_adminsData.length) {
    container.innerHTML = `<div class="empty-msg">No administrators found. Click "Add Administrator" to create one.</div>`;
    updateCounter('.admins-counter-text', 'Current Admins', 0);
    return;
  }
  if (!filtered.length) {
    container.innerHTML = `<div class="empty-msg">No administrators match your search.</div>`;
    updateCounter('.admins-counter-text', 'Current Admins', _adminsData.length);
    return;
  }
  container.innerHTML = slice.map(admin => `
      <div class="admin-identity-row-card responsive-row-card">
        <div class="avatar-wireframe-box"></div>
        <div class="admin-text-details">
          <span class="admin-display-name">${escapeHtml(admin.username)}</span>
          <span class="admin-display-email">${escapeHtml(admin.email)}</span>
        </div>
        <div class="action-button-group">
          <button class="action-trigger revoke-trigger-btn"
            onclick="handleAdmin('revoke','${admin.user_id}')">
            ${ICONS.userSlash} Revoke
          </button>
        </div>
      </div>`).join('');

  updateCounter('.admins-counter-text', 'Current Admins', _adminsData.length);
  renderPagination('admins-stack-list', filtered.length, _adminPage, p => { _adminPage = p; renderAdminPage(); }, perPage);
}

function displayAdmins() {
  fetchAdmins().then(admins => {
    _adminsData = admins;
    renderAdminPage();
  }).catch(() => {
    showToast('Failed to load admins', '', 'error');
  });
  setupResizePagination('admins', () => { _adminPage = 1; renderAdminPage(); });
  initSearch(() => { _adminPage = 1; renderAdminPage(); });

  const addBtn = document.querySelector('.add-admin-action-btn');
  if (addBtn) addBtn.onclick = () => openAddAdminModal();
}

function openAddAdminModal() {
  openModal(`
    <h3 style="${MS.title}">Add Administrator</h3>
    <div style="${MS.body}">
      <div style="${MS.row}">
        <label style="${MS.label}">School Email</label>
        <input id="modal-new-admin-email" type="email" placeholder="account@dlsu.edu.ph" style="${MS.input}">
      </div>
    </div>
    <div style="${MS.footer}">
      <button onclick="closeModal()" style="${MS.cancel}">Cancel</button>
      <button onclick="saveNewAdmin()" style="${MS.primary}">Add Administrator</button>
    </div>
  `);
}

function saveNewAdmin() {
  const email = document.getElementById('modal-new-admin-email')?.value.trim();
  if (!email) { showToast('Error', 'Email is required.', 'error'); return; }
  if (!email.toLowerCase().endsWith('.edu.ph')) {
    showToast('Error', 'Please enter a valid .edu.ph address.', 'error');
    return;
  }
  promoteAdminAPI(email).then(({ ok, status, data }) => {
    if (!ok) {
      const msg = status === 404
        ? 'No account found with that email. The user must sign up first.'
        : data?.error === 'max_admins_reached'
          ? 'Cannot add administrator: the maximum of 15 administrators has been reached.'
          : status === 409
            ? 'This user is already an administrator.'
            : 'Could not add administrator.';
      showToast('Error', msg, 'error');
      return;
    }
    closeModal();
    _adminsData.unshift(data);
    renderAdminPage();
    showToast('Added', `${data.username} has been added as an administrator.`, 'success');
  }).catch(() => showToast('Error', 'Could not add administrator.', 'error'));
}

function handleAdmin(action, userId) {
  const admin = _adminsData.find(a => a.user_id === userId);
  if (!admin) return;

  if (action === 'revoke') {
    showConfirm(
      `Revoke Admin Access?`,
      `Revoke admin access for ${admin.username}? They will no longer be able to manage the platform.`,
      () => {
        revokeAdminAPI(userId).then(({ ok }) => {
          if (!ok) { showToast('Error', 'Failed to revoke admin access. Please try again.', 'error'); return; }
          _adminsData = _adminsData.filter(a => a.user_id !== userId);
          renderAdminPage();
          showToast('Access Revoked', `${admin.username}'s admin access has been revoked.`, 'warning');
        }).catch(() => showToast('Error', 'Failed to revoke admin access. Please try again.', 'error'));
      },
      'Revoke', 'revoke'
    );
  }
}

let _usersPage = 1;
let _usersData = [];

const _USER_STATUS_META = {
  active: { pill: 'pill-status-active', label: 'Active' },
  suspended: { pill: 'pill-status-suspended', label: 'Suspended' },
  banned: { pill: 'pill-status-banned', label: 'Banned' },
};

function renderUsersPage() {
  const container = document.getElementById('users-stack-list');
  if (!container) return;

  const filtered = filterUsers();
  const perPage = getItemsPerPage('users');
  const start = (_usersPage - 1) * perPage;
  const usersSlice = filtered.slice(start, start + perPage);

  if (!_usersData.length) {
    container.innerHTML = `<div class="empty-msg">No users found.</div>`;
  } else if (!filtered.length) {
    container.innerHTML = `<div class="empty-msg">No users match your search.</div>`;
  } else {
    container.innerHTML = usersSlice.map(user => {
      const meta = _USER_STATUS_META[user.status] || _USER_STATUS_META.active;
      const warningCount = user.warning_count || 0;
      return `
        <div class="user-identity-row-card responsive-row-card" data-user-id="${user.user_id}">
          <div class="avatar-wireframe-box"></div>
          <div class="user-text-details">
            <div class="user-name-row">
              <span class="user-display-name">${escapeHtml(user.username)}</span>
              ${user.role === 'admin' ? `<span class="badge-pill pill-role-admin">Admin</span>` : ''}
            </div>
            <span class="user-display-email">${escapeHtml(user.email)}</span>
          </div>
          <div class="user-info-extra">
            <span class="info-label">Joined:</span>
            <span class="info-value">${user.dateJoined}</span>
          </div>
          <div class="user-right-controls">
            <div class="user-status-group">
              <span class="badge-pill user-status-pill ${meta.pill}">${meta.label}</span>
              ${warningCount > 0 ? `<span class="badge-pill pill-warning-count">${warningCount} Warning${warningCount > 1 ? 's' : ''}</span>` : ''}
            </div>
            <div class="action-button-group">
              <button class="action-trigger edit-trigger-btn"
                onclick="handleUser('edit','${user.user_id}',this)">
                ${ICONS.edit} Edit
              </button>
              <div class="button-inner-divider"></div>
              <button class="action-trigger view-trigger-btn"
                onclick="handleUser('view','${user.user_id}',this)">
                ${ICONS.eye} View
              </button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  updateCounter('.users-counter-text', 'Total Users', _usersData.length);
  renderPagination('users-stack-list', filtered.length, _usersPage, p => { _usersPage = p; renderUsersPage(); }, perPage);
  setupResizePagination('users', () => { _usersPage = 1; renderUsersPage(); });
}

function displayUsers() {
  fetchUsers().then(users => {
    _usersData = users;
    renderUsersPage();
  }).catch(() => {
    showToast('Failed to load users', '', 'error');
  });
  setupResizePagination('users', () => { _usersPage = 1; renderUsersPage(); });
  initUserSearch(() => { _usersPage = 1; renderUsersPage(); });
}

function handleUser(action, userId, btn) {
  const user = _usersData.find(u => u.user_id === userId);
  if (!user) return;

  if (action === 'view') {
    const warningCount = user.warning_count || 0;
    openModal(`
      <h3 style="${MS.title}">User Profile</h3>
      <div style="${MS.body}">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:52px;height:52px;border-radius:50%;background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;color:var(--accent);flex-shrink:0;">${escapeHtml(user.username.charAt(0).toUpperCase())}</div>
          <div>
            <div style="font-weight:700;font-size:15px;color:var(--text);margin-bottom:2px;">${escapeHtml(user.username)}${user.role === 'admin' ? ' <span class="badge-pill pill-role-admin">Admin</span>' : ''}</div>
            <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(user.email)}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;padding-top:4px;">
          <div style="${MS.row}"><span style="${MS.label}">Joined</span><span style="font-size:13px;color:var(--text);font-weight:600;">${user.dateJoined}</span></div>
          <div style="${MS.row}"><span style="${MS.label}">Status</span><span style="font-size:13px;color:var(--text);font-weight:600;">${(_USER_STATUS_META[user.status] || _USER_STATUS_META.active).label}</span></div>
          <div style="${MS.row}"><span style="${MS.label}">Warnings</span><span style="font-size:13px;font-weight:600;color:${warningCount > 0 ? 'var(--warning-text)' : 'var(--text)'};">${warningCount}</span></div>
        </div>
      </div>
      <div style="${MS.footer}">
        <button onclick="closeModal()" style="${MS.primary}">Close</button>
      </div>
    `);

  } else if (action === 'edit') {
    renderUserEditModal(userId);
  }
}

function renderUserEditModal(userId) {
  const user = _usersData.find(u => u.user_id === userId);
  if (!user) return;
  const meta = _USER_STATUS_META[user.status] || _USER_STATUS_META.active;
  const warningCount = user.warning_count || 0;

  openModal(`
    <h3 style="${MS.title}">Edit User</h3>
    <div style="${MS.body}">
      <div style="${MS.row}">
        <label style="${MS.label}">User</label>
        <div style="font-size:13px;color:var(--text);font-weight:600;">${escapeHtml(user.username)}</div>
        <div style="font-size:11px;color:var(--text-muted);">${escapeHtml(user.email)}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div style="${MS.row}">
          <span style="${MS.label}">Status</span>
          <span class="badge-pill ${meta.pill}" style="width:fit-content;">${meta.label}</span>
        </div>
        <div style="${MS.row}">
          <span style="${MS.label}">Warnings</span>
          <span style="font-size:14px;font-weight:700;color:${warningCount > 0 ? 'var(--warning-text)' : 'var(--text)'};">${warningCount}</span>
        </div>
      </div>
      <div style="${MS.row}">
        <label style="${MS.label}">Take Action</label>
        <div class="user-action-choices">
          <button type="button" class="user-action-btn action-warn" onclick="handleUserAction('warning','${userId}')">${ICONS.alert}<span>Add Warning</span></button>
          <button type="button" class="user-action-btn action-suspend" onclick="handleUserAction('suspend','${userId}')" ${user.status === 'suspended' ? 'disabled' : ''}>${ICONS.userSlash}<span>Issue Suspension</span></button>
          <button type="button" class="user-action-btn action-ban" onclick="handleUserAction('ban','${userId}')" ${user.status === 'banned' ? 'disabled' : ''}>${ICONS.ban}<span>Issue Ban</span></button>
          ${user.status !== 'active' ? `<button type="button" class="user-action-btn action-reactivate" onclick="handleUserAction('active','${userId}')">${ICONS.check}<span>Reactivate</span></button>` : ''}
        </div>
      </div>
    </div>
    <div style="${MS.footer}">
      <button onclick="closeModal()" style="${MS.cancel}">Close</button>
    </div>
  `);
}

function handleUserAction(action, userId) {
  const user = _usersData.find(u => u.user_id === userId);
  if (!user) return;

  if (action === 'warning') {
    issueUserWarningAPI(userId).then(({ ok, data }) => {
      if (!ok) {
        showToast('Error', 'Failed to issue warning. Please try again.', 'error');
        return;
      }
      user.warning_count = data.warning_count;
      if (data.autoSuspended) user.status = 'suspended';
      renderUsersPage();
      renderUserEditModal(userId);
      showToast(
        data.autoSuspended ? 'Auto-Suspended' : 'Warning Issued',
        data.autoSuspended
          ? `${user.username} has been automatically suspended after 3 warnings.`
          : `A warning has been added to ${user.username}'s account.`,
        data.autoSuspended ? 'error' : 'warning',
      );
    }).catch(() => showToast('Error', 'Failed to issue warning. Please try again.', 'error'));
    return;
  }

  const confirmMap = {
    suspend: { title: `Suspend ${user.username}?`, msg: 'This will temporarily restrict their account.', ok: 'Suspend', icon: 'ban', status: 'suspended', toastType: 'warning' },
    ban: { title: `Ban ${user.username}?`, msg: 'This will restrict their account and prevent them from using CampusCart.', ok: 'Ban', icon: 'ban', status: 'banned', toastType: 'error' },
    active: { title: `Reactivate ${user.username}?`, msg: 'This will restore full access to their account.', ok: 'Reactivate', icon: 'unban', status: 'active', toastType: 'success' },
  };
  const cfg = confirmMap[action];
  if (!cfg) return;

  showConfirm(cfg.title, cfg.msg, () => {
    updateUserStatusAPI(userId, cfg.status).then(({ ok }) => {
      if (!ok) {
        showToast('Error', 'Failed to update the user. Please try again.', 'error');
        return;
      }
      user.status = cfg.status;
      renderUsersPage();
      renderUserEditModal(userId);
      showToast('Updated', `${user.username}'s account has been ${cfg.status === 'active' ? 'reactivated' : cfg.status}.`, cfg.toastType);
    }).catch(() => showToast('Error', 'Failed to update the user. Please try again.', 'error'));
  }, cfg.ok, cfg.icon);
}

let _approvalPage = 1;
let _approvalListings = [];

function renderApprovalPage() {
  const container = document.getElementById('approval-grid');
  if (!container) return;
  const filtered = filterBySearch(
    _approvalListings,
    l => `${l.name} ${l.seller} ${l.condition} ${(l.categories || [l.category]).join(' ')}`,
  );
  const perPage = getItemsPerPage('listings');
  const start = (_approvalPage - 1) * perPage;
  const slice = filtered.slice(start, start + perPage);

  if (!_approvalListings.length) {
    container.innerHTML = `<div class="empty-msg">No listings needed for approval.</div>`;
    updateCounter('.pending-count', 'Pending Approval', 0);
    return;
  }
  if (!filtered.length) {
    container.innerHTML = `<div class="empty-msg">No listings match your search.</div>`;
    updateCounter('.pending-count', 'Pending Approval', _approvalListings.length);
    return;
  }
  container.innerHTML = slice.map(listing => {
    const thumb = resolveImageSrc(listing.images[0]);
    return `
    <div class="listing-card" id="listing-card-${listing.id}">
      <div class="card-top">
        <div class="listing-image${thumb ? ' has-image' : ''}"${thumb ? ` style="background-image:url('${thumb}');background-size:cover;background-position:center;"` : ''}></div>
        <div class="listing-info">
          <h2>${escapeHtml(listing.name)}</h2>
          <p>PHP ${listing.price.toFixed(2)}</p>
          <p>${escapeHtml(listing.seller)}</p>
          <span class="status-badge">Pending Approval</span>
        </div>
      </div>
      <button class="view-details-btn" onclick="viewListingDetails('${listing.id}')">${ICONS.eye} View Details</button>
      <div class="listing-actions">
        <button class="approve-btn" onclick="handleApproval('approve','${listing.id}',this)">${ICONS.check} Approve</button>
        <button class="reject-btn"  onclick="handleApproval('reject', '${listing.id}',this)">${ICONS.close} Reject</button>
      </div>
    </div>`;
  }).join('');

  updateCounter('.pending-count', 'Pending Approval', _approvalListings.length);
  renderPagination('approval-grid', filtered.length, _approvalPage, p => { _approvalPage = p; renderApprovalPage(); }, perPage);
}

function displayListingApprovals() {
  fetchPendingListings().then(listings => {
    _approvalListings = listings;
    renderApprovalPage();
  }).catch(() => {
    showToast('Failed to load listings', '', 'error');
  });
  setupResizePagination('listings', () => { _approvalPage = 1; renderApprovalPage(); });
  initSearch(() => { _approvalPage = 1; renderApprovalPage(); });
}

function viewListingDetails(listingId) {
  const listing = _approvalListings.find(l => l.id === listingId);
  if (!listing) return;
  const photosHtml = listing.images.length
    ? listing.images.map((src, i) =>
        `<img src="${resolveImageSrc(src)}" alt="Photo ${i + 1}" style="width:72px;height:72px;border-radius:var(--radius-sm);object-fit:cover;border:1px solid var(--border);">`
      ).join('')
    : `<div style="width:72px;height:72px;border-radius:var(--radius-sm);background:var(--accent-light);display:flex;align-items:center;justify-content:center;color:var(--accent);font-size:10px;font-weight:700;">No Photo</div>`;
  openModal(`
    <h3 style="${MS.title}">Listing Details</h3>
    <div style="${MS.body}">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px;">${photosHtml}</div>
      <div style="${MS.row}"><span style="${MS.label}">Product Name</span><span style="font-size:14px;font-weight:700;color:var(--text);">${escapeHtml(listing.name)}</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div style="${MS.row}"><span style="${MS.label}">Price</span><span style="font-size:13px;color:var(--text);font-weight:600;">₱${listing.price.toFixed(2)}</span></div>
        <div style="${MS.row}"><span style="${MS.label}">Category</span><span style="font-size:13px;color:var(--text);">${(listing.categories || [listing.category]).map(escapeHtml).join(", ")}</span></div>
        <div style="${MS.row}"><span style="${MS.label}">Condition</span><span style="font-size:13px;color:var(--text);">${escapeHtml(listing.condition)}</span></div>
        <div style="${MS.row};grid-column:1/-1;"><span style="${MS.label}">Seller</span><span style="font-size:13px;color:var(--text);">${escapeHtml(listing.seller)}</span></div>
        <div style="${MS.row};grid-column:1/-1;"><span style="${MS.label}">Description</span><span style="font-size:13px;color:var(--text);line-height:1.5;">${escapeHtml(listing.description || 'No description provided.')}</span></div>
      </div>
    </div>
    <div style="${MS.footer}">
      <button onclick="closeModal()" style="${MS.cancel}">Close</button>
      <button onclick="closeModal();handleApproval('approve','${listing.id}',document.querySelector('#listing-card-${listing.id} .approve-btn'))" style="${MS.primary}">Approve</button>
    </div>
  `);
}

function handleApproval(action, listingId, btn) {
  const status = action === 'approve' ? 'active' : 'rejected';
  const actionButtons = btn.closest('.listing-actions').querySelectorAll('button');
  actionButtons.forEach(b => b.disabled = true);

  const listingName = (_approvalListings.find(l => l.id === listingId) || {}).name || 'Listing';

  updateListingStatusAPI(listingId, status).then(({ ok }) => {
    if (!ok) {
      showToast('Error', 'Failed to update the listing. Please try again.', 'error');
      actionButtons.forEach(b => b.disabled = false);
      return;
    }
    _approvalListings = _approvalListings.filter(l => l.id !== listingId);
    const perPage = getItemsPerPage('listings');
    const maxPage = Math.max(1, Math.ceil(_approvalListings.length / perPage));
    if (_approvalPage > maxPage) _approvalPage = maxPage;
    renderApprovalPage();
    if (action === 'approve') {
      showToast('Approved', `${listingName} has been approved.`, 'success');
    } else {
      showToast('Rejected', `${listingName} has been rejected.`, 'error');
    }
  });
}

let _catPage = 1;
let _categoriesData = [];

function renderCategoryPage() {
  const container = document.getElementById('category-grid');
  if (!container) return;

  const filtered = filterBySearch(_categoriesData, c => c.category_name);
  const perPage = getItemsPerPage('categories');
  const start = (_catPage - 1) * perPage;
  const slice = filtered.slice(start, start + perPage);

  if (!_categoriesData.length) {
    container.innerHTML = `<div class="empty-msg">No categories found. Click "+ Add New Category" to create one.</div>`;
    return;
  }
  if (!filtered.length) {
    container.innerHTML = `<div class="empty-msg">No categories match your search.</div>`;
    return;
  }

  container.innerHTML = slice.map(category => {
    const name = escapeHtml(category.category_name);
    return `
    <div class="category-card">
      <div class="category-info">
        <h2 title="${name}">${name}</h2>
      </div>
      <div class="category-actions">
        <button class="edit-btn"   onclick="handleCategory('edit',  '${category.category_id}')">${ICONS.edit}  Edit</button>
        <button class="delete-btn" onclick="handleCategory('delete','${category.category_id}')">${ICONS.trash} Delete</button>
      </div>
    </div>
  `;
  }).join('');

  renderPagination('category-grid', filtered.length, _catPage, (p) => { _catPage = p; renderCategoryPage(); }, perPage);
}

function displayCategories() {
  fetchCategories().then(categories => {
    _categoriesData = categories;
    renderCategoryPage();
  }).catch(() => {
    showToast('Failed to load categories', '', 'error');
  });

  const addBtn = document.querySelector('.add-category-btn');
  if (addBtn) addBtn.onclick = () => openAddCategoryModal();
  setupResizePagination('categories', () => { _catPage = 1; renderCategoryPage(); });
  initSearch(() => { _catPage = 1; renderCategoryPage(); });
}

function openAddCategoryModal() {
  openModal(`
    <h3 style="${MS.title}">Add New Category</h3>
    <div style="${MS.body}">
      <div style="${MS.row}">
        <label style="${MS.label}">Category Name</label>
        <input id="modal-cat-name" type="text" placeholder="e.g. Lab Supplies" style="${MS.input}">
      </div>
    </div>
    <div style="${MS.footer}">
      <button onclick="closeModal()" style="${MS.cancel}">Cancel</button>
      <button onclick="saveNewCategory()" style="${MS.primary}">Add Category</button>
    </div>
  `);
}

function saveNewCategory() {
  const name = document.getElementById('modal-cat-name')?.value.trim();
  if (!name) { showToast('Error', 'Category name cannot be empty.', 'error'); return; }
  createCategoryAPI(name).then(({ ok, status, data }) => {
    if (!ok) {
      const msg = status === 409 ? 'A category with that name already exists.' : 'Could not create category.';
      showToast('Error', msg, 'error');
      return;
    }
    closeModal();
    _categoriesData.push(data);
    renderCategoryPage();
    showToast('Added', `Category "${name}" created.`, 'success');
  });
}

function handleCategory(action, categoryId) {
  const category = _categoriesData.find(c => c.category_id === categoryId);
  if (!category) return;

  if (action === 'edit') {
    openModal(`
      <h3 style="${MS.title}">Edit Category</h3>
      <div style="${MS.body}">
        <div style="${MS.row}">
          <label style="${MS.label}">Category Name</label>
          <input id="modal-edit-cat-name" type="text" value="${escapeHtml(category.category_name)}" style="${MS.input}">
        </div>
      </div>
      <div style="${MS.footer}">
        <button onclick="closeModal()" style="${MS.cancel}">Cancel</button>
        <button onclick="saveEditCategory('${categoryId}')" style="${MS.primary}">Save</button>
      </div>
    `);
  } else {
    showConfirm(
      'Delete this Category?',
      `Remove "${category.category_name}"? This action cannot be undone.`,
      () => {
        deleteCategoryAPI(categoryId).then(({ ok, data }) => {
          if (!ok) {
            const message = data?.error === 'category_in_use'
              ? `"${category.category_name}" is still used by active listings. Reassign or remove those listings first.`
              : 'Could not delete category.';
            showToast('Error', message, 'error');
            return;
          }
          _categoriesData = _categoriesData.filter(c => c.category_id !== categoryId);
          showToast('Deleted', `"${category.category_name}" removed.`, 'success');
          renderCategoryPage();
        });
      }
    );
  }
}

function saveEditCategory(categoryId) {
  const newName = document.getElementById('modal-edit-cat-name')?.value.trim();
  if (!newName) { showToast('Error', 'Category name cannot be empty.', 'error'); return; }
  updateCategoryAPI(categoryId, newName).then(({ ok, status, data }) => {
    if (!ok) {
      const msg = status === 409 ? 'A category with that name already exists.' : 'Could not update category.';
      showToast('Error', msg, 'error');
      return;
    }
    closeModal();
    const category = _categoriesData.find(c => c.category_id === categoryId);
    if (category) category.category_name = data.category_name;
    renderCategoryPage();
    showToast('Updated', `Category renamed to "${newName}".`, 'success');
  });
}

let _reportsPage = 1;
let _reportsData = [];

function renderReportsPage() {
  const container = document.getElementById('reports-stack-list');
  if (!container) return;

  const reports = filterBySearch(
    _reportsData,
    r => `${r.reportType} ${r.reporter} ${r.subject} ${r.reason} ${r.status}`,
  );
  const perPage = getItemsPerPage('reports');
  const start = (_reportsPage - 1) * perPage;
  const slice = reports.slice(start, start + perPage);

  if (!_reportsData.length) {
    container.innerHTML = `<div class="empty-msg">No reports found.</div>`;
    return;
  }
  if (!reports.length) {
    container.innerHTML = `<div class="empty-msg">No reports match your search.</div>`;
    return;
  }

  container.innerHTML = slice.map(report => `
    <div class="report-row-card" data-report-id="${report.reportId}">
      <div class="avatar-wireframe-box"></div>
      <div class="report-text-details">
        <span class="report-type">${escapeHtml(report.reportType)}</span>
        <span class="report-reporter">${escapeHtml(report.reporter)}</span>
      </div>
      <div class="report-status-zone">
        <span class="report-status-badge status-${report.status === 'Resolved' ? 'resolved' : 'pending'}">${escapeHtml(report.status)}</span>
      </div>
      <div class="report-reason-section">
        <span class="info-label">Reported</span>
        <span class="info-value" style="margin-bottom:8px;">${escapeHtml(report.subject)}</span>
        <span class="reason-title">Reason</span>
        <span class="reason-content">${escapeHtml(report.reason)}</span>
      </div>
      <div class="report-meta-col">
        <span class="info-label">Date Filed</span>
        <span class="info-value">${report.date}</span>
      </div>
      <div class="report-action-group">
        ${report.reportedListingId
          ? `<button class="view-item-btn" onclick="viewReportedListing('${report.reportedListingId}')">${ICONS.eye} View Item</button>`
          : ''}
        <button class="resolve-btn" onclick="openResolveReportModal('${report.reportId}')">${ICONS.shield} Resolve</button>
      </div>
    </div>
  `).join('');

  updateCounter('.reports-counter-text', 'Pending Reports', _reportsData.length);
  renderPagination('reports-stack-list', reports.length, _reportsPage, p => { _reportsPage = p; renderReportsPage(); }, perPage);
}

function displayReports() {
  fetchPendingReports().then(reports => {
    _reportsData = reports;
    renderReportsPage();
  }).catch(() => {
    showToast('Failed to load reports', '', 'error');
  });
  setupResizePagination('reports', () => { _reportsPage = 1; renderReportsPage(); });
  initSearch(() => { _reportsPage = 1; renderReportsPage(); });
}

function viewReportedListing(listingId) {
  fetchListingById(listingId).then(listing => {
    const images = Array.isArray(listing.images) ? listing.images.filter(Boolean) : [];
    const photosHtml = images.length
      ? images.map((src, i) =>
          `<img src="${resolveImageSrc(src)}" alt="Photo ${i + 1}" style="width:72px;height:72px;border-radius:var(--radius-sm);object-fit:cover;border:1px solid var(--border);">`
        ).join('')
      : `<div style="width:72px;height:72px;border-radius:var(--radius-sm);background:var(--accent-light);display:flex;align-items:center;justify-content:center;color:var(--accent);font-size:10px;font-weight:700;">No Photo</div>`;
    openModal(`
      <h3 style="${MS.title}">Reported Listing</h3>
      <div style="${MS.body}">
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px;">${photosHtml}</div>
        <div style="${MS.row}"><span style="${MS.label}">Product Name</span><span style="font-size:14px;font-weight:700;color:var(--text);">${escapeHtml(listing.name)}</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div style="${MS.row}"><span style="${MS.label}">Price</span><span style="font-size:13px;color:var(--text);font-weight:600;">₱${listing.price.toFixed(2)}</span></div>
          <div style="${MS.row}"><span style="${MS.label}">Status</span><span style="font-size:13px;color:var(--text);text-transform:capitalize;">${escapeHtml(listing.status)}</span></div>
          <div style="${MS.row}"><span style="${MS.label}">Category</span><span style="font-size:13px;color:var(--text);">${(listing.categories || [listing.category]).map(escapeHtml).join(", ")}</span></div>
          <div style="${MS.row}"><span style="${MS.label}">Condition</span><span style="font-size:13px;color:var(--text);">${escapeHtml(listing.condition)}</span></div>
          <div style="${MS.row};grid-column:1/-1;"><span style="${MS.label}">Seller</span><span style="font-size:13px;color:var(--text);">${escapeHtml(listing.seller)}</span></div>
          <div style="${MS.row};grid-column:1/-1;"><span style="${MS.label}">Description</span><span style="font-size:13px;color:var(--text);line-height:1.5;">${escapeHtml(listing.description || 'No description provided.')}</span></div>
        </div>
      </div>
      <div style="${MS.footer}">
        <button onclick="closeModal()" style="${MS.cancel}">Close</button>
      </div>
    `);
  }).catch(() => showToast('Not Found', 'This listing is no longer available.', 'error'));
}

function openResolveReportModal(reportId) {
  const report = _reportsData.find(r => r.reportId === reportId);
  if (!report) return;

  const listingTakedownNote = report.reportedListingId
    ? ' The reported listing will also be taken down, removed from any carts, and any pending (unconfirmed) claims on it will be cancelled.'
    : '';

  const actions = [
    { value: 'warning', label: 'Issue Warning', icon: 'alert', desc: `Adds a strike to the user's record. 3 warnings auto-suspend the account.${listingTakedownNote}` },
    { value: 'suspend', label: 'Suspend User', icon: 'userSlash', desc: `Blocks login for a moderate/first-time violation. Reversible by an admin at any time.${listingTakedownNote}` },
    { value: 'ban', label: 'Ban User', icon: 'ban', desc: `Blocks login for a severe or repeat violation. Also reversible by an admin — use for the most serious cases.${listingTakedownNote}` },
    { value: 'dismiss', label: 'Dismiss Report', icon: 'close', desc: 'Closes the report with no action taken against the user or listing.' },
  ];

  openModal(`
    <h3 style="${MS.title}">Resolve Report</h3>
    <div style="${MS.body}">
      <div style="${MS.row}">
        <span style="font-size:13px;color:var(--text);font-weight:600;">${escapeHtml(report.subject)}</span>
        <span style="font-size:12px;color:var(--text-muted);">Reported by ${escapeHtml(report.reporter)}</span>
        ${report.reportedRatingId ? `
          <button type="button" id="modal-delete-review-btn" onclick="deleteReportedReview('${reportId}')" style="
            margin-top:8px;align-self:flex-start;display:inline-flex;align-items:center;gap:6px;
            padding:6px 10px;background:var(--danger-bg);color:var(--danger-text);
            border:none;border-radius:var(--radius-xs);cursor:pointer;font-size:12px;font-weight:700;
          ">${ICONS.trash} Delete this Review</button>
        ` : ''}
      </div>
      <div style="${MS.row}">
        <label style="${MS.label}">Action</label>
        <div class="resolve-action-choices" id="modal-resolve-choices">
          ${actions.map((a, i) => `
            <button type="button" class="resolve-action-btn${i === 0 ? ' active' : ''}" data-action="${a.value}" title="${a.desc}" onclick="selectResolveAction(this)">
              ${ICONS[a.icon]}<span>${a.label}</span>
            </button>
          `).join('')}
        </div>
        <p id="modal-resolve-action-desc" style="font-size:11.5px;color:var(--text-muted);margin-top:6px;line-height:1.4;">${actions[0].desc}</p>
      </div>
      <div style="${MS.row}">
        <label style="${MS.label}">Action Taken</label>
        <textarea id="modal-resolve-note" rows="3" style="${MS.input}resize:none;" placeholder="Describe the action taken for this report..."></textarea>
      </div>
    </div>
    <div style="${MS.footer}">
      <button onclick="closeModal()" style="${MS.cancel}">Cancel</button>
      <button onclick="submitResolveReport('${reportId}')" style="${MS.primary}">Resolve Report</button>
    </div>
  `);
}

function deleteReportedReview(reportId) {
  const report = _reportsData.find(r => r.reportId === reportId);
  if (!report || !report.reportedRatingId) return;
  showConfirm(
    'Delete this Review?',
    'This will permanently remove the reported review from the seller\'s profile. This cannot be undone.',
    () => {
      removeRatingAPI(report.reportedRatingId).then(({ ok }) => {
        if (!ok) {
          showToast('Error', 'Could not delete review.', 'error');
          return;
        }
        const btn = document.getElementById('modal-delete-review-btn');
        if (btn) {
          btn.disabled = true;
          btn.style.opacity = '0.5';
          btn.style.cursor = 'default';
          btn.innerHTML = `${ICONS.check} Review Deleted`;
        }
        showToast('Deleted', 'Review has been removed.', 'success');
      }).catch(() => showToast('Error', 'Could not delete review.', 'error'));
    },
    'Delete',
    'trash',
  );
}

function selectResolveAction(btn) {
  btn.parentElement.querySelectorAll('.resolve-action-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const descEl = document.getElementById('modal-resolve-action-desc');
  if (descEl) descEl.textContent = btn.title;
}

function submitResolveReport(reportId) {
  const selected = document.querySelector('#modal-resolve-choices .resolve-action-btn.active');
  const action = selected ? selected.dataset.action : 'warning';
  const note = document.getElementById('modal-resolve-note').value.trim();
  if (!note) {
    showToast('Error', 'Please describe the action taken before resolving.', 'error');
    return;
  }

  resolveReportAPI(reportId, action, note).then(({ ok, data }) => {
    if (!ok) {
      showToast('Error', 'Failed to update the report. Please try again.', 'error');
      return;
    }
    _reportsData = _reportsData.filter(r => r.reportId !== reportId);
    const perPage = getItemsPerPage('reports');
    const maxPage = Math.max(1, Math.ceil(_reportsData.length / perPage));
    if (_reportsPage > maxPage) _reportsPage = maxPage;
    closeModal();
    renderReportsPage();
    const labelMap = { warning: 'Warning issued', suspend: 'User suspended', ban: 'User banned', dismiss: 'Report dismissed' };
    const typeMap = { warning: 'warning', suspend: 'warning', ban: 'error', dismiss: 'info' };
    let message = `${labelMap[action]} for this report.`;
    if (data?.listingTakenDown) {
      message += ' Listing taken down';
      const parts = [];
      if (data.cartsCleared) parts.push(`removed from ${data.cartsCleared} cart${data.cartsCleared > 1 ? 's' : ''}`);
      if (data.claimsCancelled) parts.push(`${data.claimsCancelled} pending claim${data.claimsCancelled > 1 ? 's' : ''} cancelled`);
      message += parts.length ? ` (${parts.join(', ')}).` : '.';
    }
    showToast(action === 'dismiss' ? 'Dismissed' : 'Resolved', message, typeMap[action]);
  }).catch(() => showToast('Error', 'Failed to update the report. Please try again.', 'error'));
}
