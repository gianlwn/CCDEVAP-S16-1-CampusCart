let _editTargetCard = null;

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
    label:    'display:block;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.5px;margin-bottom:4px;',
    input:    'display:block;width:100%;padding:8px 10px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;',
    select:   'display:block;width:100%;padding:8px 10px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;cursor:pointer;',
    primary:  'padding:8px 18px;border:none;background:var(--accent);border-radius:999px;cursor:pointer;color:#fff;font-size:13px;font-weight:700;font-family:inherit;',
    cancel:   'padding:8px 18px;border:1px solid var(--border);background:transparent;border-radius:999px;cursor:pointer;color:var(--text);font-size:13px;font-family:inherit;',
    footer:   'display:flex;justify-content:flex-end;gap:8px;margin-top:20px;',
    title:    'margin:0 0 16px;font-size:15px;font-weight:700;color:var(--text);',
    body:     'display:flex;flex-direction:column;gap:14px;',
    row:      'display:flex;flex-direction:column;gap:4px;',
};

/* ─────────────────────────────────────────────
   SEARCH HELPERS
───────────────────────────────────────────── */
function initSearch(cardSelector) {
    const input = document.querySelector('.search-input-field');
    const btn   = document.querySelector('.search-glass-btn');
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
    const q         = (document.querySelector('.search-input-field')?.value || '').toLowerCase().trim();
    const statusVal = (document.querySelector('.status-filter-dropdown')?.value || 'all').toLowerCase();

    document.querySelectorAll('.user-identity-row-card').forEach(card => {
        const textMatch   = !q || card.textContent.toLowerCase().includes(q);
        const badge       = card.querySelector('.badge-pill');
        const status      = badge?.textContent.trim().toLowerCase() || '';
        const statusMatch = statusVal === 'all' || status === statusVal;
        card.style.display = (textMatch && statusMatch) ? '' : 'none';
    });
}

function initUserSearch() {
    const input  = document.querySelector('.search-input-field');
    const btn    = document.querySelector('.search-glass-btn');
    const select = document.querySelector('.status-filter-dropdown');
    if (input) {
        input.addEventListener('input', applyUserFilters);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') applyUserFilters(); });
    }
    if (btn)    btn.addEventListener('click', applyUserFilters);
    if (select) select.addEventListener('change', applyUserFilters);
}

/* ─────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────── */
function loadAdminSideNav(page) {
    const html = `
    <div class="nav-links">
      <a href="adminDashboard.html" class="nav-item">Admin Dashboard</a>
      <a href="listingApproval.html" class="nav-item">Listings Approval</a>
      <a href="reports.html" class="nav-item">Reports</a>
      <a href="users.html" class="nav-item">Users</a>
      <a href="categories.html" class="nav-item">Categories</a>
      <a href="admins.html" class="nav-item">Admins</a>
    </div>
    <div class="sign-out-box">
      <a href="#" class="sign-out-btn">Sign Out</a>
    </div>
  `;

    const sidebar = document.getElementById("admin-side-nav");
    sidebar.innerHTML = html;

    const activeLink = sidebar.querySelector(`a[href="${page}"]`);
    if (activeLink) activeLink.classList.add("active");
}

