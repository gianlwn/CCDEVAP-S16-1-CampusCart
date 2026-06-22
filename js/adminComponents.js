let _editTargetCard = null;

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

let _adminsArray = [
  { username: 'Mikyla Kirsten Aguirre', email: 'mikyla_kirsten_aguirre@dlsu.edu.ph', status: 'active' },
  { username: 'Giancarlo Lawan', email: 'giancarlo_lawan@dlsu.edu.ph', status: 'active' },
  { username: 'Bernard Florian Llagas', email: 'bernard_florian_llagas@dlsu.edu.ph', status: 'inactive' },
  { username: 'Sky Hannah Parado', email: 'sky_parado@dlsu.edu.ph', status: 'active' },
  { username: 'Camille Erika Sarabia', email: 'camille_erika_sarabia@dlsu.edu.ph', status: 'active' },
  { username: 'Rafael Tan', email: 'rafael_tan@dlsu.edu.ph', status: 'active' },
  { username: 'Jose Dela Vega', email: 'jose_delavega@dlsu.edu.ph', status: 'active' },
  { username: 'Maria Santos', email: 'maria_santos@dlsu.edu.ph', status: 'active' },
  { username: 'Luis Fernandez', email: 'luis_fernandez@dlsu.edu.ph', status: 'inactive' },
  { username: 'Ana Cruz', email: 'ana_cruz@dlsu.edu.ph', status: 'active' },
  { username: 'Carlos Ramos', email: 'carlos_ramos@dlsu.edu.ph', status: 'active' },
  { username: 'Lea Bautista', email: 'lea_bautista@dlsu.edu.ph', status: 'active' },
  { username: 'Diego Navarro', email: 'diego_navarro@dlsu.edu.ph', status: 'inactive' },
];
let _adminPage = 1;

