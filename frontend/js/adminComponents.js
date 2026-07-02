let _editTargetCard = null;
let _editTargetAdminName = null;

function handleAdminSignOut() {
  sessionStorage.setItem('cc_signout', '1');
  window.location.href = '../login-path/login.html';
}

function renderPagination(containerId, total, currentPage, onPageChange, itemsPerPage) {
  const totalPages = Math.ceil(total / itemsPerPage);
  if (totalPages <= 1) return;
  const existing = document.getElementById(`${containerId}-pagination`);
  if (existing) existing.remove();
  const pag = document.createElement('div');
  pag.id = `${containerId}-pagination`;
  pag.style.cssText = 'display:flex;justify-content:center;align-items:center;gap:6px;margin-top:18px;flex-wrap:wrap;';
  const btn = (label, page, disabled = false) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.disabled = disabled;
    b.style.cssText = `padding:6px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:${page === currentPage ? 'var(--accent)' : 'var(--card-bg)'};color:${page === currentPage ? '#fff' : 'var(--text)'};cursor:${disabled ? 'default' : 'pointer'};font-size:12px;font-family:inherit;opacity:${disabled ? '0.45' : '1'};transition:all var(--transition);`;
    if (!disabled && page !== currentPage) b.addEventListener('click', () => onPageChange(page));
    return b;
  };
  pag.appendChild(btn('‹ Prev', currentPage - 1, currentPage === 1));
  for (let i = 1; i <= totalPages; i++) pag.appendChild(btn(String(i), i));
  pag.appendChild(btn('Next ›', currentPage + 1, currentPage === totalPages));
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
      return 10;
    default:
      return 10;
  }
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

function initSearch(cardSelector) {
  const input = document.querySelector('.search-input-field');
  const btn = document.querySelector('.search-glass-btn');
  if (!input) return;

  const doFilter = () => {
    const q = input.value.toLowerCase().trim();
    document.querySelectorAll(cardSelector).forEach(card => {
      card.style.display = (!q || card.textContent.toLowerCase().includes(q)) ? '' : 'none';
    });
  };

  input.addEventListener('input', doFilter);
  if (btn) btn.addEventListener('click', doFilter);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doFilter(); });
}

function applyUserFilters() {
  const q = (document.querySelector('.search-input-field')?.value || '').toLowerCase().trim();
  const statusVal = (document.querySelector('.status-filter-dropdown')?.value || 'all').toLowerCase();

  document.querySelectorAll('.user-identity-row-card').forEach(card => {
    const textMatch = !q || card.textContent.toLowerCase().includes(q);
    const badge = card.querySelector('.badge-pill');
    const status = badge?.textContent.trim().toLowerCase() || '';
    const statusMatch = statusVal === 'all' || status === statusVal;
    card.style.display = (textMatch && statusMatch) ? '' : 'none';
  });
}

function initUserSearch() {
  const input = document.querySelector('.search-input-field');
  const btn = document.querySelector('.search-glass-btn');
  const select = document.querySelector('.status-filter-dropdown');
  if (input) {
    input.addEventListener('input', applyUserFilters);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') applyUserFilters(); });
  }
  if (btn) btn.addEventListener('click', applyUserFilters);
  if (select) select.addEventListener('change', applyUserFilters);
}