/* ─────────────────────────────────────────────
   ADMINS
───────────────────────────────────────────── */
function displayAdmins() {
    const container = document.getElementById("admins-stack-list");
    if (!container) return;

    const adminsArray = [
        { username: "Mikyla Kirsten Aguirre", email: "mikyla_kirsten_aguirre@dlsu.edu.ph", status: "active" },
        { username: "Giancarlo Lawan",         email: "giancarlo_lawan@dlsu.edu.ph",         status: "active" },
        { username: "Bernard Florian Llagas",  email: "bernard_florian_llagas@dlsu.edu.ph",  status: "inactive" },
        { username: "Sky Hannah Parado",        email: "sky_parado@dlsu.edu.ph",               status: "active" },
        { username: "Camille Erika Sarabia",    email: "camille_erika_sarabia@dlsu.edu.ph",   status: "active" },
    ];

    if (!adminsArray.length) {
        container.innerHTML = `<div class="empty-msg">No administrators found. Click "Add Administrator" to create one.</div>`;
    } else {
        container.innerHTML = adminsArray.map(admin => {
            const isActive   = admin.status?.toLowerCase() === 'active';
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
    }

    initSearch('.admin-identity-row-card');
}

function handleAdmin(action, username, email, status, btn) {
    const card  = btn.closest('.admin-identity-row-card');
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
        if (!confirm(`Revoke admin access for ${username}?`)) return;
        if (badge) { badge.className = 'badge-pill pill-status-inactive'; badge.textContent = 'Inactive'; }
        btn.disabled = true;
        showToast('Access Revoked', `${username}'s admin access has been revoked.`, 'warning');
    }
}

function saveAdminEdit() {
    const name  = document.getElementById('modal-admin-name')?.value.trim();
    const email = document.getElementById('modal-admin-email')?.value.trim();
    if (!name || !email) { showToast('Error', 'Name and email cannot be empty.', 'error'); return; }
    if (_editTargetCard) {
        _editTargetCard.querySelector('.admin-display-name').textContent = name;
        _editTargetCard.querySelector('.admin-display-email').textContent = email;
    }
    closeModal();
    showToast('Saved', 'Administrator updated successfully.', 'success');
}

/* ─────────────────────────────────────────────
   USERS
───────────────────────────────────────────── */
function displayUsers() {
    const container = document.getElementById("users-stack-list");
    if (!container) return;

    const usersArray = [
        { username: "Andie Kirsten Woo",   email: "andie_woo@dlsu.edu.ph",    dateJoined: "Jun 12, 2026", status: "active" },
        { username: "Alexa Nicole Pleyto", email: "alexa_pleyto@dlsu.edu.ph", dateJoined: "May 28, 2026", status: "suspended" },
        { username: "Christine Cote",      email: "tintin_cote@dlsu.edu.ph",  dateJoined: "Apr 04, 2026", status: "banned" },
    ];

    if (!usersArray.length) {
        container.innerHTML = `<div class="empty-msg">No users found.</div>`;
    } else {
        container.innerHTML = usersArray.map(user => {
            const isActive    = user.status?.toLowerCase() === 'active';
            const isSuspended = user.status?.toLowerCase() === 'suspended';
            const pillClass   = isActive ? 'pill-status-active' : (isSuspended ? 'pill-status-suspended' : 'pill-status-banned');
            const statusText  = isActive ? 'Active' : (isSuspended ? 'Suspended' : 'Banned');
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
                    <div class="user-status-badge-zone">
                        <span class="badge-pill ${pillClass}">${statusText}</span>
                    </div>
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
                </div>`;
        }).join('');
    }

    initUserSearch();
}

function handleUser(action, username, email, dateJoined, status, btn) {
    const card  = btn.closest('.user-identity-row-card');
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
                        <option value="active"    ${currentStatus === 'active'    ? 'selected' : ''}>Active</option>
                        <option value="suspended" ${currentStatus === 'suspended' ? 'selected' : ''}>Suspended</option>
                        <option value="banned"    ${currentStatus === 'banned'    ? 'selected' : ''}>Banned</option>
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
            if (!confirm(`Unban ${username} and restore their account?`)) return;
            if (badge) { badge.className = 'badge-pill pill-status-active'; badge.textContent = 'Active'; }
            showToast('Unbanned', `${username} has been unbanned.`, 'success');
        } else {
            if (!confirm(`Ban ${username}? This will restrict their account.`)) return;
            if (badge) { badge.className = 'badge-pill pill-status-banned'; badge.textContent = 'Banned'; }
            showToast('Banned', `${username} has been banned.`, 'error');
        }
    }
}

function saveUserEdit(username) {
    const select = document.getElementById('modal-user-status');
    if (!select || !_editTargetCard) return;
    const newStatus = select.value;
    const badge     = _editTargetCard.querySelector('.badge-pill');
    if (badge) {
        const pillMap = { active: 'pill-status-active', suspended: 'pill-status-suspended', banned: 'pill-status-banned' };
        const labelMap = { active: 'Active', suspended: 'Suspended', banned: 'Banned' };
        badge.className   = `badge-pill ${pillMap[newStatus]}`;
        badge.textContent = labelMap[newStatus];
    }
    closeModal();
    showToast('Updated', `${username}'s status has been updated.`, 'success');
}

/* ─────────────────────────────────────────────
   LISTING APPROVALS
───────────────────────────────────────────── */
function displayListingApprovals() {
    const container = document.getElementById("approval-grid");
    if (!container) return;

    const listingApprovalsArray = [
        { productName: "Test Product", listingId: "LST-1001", price: 250,    seller: "Kathryn Bernardo" },
        { productName: "Test Product", listingId: "LST-1002", price: 950,    seller: "Kimi Antonelli" },
        { productName: "Test Product", listingId: "LST-1003", price: 500.50, seller: "Garrett Graham" },
        { productName: "Test Product", listingId: "LST-1004", price: 310,    seller: "Jeron Teng" },
    ];

    if (!listingApprovalsArray.length) {
        container.innerHTML = `<div class="empty-msg">No listings needed for approval.</div>`;
    } else {
        container.innerHTML = listingApprovalsArray.map(listing => `
            <div class="listing-card">
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
                <div class="listing-actions">
                    <button class="approve-btn" onclick="handleApproval('approve','${listing.listingId}',this)">${ICONS.check} Approve</button>
                    <button class="reject-btn"  onclick="handleApproval('reject', '${listing.listingId}',this)">${ICONS.close} Reject</button>
                </div>
            </div>
        `).join('');
    }
}

/* ─────────────────────────────────────────────
   CATEGORIES
───────────────────────────────────────────── */
function displayCategories() {
    const container = document.getElementById("category-grid");
    if (!container) return;

    const categoriesArray = [
        { categoryName: "Electronics",     categoryId: "CTG-1001" },
        { categoryName: "Clothing",        categoryId: "CTG-1002" },
        { categoryName: "School Supplies", categoryId: "CTG-1003" },
        { categoryName: "Books",           categoryId: "CTG-1004" },
    ];

    if (!categoriesArray.length) {
        container.innerHTML = `<div class="empty-msg">No categories found.</div>`;
    } else {
        container.innerHTML = categoriesArray.map(category => `
            <div class="category-card">
                <div class="card-top">
                    <div class="category-image"></div>
                    <div class="category-info">
                        <h2>${category.categoryName}</h2>
                        <p>${category.categoryId}</p>
                    </div>
                </div>
                <div class="category-actions">
                    <button class="edit-btn"   onclick="handleCategory('edit',  '${category.categoryId}',this)">${ICONS.edit}  Edit</button>
                    <button class="delete-btn" onclick="handleCategory('delete','${category.categoryId}',this)">${ICONS.trash} Delete</button>
                </div>
            </div>
        `).join('');
    }

    initSearch('.category-card');
}

/* ─────────────────────────────────────────────
   REPORTS
───────────────────────────────────────────── */
function displayReports() {
    const container = document.getElementById("reports-stack-list");
    if (!container) return;

    const reportsArray = [
        { reportType: "User Report",    reportId: "RPT-3012", reporter: "Andie Kirsten Woo",   status: "Pending Review", reason: "Spam account repeatedly posting misleading listings.",         subject: "User: @marie_santos",  date: "Jun 14, 2026" },
        { reportType: "Listing Report", reportId: "RPT-3013", reporter: "Alexa Nicole Pleyto", status: "Pending Review", reason: "Possible scam listing requesting payment outside the website.", subject: "Listing: Casio FX-991EX", date: "Jun 15, 2026" },
        { reportType: "User Report",    reportId: "RPT-3014", reporter: "Christine Cote",       status: "Pending Review", reason: "Hate speech directed toward another user in listing comments.", subject: "User: @jay_ramos",      date: "Jun 15, 2026" },
    ];

    if (!reportsArray.length) {
        container.innerHTML = `<div class="empty-msg">No reports found.</div>`;
    } else {
        container.innerHTML = reportsArray.map(report => `
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
                    <button class="warning-btn" onclick="handleReportAction('warning','${report.reportId}',this)">
                        ${ICONS.shield} Warning
                    </button>
                    <button class="dismiss-btn" onclick="handleReportAction('dismiss','${report.reportId}',this)">
                        ${ICONS.close} Dismiss
                    </button>
                </div>
            </div>
        `).join('');
    }
}

/* ─────────────────────────────────────────────
   ACTION HANDLERS
───────────────────────────────────────────── */
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

function handleCategory(action, categoryId, btn) {
    const card   = btn.closest('.category-card');
    const nameEl = card?.querySelector('h2');

    if (action === 'edit') {
        const current = nameEl?.textContent.trim() || '';
        const newName = prompt('Rename category:', current);
        if (newName === null) return;
        const trimmed = newName.trim();
        if (!trimmed) { showToast('Error', 'Category name cannot be empty.', 'error'); return; }
        if (nameEl) nameEl.textContent = trimmed;
        showToast('Updated', `Category renamed to "${trimmed}".`, 'success');
    } else {
        if (!confirm('Delete this category?')) return;
        showToast('Deleted', `Category ${categoryId} removed.`, 'success');
        if (card) card.remove();
    }
}