function renderAdminPage() {
  const container = document.getElementById('admins-stack-list');
  if (!container) return;
  const perPage = getItemsPerPage('admins');
  const start = (_adminPage - 1) * perPage;
  const slice = _adminsArray.slice(start, start + perPage);

  if (!_adminsArray.length) {
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

  updateCounter('.admins-counter-text', 'Current Admins', _adminsArray.length);
  renderPagination('admins-stack-list', _adminsArray.length, _adminPage, p => { _adminPage = p; renderAdminPage(); }, perPage);
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
  if (!name || !email) { showToast('Error', 'Name and email are required.', 'error'); return; }
  _adminsArray.push({ username: name, email, status: 'active' });
  closeModal();
  renderAdminPage();
  showToast('Added', `${name} has been added as an administrator.`, 'success');
}

function handleAdmin(action, username, email, status, btn) {
  const card = btn.closest('.admin-identity-row-card');
  const badge = card?.querySelector('.badge-pill');

  if (action === 'edit') {
    _editTargetCard = card;
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
  if (!name || !email) { showToast('Error', 'Name and email cannot be empty.', 'error'); return; }
  if (_editTargetCard) {
    _editTargetCard.querySelector('.admin-display-name').textContent = name;
    _editTargetCard.querySelector('.admin-display-email').textContent = email;
  }
  closeModal();
  showToast('Saved', 'Administrator updated successfully.', 'success');
}

const _usersArray = [
  { username: 'Andie Kirsten Woo', email: 'andie_woo@dlsu.edu.ph', dateJoined: 'Jun 12, 2026', status: 'active' },
  { username: 'Alexa Nicole Pleyto', email: 'alexa_pleyto@dlsu.edu.ph', dateJoined: 'May 28, 2026', status: 'suspended' },
  { username: 'Christine Cote', email: 'tintin_cote@dlsu.edu.ph', dateJoined: 'Apr 04, 2026', status: 'banned' },
  { username: 'Marco Dela Cruz', email: 'marco_delacruz@dlsu.edu.ph', dateJoined: 'Mar 15, 2026', status: 'active' },
  { username: 'Ria Magpantay', email: 'ria_magpantay@dlsu.edu.ph', dateJoined: 'Feb 20, 2026', status: 'active' },
  { username: 'Janna Reyes', email: 'janna_reyes@dlsu.edu.ph', dateJoined: 'Jan 08, 2026', status: 'active' },
  { username: 'Eli Santos', email: 'eli_santos@dlsu.edu.ph', dateJoined: 'Dec 02, 2025', status: 'suspended' },
  { username: 'Dana Flores', email: 'dana_flores@dlsu.edu.ph', dateJoined: 'Nov 19, 2025', status: 'active' },
  { username: 'Paolo Mendoza', email: 'paolo_mendoza@dlsu.edu.ph', dateJoined: 'Oct 15, 2025', status: 'active' },
  { username: 'Bianca Torres', email: 'bianca_torres@dlsu.edu.ph', dateJoined: 'Sep 22, 2025', status: 'active' },
  { username: 'Kyle Reyes', email: 'kyle_reyes@dlsu.edu.ph', dateJoined: 'Aug 10, 2025', status: 'suspended' },
  { username: 'Lia Castillo', email: 'lia_castillo@dlsu.edu.ph', dateJoined: 'Jul 30, 2025', status: 'active' },
  { username: 'Noel Garcia', email: 'noel_garcia@dlsu.edu.ph', dateJoined: 'Jun 05, 2025', status: 'banned' },
  { username: 'Sofia Aquino', email: 'sofia_aquino@dlsu.edu.ph', dateJoined: 'May 18, 2025', status: 'active' },
  { username: 'Anton Villanueva', email: 'anton_villanueva@dlsu.edu.ph', dateJoined: 'Apr 02, 2025', status: 'active' },
];
let _usersPage = 1;

function displayUsers() {
  const container = document.getElementById('users-stack-list');
  if (!container) return;

  const perPage = getItemsPerPage('users');
  const start = (_usersPage - 1) * perPage;
  const usersArray = _usersArray.slice(start, start + perPage);

  if (!_usersArray.length) {
    container.innerHTML = `<div class="empty-msg">No users found.</div>`;
    return;
  } else {
    container.innerHTML = usersArray.map(user => {
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

  updateCounter('.users-counter-text', 'Total Users', _usersArray.length);
  renderPagination('users-stack-list', _usersArray.length, _usersPage, p => { _usersPage = p; displayUsers(); }, perPage);
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
        <button onclick="saveUserEdit('${username}')" style="${MS.primary}">Save</button>
      </div>
    `);

  } else if (action === 'ban') {
    const currentStatus = badge?.textContent.trim().toLowerCase() || status;
    if (currentStatus === 'banned') {
      showConfirm(
        `Unban ${username}?`,
        `This will restore their account and allow them to use CampusCart again.`,
        () => {
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
          if (badge) { badge.className = 'badge-pill pill-status-banned'; badge.textContent = 'Banned'; }
          showToast('Banned', `${username} has been banned.`, 'error');
        },
        'Ban', 'ban'
      );
    }
  }
}

function saveUserEdit(username) {
  const select = document.getElementById('modal-user-status');
  if (!select || !_editTargetCard) return;
  const newStatus = select.value;
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

const _listingApprovalsArray = [
  { productName: 'Casio FX-991EX', listingId: 'LST-1001', price: 250, seller: 'Kathryn Bernardo', category: 'Electronics', condition: 'Good', description: 'Scientific calculator in great condition. Minor scratches on the back. Comes with the original case.', images: ['Photo 1', 'Photo 2', 'Photo 3'] },
  { productName: 'Chemistry Lab Kit', listingId: 'LST-1002', price: 950, seller: 'Kimi Antonelli', category: 'Lab Tools', condition: 'New', description: 'Brand new lab kit, never opened. Bought for CHEM1 but ended up not using it.', images: ['Photo 1', 'Photo 2'] },
  { productName: 'Engineering Mechanics Textbook', listingId: 'LST-1003', price: 500, seller: 'Garrett Graham', category: 'Books', condition: 'Used', description: 'Meriam & Kraige, 7th edition. Pages are highlighted but still very readable.', images: ['Photo 1'] },
  { productName: 'DLSU PE Uniform Set', listingId: 'LST-1004', price: 310, seller: 'Jeron Teng', category: 'Clothing', condition: 'Good', description: 'XL size, worn only a few times. Washed and clean.', images: ['Photo 1', 'Photo 2', 'Photo 3', 'Photo 4'] },
  { productName: 'Arduino Mega 2560', listingId: 'LST-1005', price: 480, seller: 'Ria Magpantay', category: 'Electronics', condition: 'Used', description: 'Fully functional Arduino Mega. Tested before listing. No shields included.', images: ['Photo 1', 'Photo 2'] },
  { productName: 'Fluid Mechanics Textbook', listingId: 'LST-1006', price: 380, seller: 'Marco Dela Cruz', category: 'Books', condition: 'Good', description: 'Cengel & Cimbala, 3rd edition. Some annotations in pencil, easy to erase.', images: ['Photo 1'] },
  { productName: 'Lab Goggles (Pack of 2)', listingId: 'LST-1007', price: 120, seller: 'Dana Flores', category: 'Lab Tools', condition: 'New', description: 'Never used, sealed pack. Safety goggles required for CHEM lab.', images: ['Photo 1', 'Photo 2'] },
  { productName: 'DLSU Lanyard + ID Holder', listingId: 'LST-1008', price: 80, seller: 'Janna Reyes', category: 'Others', condition: 'Good', description: 'Official DLSU lanyard, slightly used. ID holder is still clear and intact.', images: ['Photo 1'] },
  { productName: 'Organic Chemistry Textbook', listingId: 'LST-1009', price: 420, seller: 'Paolo Mendoza', category: 'Books', condition: 'Good', description: 'Wade 8th edition. Some highlighting throughout but text is clear and readable.', images: ['Photo 1', 'Photo 2'] },
  { productName: 'Graph Paper Pads (3 packs)', listingId: 'LST-1010', price: 75, seller: 'Bianca Torres', category: 'School Supplies', condition: 'New', description: 'Sealed packs, never opened. Bought extras by mistake for MATH class.', images: ['Photo 1'] },
  { productName: 'TI-84 Plus Graphing Calculator', listingId: 'LST-1011', price: 1200, seller: 'Kyle Reyes', category: 'Electronics', condition: 'Good', description: 'Fully functional. Battery replaced last month. Comes with protective cover and manual.', images: ['Photo 1', 'Photo 2', 'Photo 3'] },
  { productName: 'DLSU Engineering Uniform', listingId: 'LST-1012', price: 450, seller: 'Lia Castillo', category: 'Clothing', condition: 'Used', description: 'Medium size, worn for one term only. Washed and in good condition.', images: ['Photo 1', 'Photo 2'] },
  { productName: 'Breadboard + Jumper Wires Kit', listingId: 'LST-1013', price: 180, seller: 'Noel Garcia', category: 'Electronics', condition: 'Good', description: '830-point breadboard with 65-piece jumper wire set. Used for one project only.', images: ['Photo 1'] },
  { productName: 'Data Structures and Algorithms Book', listingId: 'LST-1014', price: 560, seller: 'Sofia Aquino', category: 'Books', condition: 'Used', description: 'Cormen et al., 3rd edition. Annotations in pencil on a few pages, otherwise clean.', images: ['Photo 1', 'Photo 2'] },
];

let _approvalPage = 1;

function renderApprovalPage() {
  const container = document.getElementById('approval-grid');
  if (!container) return;
  const perPage = getItemsPerPage('listings');
  const start = (_approvalPage - 1) * perPage;
  const slice = _listingApprovalsArray.slice(start, start + perPage);

  if (!slice.length) {
    container.innerHTML = `<div class="empty-msg">No listings needed for approval.</div>`;
    return;
  }
  container.innerHTML = slice.map(listing => `
    <div class="listing-card" id="listing-card-${listing.listingId}">
      <div class="card-top">
        <div class="listing-image"></div>
        <div class="listing-info">
          <h2>${listing.productName}</h2>
          <p>${listing.listingId}</p>
          <p>PHP ${listing.price.toFixed(2)}</p>
          <p>${listing.seller}</p>
          <span class="status-badge">Pending Approval</span>
        </div>
      </div>
      <button class="view-details-btn" onclick="viewListingDetails('${listing.listingId}')">${ICONS.eye} View Details</button>
      <div class="listing-actions">
        <button class="approve-btn" onclick="handleApproval('approve','${listing.listingId}',this)">${ICONS.check} Approve</button>
        <button class="reject-btn"  onclick="handleApproval('reject', '${listing.listingId}',this)">${ICONS.close} Reject</button>
      </div>
    </div>
  `).join('');

  updateCounter('.pending-count', 'Pending Approval', _listingApprovalsArray.length);
  renderPagination('approval-grid', _listingApprovalsArray.length, _approvalPage, p => { _approvalPage = p; renderApprovalPage(); }, perPage);
}

function displayListingApprovals() {
  renderApprovalPage();
  setupResizePagination('listings', () => { _approvalPage = 1; renderApprovalPage(); });
}

function viewListingDetails(listingId) {
  const listing = _listingApprovalsArray.find(l => l.listingId === listingId);
  if (!listing) return;
  const photosHtml = listing.images.map((_, i) =>
    `<div style="width:72px;height:72px;border-radius:var(--radius-sm);background:var(--accent-light);display:flex;align-items:center;justify-content:center;color:var(--accent);font-size:10px;font-weight:700;">Photo ${i + 1}</div>`
  ).join('');
  openModal(`
    <h3 style="${MS.title}">Listing Details</h3>
    <div style="${MS.body}">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px;">${photosHtml}</div>
      <div style="${MS.row}"><span style="${MS.label}">Product Name</span><span style="font-size:14px;font-weight:700;color:var(--text);">${listing.productName}</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div style="${MS.row}"><span style="${MS.label}">Listing ID</span><span style="font-size:13px;color:var(--text-muted);">${listing.listingId}</span></div>
        <div style="${MS.row}"><span style="${MS.label}">Price</span><span style="font-size:13px;color:var(--text);font-weight:600;">₱${listing.price.toFixed(2)}</span></div>
        <div style="${MS.row}"><span style="${MS.label}">Category</span><span style="font-size:13px;color:var(--text);">${listing.category}</span></div>
        <div style="${MS.row}"><span style="${MS.label}">Condition</span><span style="font-size:13px;color:var(--text);">${listing.condition}</span></div>
        <div style="${MS.row};grid-column:1/-1;"><span style="${MS.label}">Seller</span><span style="font-size:13px;color:var(--text);">${listing.seller}</span></div>
        <div style="${MS.row};grid-column:1/-1;"><span style="${MS.label}">Description</span><span style="font-size:13px;color:var(--text);line-height:1.5;">${listing.description}</span></div>
      </div>
    </div>
    <div style="${MS.footer}">
      <button onclick="closeModal()" style="${MS.cancel}">Close</button>
      <button onclick="closeModal();handleApproval('approve','${listing.listingId}',document.querySelector('#listing-card-${listing.listingId} .approve-btn'))" style="${MS.primary}">Approve</button>
    </div>
  `);
}

function handleApproval(action, listingId, btn) {
  const card = btn.closest('.listing-card');
  if (action === 'approve') {
    showToast('Approved', `Listing ${listingId} has been approved.`, 'success');
  } else {
    showToast('Rejected', `Listing ${listingId} has been rejected.`, 'error');
  }
  if (card) card.style.opacity = '0.4';
  btn.closest('.listing-actions').querySelectorAll('button').forEach(b => b.disabled = true);
}

let _categoriesArray = [
  { categoryName: 'Electronics' },
  { categoryName: 'Clothing' },
  { categoryName: 'School Supplies' },
  { categoryName: 'Books' },
  { categoryName: 'Lab Tools' },
  { categoryName: 'Others' },
  { categoryName: 'Instruments' },
  { categoryName: 'Sports & Fitness' },
];

let _catPage = 1;

function renderCategoryPage() {
  const container = document.getElementById('category-grid');
  if (!container) return;

  const perPage = getItemsPerPage('categories');
  const start = (_catPage - 1) * perPage;
  const slice = _categoriesArray.slice(start, start + perPage);

  if (!_categoriesArray.length) {
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

  renderPagination('category-grid', _categoriesArray.length, _catPage, (p) => { _catPage = p; renderCategoryPage(); }, perPage);
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
  if (!name) { showToast('Error', 'Category name cannot be empty.', 'error'); return; }
  _categoriesArray.push({ categoryName: name });
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
        _categoriesArray = _categoriesArray.filter(c => c.categoryName !== categoryName);
        showToast('Deleted', `"${categoryName}" removed.`, 'success');
        renderCategoryPage();
      }
    );
  }
}

function saveEditCategory(oldName) {
  const newName = document.getElementById('modal-edit-cat-name')?.value.trim();
  if (!newName) { showToast('Error', 'Category name cannot be empty.', 'error'); return; }
  const cat = _categoriesArray.find(c => c.categoryName === oldName);
  if (cat) cat.categoryName = newName;
  closeModal();
  renderCategoryPage();
  showToast('Updated', `Category renamed to "${newName}".`, 'success');
}

const _reportsArray = [
  { reportType: 'User Report', reportId: 'RPT-3012', reporter: 'Andie Kirsten Woo', status: 'Pending Review', reason: 'Spam account repeatedly posting misleading listings.', subject: 'User: @marie_santos', date: 'Jun 14, 2026' },
  { reportType: 'Listing Report', reportId: 'RPT-3013', reporter: 'Alexa Nicole Pleyto', status: 'Pending Review', reason: 'Possible scam listing requesting payment outside the website.', subject: 'Listing: Casio FX-991EX', date: 'Jun 15, 2026' },
  { reportType: 'User Report', reportId: 'RPT-3014', reporter: 'Christine Cote', status: 'Pending Review', reason: 'Hate speech directed toward another user in listing comments.', subject: 'User: @jay_ramos', date: 'Jun 15, 2026' },
  { reportType: 'Review Report', reportId: 'RPT-3015', reporter: 'Mara R.', status: 'Pending Review', reason: 'Review contains false information and is clearly from a competitor account.', subject: 'Review on: Scientific Calculator', date: 'Jun 16, 2026' },
  { reportType: 'Listing Report', reportId: 'RPT-3016', reporter: 'Sam V.', status: 'Pending Review', reason: 'Listing price is grossly inflated compared to market value.', subject: 'Listing: Arduino Uno Kit', date: 'Jun 17, 2026' },
  { reportType: 'User Report', reportId: 'RPT-3017', reporter: 'Eli Santos', status: 'Pending Review', reason: 'User is sending unsolicited messages to buyers asking for payment via GCash only.', subject: 'User: @kai_a', date: 'Jun 18, 2026' },
  { reportType: 'Listing Report', reportId: 'RPT-3018', reporter: 'Janna Reyes', status: 'Pending Review', reason: 'Item listed is prohibited under campus marketplace rules.', subject: 'Listing: Chemistry Lab Kit', date: 'Jun 19, 2026' },
  { reportType: 'Listing Report', reportId: 'RPT-3019', reporter: 'Paolo Mendoza', status: 'Pending Review', reason: 'Listing photos are stolen from another platform. Seller is not the original owner.', subject: 'Listing: DLSU PE Uniform Set', date: 'Jun 20, 2026' },
  { reportType: 'User Report', reportId: 'RPT-3020', reporter: 'Bianca Torres', status: 'Pending Review', reason: 'User refused to complete a transaction after payment was sent outside the platform.', subject: 'User: @noel_garcia', date: 'Jun 21, 2026' },
  { reportType: 'Review Report', reportId: 'RPT-3021', reporter: 'Dana Flores', status: 'Pending Review', reason: 'Review contains abusive language and is clearly targeted harassment toward the seller.', subject: 'Review on: Lab Goggles', date: 'Jun 22, 2026' },
  { reportType: 'Listing Report', reportId: 'RPT-3022', reporter: 'Kyle Reyes', status: 'Pending Review', reason: 'Duplicate listing posted multiple times to push other sellers down the queue.', subject: 'Listing: Arduino Mega 2560', date: 'Jun 23, 2026' },
  { reportType: 'User Report', reportId: 'RPT-3023', reporter: 'Lia Castillo', status: 'Pending Review', reason: 'Account appears to be a bot creating fake listings with no intention to sell.', subject: 'User: @bot_seller99', date: 'Jun 23, 2026' },
];
let _reportsPage = 1;

function renderReportsPage() {
  const container = document.getElementById('reports-stack-list');
  if (!container) return;

  const perPage = getItemsPerPage('reports');
  const start = (_reportsPage - 1) * perPage;
  const slice = _reportsArray.slice(start, start + perPage);

  if (!_reportsArray.length) {
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

  updateCounter('.reports-counter-text', 'Pending Reports', _reportsArray.length);
  renderPagination('reports-stack-list', _reportsArray.length, _reportsPage, p => { _reportsPage = p; renderReportsPage(); }, perPage);
  initSearch('.report-row-card');
}

function displayReports() {
  renderReportsPage();
  setupResizePagination('reports', () => { _reportsPage = 1; renderReportsPage(); });
}

function handleReportAction(action, reportId, btn) {
  const row = btn.closest('.report-row-card');
  if (action === 'warning') {
    showToast('Warning Issued', `Warning sent for report #${reportId}.`, 'warning');
  } else {
    showToast('Dismissed', `Report #${reportId} has been dismissed.`, 'info');
  }
  if (row) row.style.opacity = '0.4';
  btn.closest('.report-action-group').querySelectorAll('button').forEach(b => b.disabled = true);
}