function loadAdminSideNav(page) {
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

function renderAdminPage() {
  const container = document.getElementById('admins-stack-list');
  if (!container) return;
  const admins = getAdmins();
  const perPage = getItemsPerPage('admins');
  const start = (_adminPage - 1) * perPage;
  const slice = admins.slice(start, start + perPage);

  if (!admins.length) {
    container.innerHTML = `<div class="empty-msg">No administrators found. Click "Add Administrator" to create one.</div>`;
    return;
  }
  container.innerHTML = slice.map(admin => {
    const isActive = admin.status?.toLowerCase() === 'active';
    const badgeClass = isActive ? 'pill-status-active' : 'pill-status-inactive';
    const statusText = isActive ? 'Active' : 'Inactive';
    return `
      <div class="admin-identity-row-card responsive-row-card">
        <div class="avatar-wireframe-box"></div>
        <div class="admin-text-details">
          <span class="admin-display-name">${admin.username}</span>
          <span class="admin-display-email">${admin.email}</span>
        </div>
        <div class="admin-status-badge-zone">
          <span class="badge-pill ${badgeClass}">${statusText}</span>
        </div>
        <div class="action-button-group">
          <button class="action-trigger edit-trigger-btn"
            onclick="handleAdmin('edit','${admin.username}','${admin.email}','${admin.status}',this)">
            ${ICONS.edit} Edit
          </button>
          <div class="button-inner-divider"></div>
          <button class="action-trigger revoke-trigger-btn"
            onclick="handleAdmin('revoke','${admin.username}','${admin.email}','${admin.status}',this)">
            ${ICONS.userSlash} Revoke
          </button>
        </div>
      </div>`;
  }).join('');

  updateCounter('.admins-counter-text', 'Current Admins', admins.length);
  renderPagination('admins-stack-list', admins.length, _adminPage, p => { _adminPage = p; renderAdminPage(); }, perPage);
  initSearch('.admin-identity-row-card');
}

function displayAdmins() {
  renderAdminPage();
  setupResizePagination('admins', () => { _adminPage = 1; renderAdminPage(); });

  const addBtn = document.querySelector('.add-admin-action-btn');
  if (addBtn) addBtn.onclick = () => openAddAdminModal();
}

function openAddAdminModal() {
  openModal(`
    <h3 style="${MS.title}">Add Administrator</h3>
    <div style="${MS.body}">
      <div style="${MS.row}">
        <label style="${MS.label}">Full Name</label>
        <input id="modal-new-admin-name" type="text" placeholder="e.g. Juan dela Cruz" style="${MS.input}">
      </div>
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
  const name = document.getElementById('modal-new-admin-name')?.value.trim();
  const email = document.getElementById('modal-new-admin-email')?.value.trim();
  const result = createAdmin(name, email);
  if (!result.success) { showToast('Error', 'Name and email are required.', 'error'); return; }
  closeModal();
  renderAdminPage();
  showToast('Added', `${name} has been added as an administrator.`, 'success');
}

function handleAdmin(action, username, email, status, btn) {
  const card = btn.closest('.admin-identity-row-card');
  const badge = card?.querySelector('.badge-pill');

  if (action === 'edit') {
    _editTargetCard = card;
    _editTargetAdminName = username;
    openModal(`
      <h3 style="${MS.title}">Edit Administrator</h3>
      <div style="${MS.body}">
        <div style="${MS.row}">
          <label style="${MS.label}">Display Name</label>
          <input id="modal-admin-name" value="${username}" style="${MS.input}">
        </div>
        <div style="${MS.row}">
          <label style="${MS.label}">Email</label>
          <input id="modal-admin-email" value="${email}" style="${MS.input}">
        </div>
      </div>
      <div style="${MS.footer}">
        <button onclick="closeModal()" style="${MS.cancel}">Cancel</button>
        <button onclick="saveAdminEdit()" style="${MS.primary}">Save Changes</button>
      </div>
    `);

  } else if (action === 'revoke') {
    const currentStatus = badge?.textContent.trim().toLowerCase() || status;
    if (currentStatus === 'inactive') {
      showToast('Already Revoked', `${username}'s access is already revoked.`, 'warning');
      return;
    }
    showConfirm(
      `Revoke Admin Access?`,
      `Revoke admin access for ${username}? They will no longer be able to manage the platform.`,
      () => {
        const result = revokeAdmin(username);
        if (!result.success) return;
        if (badge) { badge.className = 'badge-pill pill-status-inactive'; badge.textContent = 'Inactive'; }
        btn.disabled = true;
        showToast('Access Revoked', `${username}'s admin access has been revoked.`, 'warning');
      },
      'Revoke', 'revoke'
    );
  }
}

function saveAdminEdit() {
  const name = document.getElementById('modal-admin-name')?.value.trim();
  const email = document.getElementById('modal-admin-email')?.value.trim();
  const result = updateAdmin(_editTargetAdminName, name, email);
  if (!result.success) { showToast('Error', 'Name and email cannot be empty.', 'error'); return; }
  if (_editTargetCard) {
    _editTargetCard.querySelector('.admin-display-name').textContent = name;
    _editTargetCard.querySelector('.admin-display-email').textContent = email;
  }
  _editTargetAdminName = null;
  closeModal();
  showToast('Saved', 'Administrator updated successfully.', 'success');
}

