# CampusCart

**Student essentials, student prices.**

CampusCart is a peer-to-peer campus marketplace where university students can buy and sell secondhand items — textbooks, electronics, lab tools, clothing, and more. Built for CCDEVAP (De La Salle University) with a vanilla HTML/CSS/JS frontend and a Node.js/Express/MongoDB backend.

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
- Email verification via a one-time code sent through EmailJS during registration
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
|   `-- js/                       # JavaScript (hits the Express API at http://localhost:3000)
|-- backend/
|   |-- routes/                   # Express route handlers (auth, listings, users, admin, etc.)
|   |-- models/                   # Mongoose schemas (User, Listing, Category, Cart, Rating, ...)
|   |-- utils/                    # Helpers (id generation, image storage, notifications)
|   |-- uploads/                  # Uploaded listing/profile images (created at runtime)
|   |-- db.js                     # MongoDB connection (Mongoose)
|   `-- api.js / search.js        # Shared API helpers
|-- server.js                     # Express app entry point
|-- package.json
`-- .env                          # Local environment config (not committed)
```
---

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript — no frameworks or build tools
- **Backend:** Node.js + Express 5
- **Database:** MongoDB via Mongoose
- **Auth:** bcryptjs for password hashing, EmailJS for OTP verification emails
- **Chart.js** — analytics charts in the admin and user dashboards
- **localStorage** — session/theme persistence on the client

---

## Setup & Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ and npm
- A MongoDB connection string (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works)
- An [EmailJS](https://www.emailjs.com/) account (service ID, template ID, public key, private key) — used to send registration/password-reset OTP codes

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
MONGO_URI=your-mongodb-connection-string
PORT=3000

EMAILJS_SERVICE_ID=your-emailjs-service-id
EMAILJS_TEMPLATE_ID=your-emailjs-template-id
EMAILJS_PUBLIC_KEY=your-emailjs-public-key
EMAILJS_PRIVATE_KEY=your-emailjs-private-key
```

The EmailJS template should accept `to_email`, `to_name`, and `otp_code` variables — these are what `backend/routes/auth.js` sends when generating a one-time code.

### 3. Run the server

```bash
npm run dev    # nodemon, auto-restarts on file changes
# or
npm start       # plain node
```

The app (frontend + API) is served together at **http://localhost:3000**.

### 4. Create an admin account

There's no seed script yet. Register a normal student account through the UI, then in MongoDB manually set that user's `role` field from `"student"` to `"admin"` (e.g. via Atlas's Data Explorer or `mongosh`). Logging in again with that account will route to the admin dashboard.

---

## Key User Flows

1. **Register** — `frontend/login-path/emailVerification.html` → enter `.edu.ph` email → enter the OTP emailed via EmailJS → fill profile → dashboard
2. **Login as student** — `frontend/login-path/login.html` → redirects to `frontend/user-profile-dashboard/dashboard.html`
3. **Login as admin** — same login page → redirects to `frontend/admin-dashboard/adminDashboard.html`
4. **Add a listing** — `frontend/user-profile-dashboard/addListing.html` → fill form → submitted for admin approval
5. **Browse & buy** — `frontend/homepage/homepage.html` → search/filter → item detail → add to cart

---

## Team

CCDEVAP S16 Group 1 — De La Salle University

- AGUIRRE, Mikyla Kirsten P.
- LAWAN, Giancarlo M.
- LLAGAS, Bernard Florian T.
- PARADO, Sky Hannah G.
- SARABIA, Camille Erika D.
