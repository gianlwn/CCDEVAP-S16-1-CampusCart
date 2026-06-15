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
    if (activeLink) {
        activeLink.classList.add("active");
    }
}

// function displayCharts() {}

function displayAdmins() {
    const container = document.getElementById("admins-stack-list");

    if (!container) {
        return;
    } else {
        const adminsArray = [
            // temporary only (for frontend purposes only)
            { username: "Mikyla Kirsten Aguirre", email: "mikyla_kirsten_aguirre@dlsu.edu.ph", status: "active" },
            { username: "Giancarlo Lawan", email: "giancarlo_lawan@dlsu.edu.ph", status: "active" },
            { username: "Bernard Florian Llagas", email: "bernard_florian_llagas@dlsu.edu.ph", status: "inactive" },
            { username: "Sky Hannah Parado", email: "sky_parado@dlsu.edu.ph", status: "active" },
            { username: "Camille Erika Sarabia", email: "camille_erika_sarabia@dlsu.edu.ph", status: "active" },

        ];

        if (adminsArray.length === 0) {
            container.innerHTML = `
            <div class="empty-msg">
                No administrators found. Click "Add Administrator" to create one.
            </div>
            `;
        } else {
            container.innerHTML = adminsArray.map(admin => {
                const isActive = admin.status && admin.status.toLowerCase() === 'active';
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
                            <button class="action-trigger edit-trigger-btn">
                                <i class="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                            <div class="button-inner-divider"></div>
                            <button class="action-trigger revoke-trigger-btn">
                                <i class="fa-solid fa-user-slash"></i> Revoke
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

function displayUsers() {
    const container = document.getElementById("users-stack-list");

    if (!container) {
        return;
    } else {
        const usersArray = [
            // temporary only (for frontend purposes only)
            { username: "Andie Kirsten Woo", email: "andie_woo@dlsu.edu.ph", dateJoined: "Jun 12, 2026", status: "active" },
            { username: "Alexa Nicole Pleyto", email: "alexa_pleyto@dlsu.edu.ph", dateJoined: "May 28, 2026", status: "suspended" },
            { username: "Christine Cote", email: "tintin_cote@dlsu.edu.ph", dateJoined: "Apr 04, 2026", status: "banned" },
        ];

        if (usersArray.length === 0) {
            container.innerHTML = `
            <div class="empty-msg">
                No reports found.
            </div>
            `;
        } else {
            container.innerHTML = usersArray.map(user => {
                const isActive = user.status && user.status.toLowerCase() === 'active';
                const isSuspended = user.status && user.status.toLowerCase() === 'suspended';
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
                        <div class="user-status-badge-zone">
                            <span class="badge-pill ${pillClass}">${statusText}</span>
                        </div>
                        <div class="action-button-group">
                            <button class="action-trigger view-trigger-btn">
                                <i class="fa-solid fa-eye"></i> View
                            </button>
                            <div class="button-inner-divider"></div>
                            <button class="action-trigger ban-trigger-btn">
                                <i class="fa-solid fa-ban"></i> Ban
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

function displayListingApprovals() {
    const container = document.getElementById("approval-grid");

    if (!container) {
        return;
    } else {
        const listingApprovalsArray = [
            // temporary
            { productName: "Test Product", listingId: "LST-1001", price: 250, seller: "Kathryn Bernardo" },
            { productName: "Test Product", listingId: "LST-1002", price: 950, seller: "Kimi Antonelli" },
            { productName: "Test Product", listingId: "LST-1003", price: 500.50, seller: "Garrett Graham" },
            { productName: "Test Product", listingId: "LST-1004", price: 310, seller: "Jeron Teng" },
        ];

        if (listingApprovalsArray.length === 0) {
            container.innerHTML = `
            <div class="empty-msg">
                No listings needed for approval.
            </div>
            `;
        } else {
            container.innerHTML = listingApprovalsArray.map(listing => {
                return `
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
                            <button class="approve-btn">Approve</button>
                            <button class="reject-btn">Reject</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

function displayCategories() {
    const container = document.getElementById("category-grid");

    if (!container) {
        return;
    } else {
        const categoriesArray = [
            // temporary
            { categoryName: "Electronics", categoryId: "CTG-1001" },
            { categoryName: "Clothing", categoryId: "CTG-1002" },
            { categoryName: "School Supplies", categoryId: "CTG-1003" },
            { categoryName: "Books", categoryId: "CTG-1004" },
        ];

        if (categoriesArray.length === 0) {
            container.innerHTML = `
            <div class="empty-msg">
                No categories found.
            </div>
            `;
        } else {
            container.innerHTML = categoriesArray.map(category => {
                return `
                    <div class="category-card">
                        <div class="card-top">
                            <div class="category-image"></div>
                            <div class="category-info">
                                <h2>${category.categoryName}</h2>
                                <p>${category.categoryId}</p>
                            </div>
                        </div>
                        <div class="category-actions">
                            <button class="edit-btn">Edit</button>
                            <button class="delete-btn">Delete</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

function displayReports() {
    const container = document.getElementById("reports-stack-list");

    if (!container) {
        return;
    } else {
        const reportsArray = [
            // temporary only (for frontend purposes only)
            { reportType: "User Report", reportId: "RPT-3012", reporter: "Andie Kirsten Woo",status: "Pending Review", reason: "Spam account repeatedly posting misleading listings." },
            { reportType: "Listing Report", reportId: "RPT-3013", reporter: "Alexa Nicole Pleyto", status: "Pending Review", reason: "Possible scam listing requesting payment outside website." },
            { reportType: "User Report", reportId: "RPT-3014", reporter: "Christine Cote", status: "Pending Review", reason: "Hate speech directed toward another user." },
        ];

        if (reportsArray.length === 0) {
            container.innerHTML = `
            <div class="empty-msg">
                No users found.
            </div>
            `;
        } else {
            container.innerHTML = reportsArray.map(report => {
                
                return `
                    <div class="report-row-card">

                        <div class="avatar-wireframe-box"></div>
        
                        <div class="report-text-details">
                            <span class="report-type">${report.reportType}</span>
                            <span class="report-id">#${report.reportId}</span>
                            <span class="report-reporter">${report.reporter}</span>
                        </div>
        
                        <div class="report-status-zone">
                            <span class="report-status-badge">
                                ${report.status}
                            </span>
                        </div>
        
                        <div class="report-reason-section">
                            <span class="reason-title">Reason:</span>
                            <span class="reason-content">
                                ${report.reason}
                            </span>
                        </div>
        
                        <div class="report-action-group">
                            <button class="warning-btn">
                                Warning
                            </button>
        
                            <button class="dismiss-btn">
                                Dismiss
                            </button>
                        </div>
        
                    </div> 
                `;
            }).join('');
        }
    }
}