let _usersPage = 1;

function displayUsers() {
  const container = document.getElementById('users-stack-list');
  if (!container) return;

  const users = getUsers();
  const perPage = getItemsPerPage('users');
  const start = (_usersPage - 1) * perPage;
  const usersSlice = users.slice(start, start + perPage);

  if (!users.length) {
    container.innerHTML = `<div class="empty-msg">No users found.</div>`;
    return;
  } else {
    container.innerHTML = usersSlice.map(user => {
      const isActive = user.status?.toLowerCase() === 'active';
      const isSuspended = user.status?.toLowerCase() === 'suspended';
      const pillClass = isActive ? 'pill-status-active' : (isSuspended ? 'pill-status-suspended' : 'pill-status-banned');
      const statusText = isActive ? 'Active' : (isSuspended ? 'Suspended' : 'Banned');
      return `
        <div class="user-identity-row-card responsive-row-card">
          <div class="avatar-wireframe-box"></div>
          <div class="user-text-details">
            <span class="user-display-name">${user.username}</span>
            <span class="user-display-email">${user.email}</span>
          </div>
          <div class="user-info-extra">
            <span class="info-label">Joined:</span>
            <span class="info-value">${user.dateJoined}</span>
          </div>
          <div class="user-right-controls">
            <span class="badge-pill ${pillClass}">${statusText}</span>
            <div class="action-button-group">
              <button class="action-trigger edit-trigger-btn"
                onclick="handleUser('edit','${user.username}','${user.email}','${user.dateJoined}','${user.status}',this)">
                ${ICONS.edit} Edit
              </button>
              <div class="button-inner-divider"></div>
              <button class="action-trigger view-trigger-btn"
                onclick="handleUser('view','${user.username}','${user.email}','${user.dateJoined}','${user.status}',this)">
                ${ICONS.eye} View
              </button>
              <div class="button-inner-divider"></div>
              <button class="action-trigger ban-trigger-btn"
                onclick="handleUser('ban','${user.username}','${user.email}','${user.dateJoined}','${user.status}',this)">
                ${ICONS.ban} Ban
              </button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  updateCounter('.users-counter-text', 'Total Users', users.length);
  renderPagination('users-stack-list', users.length, _usersPage, p => { _usersPage = p; displayUsers(); }, perPage);
  setupResizePagination('users', () => { _usersPage = 1; displayUsers(); });
  initUserSearch();
}

function handleUser(action, username, email, dateJoined, status, btn) {
  const card = btn.closest('.user-identity-row-card');
  const badge = card?.querySelector('.badge-pill');

  if (action === 'view') {
    const currentStatus = badge?.textContent.trim() || status;
    openModal(`
      <h3 style="${MS.title}">User Profile</h3>
      <div style="${MS.body}">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:52px;height:52px;border-radius:50%;background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;color:var(--accent);flex-shrink:0;">${username.charAt(0).toUpperCase()}</div>
          <div>
            <div style="font-weight:700;font-size:15px;color:var(--text);margin-bottom:2px;">${username}</div>
            <div style="font-size:12px;color:var(--text-muted);">${email}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;padding-top:4px;">
          <div style="${MS.row}"><span style="${MS.label}">Joined</span><span style="font-size:13px;color:var(--text);font-weight:600;">${dateJoined}</span></div>
          <div style="${MS.row}"><span style="${MS.label}">Status</span><span style="font-size:13px;color:var(--text);font-weight:600;">${currentStatus}</span></div>
        </div>
      </div>
      <div style="${MS.footer}">
        <button onclick="closeModal()" style="${MS.primary}">Close</button>
      </div>
    `);

  } else if (action === 'edit') {
    _editTargetCard = card;
    const currentStatus = badge?.textContent.trim().toLowerCase() || status;
    openModal(`
      <h3 style="${MS.title}">Edit User</h3>
      <div style="${MS.body}">
        <div style="${MS.row}">
          <label style="${MS.label}">User</label>
          <div style="font-size:13px;color:var(--text);font-weight:600;">${username}</div>
          <div style="font-size:11px;color:var(--text-muted);">${email}</div>
        </div>
        <div style="${MS.row}">
          <label style="${MS.label}">Account Status</label>
          <select id="modal-user-status" style="${MS.select}">
            <option value="active"    ${currentStatus === 'active' ? 'selected' : ''}>Active</option>
            <option value="suspended" ${currentStatus === 'suspended' ? 'selected' : ''}>Suspended</option>
            <option value="banned"    ${currentStatus === 'banned' ? 'selected' : ''}>Banned</option>
          </select>
        </div>
      </div>
      <div style="${MS.footer}">
        <button onclick="closeModal()" style="${MS.cancel}">Cancel</button>
        <button onclick="saveUserEdit('${username}','${email}')" style="${MS.primary}">Save</button>
      </div>
    `);

  } else if (action === 'ban') {
    const currentStatus = badge?.textContent.trim().toLowerCase() || status;
    if (currentStatus === 'banned') {
      showConfirm(
        `Unban ${username}?`,
        `This will restore their account and allow them to use CampusCart again.`,
        () => {
          setUserStatus(email, 'active');
          if (badge) { badge.className = 'badge-pill pill-status-active'; badge.textContent = 'Active'; }
          showToast('Unbanned', `${username} has been unbanned.`, 'success');
        },
        'Unban', 'unban'
      );
    } else {
      showConfirm(
        `Ban ${username}?`,
        `This will restrict their account and prevent them from using CampusCart.`,
        () => {
          setUserStatus(email, 'banned');
          if (badge) { badge.className = 'badge-pill pill-status-banned'; badge.textContent = 'Banned'; }
          showToast('Banned', `${username} has been banned.`, 'error');
        },
        'Ban', 'ban'
      );
    }
  }
}

function saveUserEdit(username, email) {
  const select = document.getElementById('modal-user-status');
  if (!select || !_editTargetCard) return;
  const newStatus = select.value;
  setUserStatus(email, newStatus);
  const badge = _editTargetCard.querySelector('.badge-pill');
  if (badge) {
    const pillMap = { active: 'pill-status-active', suspended: 'pill-status-suspended', banned: 'pill-status-banned' };
    const labelMap = { active: 'Active', suspended: 'Suspended', banned: 'Banned' };
    badge.className = `badge-pill ${pillMap[newStatus]}`;
    badge.textContent = labelMap[newStatus];
  }
  closeModal();
  showToast('Updated', `${username}'s status has been updated.`, 'success');
}

let _approvalPage = 1;
let _approvalListings = [];

function renderApprovalPage() {
  const container = document.getElementById('approval-grid');
  if (!container) return;
  const perPage = getItemsPerPage('listings');
  const start = (_approvalPage - 1) * perPage;
  const slice = _approvalListings.slice(start, start + perPage);

  if (!slice.length) {
    container.innerHTML = `<div class="empty-msg">No listings needed for approval.</div>`;
    updateCounter('.pending-count', 'Pending Approval', _approvalListings.length);
    return;
  }
  container.innerHTML = slice.map(listing => {
    const thumb = listing.images[0];
    return `
    <div class="listing-card" id="listing-card-${listing.id}">
      <div class="card-top">
        <div class="listing-image${thumb ? ' has-image' : ''}"${thumb ? ` style="background-image:url('${thumb}');background-size:cover;background-position:center;"` : ''}></div>
        <div class="listing-info">
          <h2>${listing.name}</h2>
          <p>PHP ${listing.price.toFixed(2)}</p>
          <p>${listing.seller}</p>
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
  renderPagination('approval-grid', _approvalListings.length, _approvalPage, p => { _approvalPage = p; renderApprovalPage(); }, perPage);
}

function displayListingApprovals() {
  fetchPendingListings().then(listings => {
    _approvalListings = listings;
    renderApprovalPage();
  }).catch(() => {
    showToast('Failed to load listings', '', 'error');
  });
  setupResizePagination('listings', () => { _approvalPage = 1; renderApprovalPage(); });
}

function viewListingDetails(listingId) {
  const listing = _approvalListings.find(l => l.id === listingId);
  if (!listing) return;
  const photosHtml = listing.images.length
    ? listing.images.map((src, i) =>
        `<img src="${src}" alt="Photo ${i + 1}" style="width:72px;height:72px;border-radius:var(--radius-sm);object-fit:cover;border:1px solid var(--border);">`
      ).join('')
    : `<div style="width:72px;height:72px;border-radius:var(--radius-sm);background:var(--accent-light);display:flex;align-items:center;justify-content:center;color:var(--accent);font-size:10px;font-weight:700;">No Photo</div>`;
  openModal(`
    <h3 style="${MS.title}">Listing Details</h3>
    <div style="${MS.body}">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px;">${photosHtml}</div>
      <div style="${MS.row}"><span style="${MS.label}">Product Name</span><span style="font-size:14px;font-weight:700;color:var(--text);">${listing.name}</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div style="${MS.row}"><span style="${MS.label}">Price</span><span style="font-size:13px;color:var(--text);font-weight:600;">₱${listing.price.toFixed(2)}</span></div>
        <div style="${MS.row}"><span style="${MS.label}">Category</span><span style="font-size:13px;color:var(--text);">${listing.category}</span></div>
        <div style="${MS.row}"><span style="${MS.label}">Condition</span><span style="font-size:13px;color:var(--text);">${listing.condition}</span></div>
        <div style="${MS.row};grid-column:1/-1;"><span style="${MS.label}">Seller</span><span style="font-size:13px;color:var(--text);">${listing.seller}</span></div>
        <div style="${MS.row};grid-column:1/-1;"><span style="${MS.label}">Description</span><span style="font-size:13px;color:var(--text);line-height:1.5;">${listing.description || 'No description provided.'}</span></div>
      </div>
    </div>
    <div style="${MS.footer}">
      <button onclick="closeModal()" style="${MS.cancel}">Close</button>
      <button onclick="closeModal();handleApproval('approve','${listing.id}',document.querySelector('#listing-card-${listing.id} .approve-btn'))" style="${MS.primary}">Approve</button>
    </div>
  `);
}

function handleApproval(action, listingId, btn) {
  const card = btn.closest('.listing-card');
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
    if (action === 'approve') {
      showToast('Approved', `${listingName} has been approved.`, 'success');
    } else {
      showToast('Rejected', `${listingName} has been rejected.`, 'error');
    }
    if (card) card.style.opacity = '0.4';
  });
}

let _catPage = 1;

function renderCategoryPage() {
  const container = document.getElementById('category-grid');
  if (!container) return;

  const categories = getCategories();
  const perPage = getItemsPerPage('categories');
  const start = (_catPage - 1) * perPage;
  const slice = categories.slice(start, start + perPage);

  if (!categories.length) {
    container.innerHTML = `<div class="empty-msg">No categories found. Click "+ Add New Category" to create one.</div>`;
    return;
  }

  container.innerHTML = slice.map(category => `
    <div class="category-card">
      <div class="category-info">
        <h2>${category.categoryName}</h2>
      </div>
      <div class="category-actions">
        <button class="edit-btn"   onclick="handleCategory('edit',  '${category.categoryName}',this)">${ICONS.edit}  Edit</button>
        <button class="delete-btn" onclick="handleCategory('delete','${category.categoryName}',this)">${ICONS.trash} Delete</button>
      </div>
    </div>
  `).join('');

  renderPagination('category-grid', categories.length, _catPage, (p) => { _catPage = p; renderCategoryPage(); }, perPage);
  initSearch('.category-card');
}

function displayCategories() {
  renderCategoryPage();

  const addBtn = document.querySelector('.add-category-btn');
  if (addBtn) addBtn.onclick = () => openAddCategoryModal();
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
  const result = createCategory(name);
  if (!result.success) { showToast('Error', 'Category name cannot be empty.', 'error'); return; }
  closeModal();
  renderCategoryPage();
  showToast('Added', `Category "${name}" created.`, 'success');
}

function handleCategory(action, categoryName, btn) {
  const card = btn.closest('.category-card');
  const nameEl = card?.querySelector('h2');

  if (action === 'edit') {
    const current = nameEl?.textContent.trim() || categoryName;
    openModal(`
      <h3 style="${MS.title}">Edit Category</h3>
      <div style="${MS.body}">
        <div style="${MS.row}">
          <label style="${MS.label}">Category Name</label>
          <input id="modal-edit-cat-name" type="text" value="${current}" style="${MS.input}">
        </div>
      </div>
      <div style="${MS.footer}">
        <button onclick="closeModal()" style="${MS.cancel}">Cancel</button>
        <button onclick="saveEditCategory('${current}')" style="${MS.primary}">Save</button>
      </div>
    `);
  } else {
    showConfirm(
      'Delete this Category?',
      `Remove "${categoryName}"? This action cannot be undone.`,
      () => {
        removeCategory(categoryName);
        showToast('Deleted', `"${categoryName}" removed.`, 'success');
        renderCategoryPage();
      }
    );
  }
}

function saveEditCategory(oldName) {
  const newName = document.getElementById('modal-edit-cat-name')?.value.trim();
  const result = updateCategory(oldName, newName);
  if (!result.success) { showToast('Error', 'Category name cannot be empty.', 'error'); return; }
  closeModal();
  renderCategoryPage();
  showToast('Updated', `Category renamed to "${newName}".`, 'success');
}

let _reportsPage = 1;
let _reportsData = [];

function renderReportsPage() {
  const container = document.getElementById('reports-stack-list');
  if (!container) return;

  const reports = _reportsData;
  const perPage = getItemsPerPage('reports');
  const start = (_reportsPage - 1) * perPage;
  const slice = reports.slice(start, start + perPage);

  if (!reports.length) {
    container.innerHTML = `<div class="empty-msg">No reports found.</div>`;
    return;
  }

  container.innerHTML = slice.map(report => `
    <div class="report-row-card">
      <div class="avatar-wireframe-box"></div>
      <div class="report-text-details">
        <span class="report-type">${report.reportType}</span>
        <span class="report-id">#${report.reportId}</span>
        <span class="report-reporter">${report.reporter}</span>
      </div>
      <div class="report-status-zone">
        <span class="report-status-badge">${report.status}</span>
      </div>
      <div class="report-reason-section">
        <span class="info-label">Reported</span>
        <span class="info-value" style="margin-bottom:8px;">${report.subject}</span>
        <span class="reason-title">Reason</span>
        <span class="reason-content">${report.reason}</span>
      </div>
      <div class="report-meta-col">
        <span class="info-label">Date Filed</span>
        <span class="info-value">${report.date}</span>
      </div>
      <div class="report-action-group">
        <button class="warning-btn" onclick="handleReportAction('warning','${report.reportId}',this)">${ICONS.shield} Warning</button>
        <button class="dismiss-btn" onclick="handleReportAction('dismiss','${report.reportId}',this)">${ICONS.close} Dismiss</button>
      </div>
    </div>
  `).join('');

  updateCounter('.reports-counter-text', 'Pending Reports', reports.length);
  renderPagination('reports-stack-list', reports.length, _reportsPage, p => { _reportsPage = p; renderReportsPage(); }, perPage);
  initSearch('.report-row-card');
}

function displayReports() {
  fetchPendingReports().then(reports => {
    _reportsData = reports;
    renderReportsPage();
  }).catch(() => {
    showToast('Failed to load reports', '', 'error');
  });
  setupResizePagination('reports', () => { _reportsPage = 1; renderReportsPage(); });
}

function handleReportAction(action, reportId, btn) {
  const row = btn.closest('.report-row-card');
  const group = btn.closest('.report-action-group');
  group.querySelectorAll('button').forEach(b => b.disabled = true);

  resolveReportAPI(reportId, action).then(({ ok }) => {
    if (!ok) {
      showToast('Error', 'Failed to update the report. Please try again.', 'error');
      group.querySelectorAll('button').forEach(b => b.disabled = false);
      return;
    }
    _reportsData = _reportsData.filter(r => r.reportId !== reportId);
    if (action === 'warning') {
      showToast('Warning Issued', `Warning sent for report #${reportId}.`, 'warning');
    } else {
      showToast('Dismissed', `Report #${reportId} has been dismissed.`, 'info');
    }
    if (row) row.style.opacity = '0.4';
  });
}
