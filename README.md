# CampusCart

**Student essentials, student prices.**

CampusCart is a peer-to-peer campus marketplace where university students can buy and sell secondhand items — textbooks, electronics, lab tools, clothing, and more. Built as a frontend prototype for CCDEVAP (De La Salle University).

---

## Features

**Marketplace**
- Browse listings with search, category filters, and condition/price range filters
- Item detail pages with seller info and ratings
- Shopping cart

**User Dashboard**
- Create and manage listings (with live preview before submission)
- View seller ratings and reviews
- Track claimed/sold items and earnings
- Personal profile with stats

**Admin Dashboard**
- Approve or reject submitted listings
- Manage users (active, suspended, banned)
- View analytics charts: registrations, items sold, category popularity, listing statuses, reports
- Handle user reports and category management

**Auth Flow**
- University email restricted (`.edu.ph` domains only)
- Email verification via code during registration
- Password reset flow
- Session-based routing (student vs. admin)

**UI**
- Light and dark mode toggle
- Responsive layout (top nav + sidebar + bottom nav)
- Toast notifications

---

## Project Structure

```
CCDEVAP-S16-1-CampusCart/
|-- frontend/
|   |-- login-path/               # Auth pages (login, register, verify, forgot password)
|   |-- homepage/                 # Marketplace (browse, item detail, cart, seller profile)
|   |-- user-profile-dashboard/   # Student area (dashboard, profile, listings, ratings, claimed)
|   |-- admin-dashboard/          # Admin panel (dashboard, users, admins, approvals, categories, reports)
|   |-- css/                      # Stylesheets
|   `-- js/                       # JavaScript
|-- backend/                      # Client-side API/search helpers for the prototype
`-- data/                         # Mock JSON data
```
---

## Tech Stack

- **Vanilla HTML, CSS, JavaScript** — no frameworks or build tools
- **Chart.js** — analytics charts in the admin and user dashboards
- **localStorage** — session management and theme persistence
- **JSON** — mock data (no backend)

---

## Key User Flows

1. **Register** — `frontend/login-path/emailVerification.html` → enter email → code `123456` → fill profile → dashboard
2. **Login as student** — `frontend/login-path/login.html` → redirects to `frontend/user-profile-dashboard/dashboard.html`
3. **Login as admin** — same login page → redirects to `frontend/admin-dashboard/adminDashboard.html`
4. **Add a listing** — `frontend/user-profile-dashboard/addListing.html` → fill form → submitted for admin approval
5. **Browse & buy** — `frontend/homepage/homepage.html` → search/filter → item detail → add to cart

---

## Status

This is a **frontend-only prototype**. The following are mocked or not yet implemented:

- Backend API / database
- Real authentication and email sending
- Image uploads
- Payment processing

---

## Team

CCDEVAP S16 Group 1 — De La Salle University
