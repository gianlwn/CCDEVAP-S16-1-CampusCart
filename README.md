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
- httpOnly signed-cookie sessions — the server verifies who you are on every request instead of trusting the client (see [Security](#security))
- Role-based routing and access control (student vs. admin)

**UI**
- Light and dark mode toggle — saved per account (synced to the server, not just the browser) and defaults to light for signed-out visitors
- Responsive layout (top nav + sidebar + bottom nav)
- Long record lists (bought items, my listings, reviews, seller profile) scroll within a fixed-height panel instead of growing the page indefinitely
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
|   |-- controllers/              # Route logic, one file per resource
|   |-- models/                   # Mongoose schemas (User, Listing, Category, Cart, Rating, ...)
|   |-- middleware/                # auth.js (sessions/roles), sanitize.js (NoSQL injection guard)
|   |-- utils/                    # Helpers (id generation, image storage, notifications)
|   |-- uploads/                  # Uploaded listing/profile images (created at runtime)
|   |-- db.js                     # MongoDB connection (Mongoose)
|   `-- api.js / search.js        # Shared API helpers (only these two are served to the browser)
|-- scripts/                      # One-off local DB scripts (gitignored, e.g. backfill.js)
|-- server.js                     # Express app entry point (security middleware lives here)
|-- package.json
`-- .env                          # Local environment config (not committed)
```
---

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript — no frameworks or build tools
- **Backend:** Node.js + Express 5
- **Database:** MongoDB via Mongoose
- **Auth:** bcryptjs for password hashing, jsonwebtoken for signed session cookies, EmailJS for OTP verification emails
- **Security middleware:** helmet (headers/CSP), express-rate-limit (brute-force protection), cookie-parser, a custom NoSQL-injection sanitizer
- **Chart.js** — analytics charts in the admin and user dashboards
- **localStorage** — used as a client-side cache (session display name, theme) for instant UI, not as the source of truth — the server session cookie and the account's DB record are authoritative

---

## Dependencies Used

The frontend has zero dependencies — plain HTML/CSS/JS, no npm install needed for it. Everything below is backend-only (`package.json`).

| Package | Version | Purpose |
|---|---|---|
| `express` | ^5.2.1 | Web server / routing |
| `mongoose` | ^9.7.3 | MongoDB ODM (schemas, models, queries) |
| `bcryptjs` | ^3.0.3 | Password hashing |
| `jsonwebtoken` | ^9.0.3 | Signs/verifies the session cookie |
| `cookie-parser` | ^1.4.7 | Reads the session cookie off incoming requests |
| `helmet` | ^8.3.0 | Security headers + Content-Security-Policy |
| `express-rate-limit` | ^8.6.1 | Rate limiting on auth and general API routes |
| `cors` | ^2.8.6 | Cross-origin request handling |
| `@emailjs/nodejs` | ^5.0.2 | Sends OTP verification/recovery emails |
| `dotenv` | ^17.4.2 | Loads `.env` into `process.env` |

**Dev dependency**

| Package | Version | Purpose |
|---|---|---|
| `nodemon` | ^3.1.14 | Auto-restarts the server on file changes (`npm run dev`) |

---

## Setup & Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ and npm
- Access to the team's shared MongoDB Atlas cluster and EmailJS account — ask a team member for the connection string and API keys

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root using the team's shared MongoDB cluster and EmailJS credentials:

```env
MONGO_URI=team-mongodb-connection-string
PORT=3000

# Random secret used to sign session cookies. Generate your own with:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=a-long-random-string

# Origin the frontend is served from (used for the CORS allow-list)
CLIENT_ORIGIN=http://localhost:3000

# Only set to "true" when the site is actually served over https — it makes
# the session cookie Secure-only, which browsers silently refuse to send
# over plain http (this would break every login). Leave unset for local dev
# and for the CCS Cloud deployment (plain http).
COOKIE_SECURE=false

# Only set when running behind a reverse proxy (Apache/Nginx in front of
# this Node process, e.g. the CCS Cloud deployment). Number of proxy hops
# to trust for X-Forwarded-For — usually 1. Leave unset for local dev.
TRUST_PROXY=

EMAILJS_SERVICE_ID=team-emailjs-service-id
EMAILJS_TEMPLATE_ID=team-emailjs-template-id
EMAILJS_PUBLIC_KEY=team-emailjs-public-key
EMAILJS_PRIVATE_KEY=team-emailjs-private-key
```

The EmailJS template should accept `to_email`, `to_name`, and `otp_code` variables — these are what `backend/routes/auth.js` sends when generating a one-time code.

> Every teammate needs their own `JWT_SECRET` locally (any random string works — it doesn't need to match anyone else's). Sessions signed with one secret aren't valid against another, so changing it just logs everyone out and requires signing in again.

### 3. Run the server

```bash
npm run dev    # nodemon, auto-restarts on file changes
# or
npm start       # plain node
```

The app (frontend + API) is served together at **http://localhost:3000**.

### Scripts

`scripts/` holds one-off local DB maintenance scripts (gitignored, not part of the app). Run with `node scripts/<name>.js`. Example: `backfill.js` sets a default value on existing user rows for a schema field that was added after data already existed (e.g. `theme`).

---

## Deployment (CCS Cloud / Proxmox)

The app is a single Node/Express process serving both the frontend and the API — there is no separate build step. To deploy on a CCS Cloud VM at a URL like `http://ccscloud.dlsu.edu.ph:<port>/<repo-name>/`:

1. **Clone and install** on the VM (e.g. into `/var/www/html/CCDEVAP-S16-1-CampusCart`):
   ```bash
   git clone <repo-url> /var/www/html/CCDEVAP-S16-1-CampusCart
   cd /var/www/html/CCDEVAP-S16-1-CampusCart
   npm install --omit=dev
   ```
2. **Create `.env` on the server** (it's gitignored, so it never comes from `git pull`) — use the template above. Set `MONGO_URI`/`JWT_SECRET`/EmailJS keys, and:
   - `CLIENT_ORIGIN` = the real public URL's origin, e.g. `http://ccscloud.dlsu.edu.ph:60143`
   - `COOKIE_SECURE=false` unless the site is actually served over `https://`
   - `TRUST_PROXY=1` if Apache/Nginx sits in front of the Node process (see below)
3. **MongoDB Atlas network access** — add the VM's public IP to the Atlas cluster's IP allow-list (Network Access tab), or the app can't reach the database from the VM even with a correct `MONGO_URI`.
4. **Run Node as a persistent service** so it survives SSH disconnects/reboots — e.g. with `pm2`:
   ```bash
   npm install -g pm2
   pm2 start server.js --name campuscart
   pm2 save
   pm2 startup   # follow the printed command to enable on boot
   ```
5. **Reverse proxy the URL path to the Node port.** The app expects to own its entire origin — it doesn't know about the `/<repo-name>/` path segment. Apache needs to strip that prefix before forwarding to Node (the app already derives its own base path from the browser, so this needs to be consistent, not stripped-then-re-added):
   ```apache
   ProxyPreserveHost On
   ProxyPass /CCDEVAP-S16-1-CampusCart/ http://127.0.0.1:3000/
   ProxyPassReverse /CCDEVAP-S16-1-CampusCart/ http://127.0.0.1:3000/
   ```
   (requires `a2enmod proxy proxy_http` on Debian/Ubuntu). If Apache is only serving this one app on its assigned port, proxying the whole vhost root (`ProxyPass / http://127.0.0.1:3000/`) instead is simpler and avoids path-prefix edge cases entirely.

---

## Security

The API originally trusted whatever identity the client claimed (a plain `user_id` in `localStorage`), and the admin endpoints had no access control at all. That's been replaced with real server-side authentication and authorization:

**Sessions**
- Login/register issue a signed, `httpOnly`, `SameSite=Lax` JWT cookie (`backend/middleware/auth.js`) — the server verifies identity from the cookie on every request instead of trusting client-supplied IDs.
- `requireAuth`, `requireAdmin`, and `requireSelfOrAdmin` middleware gate every route; controllers derive the acting user from `req.user`, not from `req.body`/`req.query`.
- `POST /api/auth/logout` clears the cookie server-side; `GET /api/auth/me` lets the client re-sync (e.g. for cross-device theme sync) without re-sending credentials.
- Password policy (`backend/utils/passwordPolicy.js`) is enforced server-side on register, reset, and change-password (`400 { error: "weak_password" }` if it fails) and mirrored client-side for instant feedback: minimum 8 characters, with at least one uppercase letter, one lowercase letter, one digit, and one symbol.

**Access control**
- All `/api/admin/*` routes (promote/revoke admin, admin dashboard) require `role: admin` — previously anyone could call these unauthenticated.
- Actions on your own resources (cart, listings, claims, ratings, reports, notifications, profile) are checked against the session's `user_id`, not a client-supplied one — closes the impersonation/IDOR gap where editing `localStorage` let you act as any account.

**Injection & XSS**
- `backend/middleware/sanitize.js` strips `$`-prefixed and dotted keys from `req.body`/`query`/`params` before they reach Mongoose, preventing NoSQL operator injection (e.g. `{"email":{"$ne":null}}`).
- All user-controlled text (listing titles/descriptions, bios, reviews, report reasons, etc.) is HTML-escaped at render time (`escapeHtml()` in `components.js`/`adminComponents.js`) before being written via `innerHTML` in cards, detail modals, and the notification list. Transient UI text — toast messages (`toastNotification.js`) and confirm-dialog prompts (`showConfirm()` in `components.js`) — is set via `textContent` instead of `innerHTML`, so it's always rendered as literal text no matter what it contains. Together these close a stored-XSS hole that affected every page rendering API data, including the admin panel (e.g. approving a listing titled `<img src=x onerror=...>` used to execute in the success toast).

**Other hardening**
- `helmet` sets security headers and a Content-Security-Policy (script/style restricted to same-origin + the one Chart.js CDN in use). Note: `script-src`/`script-src-attr` allow `'unsafe-inline'` because the UI relies on inline `onclick=""` throughout — the escaping above is the actual XSS defense, CSP here is defense-in-depth, not the primary control. Helmet's `upgrade-insecure-requests` CSP default is explicitly disabled — left on, it forces every request (subresources and navigations alike) to `https`, which silently breaks the app on the plain-`http` CCS Cloud deployment.
- `express-rate-limit` throttles `/api/auth/*` (100 req/15 min — high enough that a shared-WiFi demo audience on one IP doesn't get walled off) and the rest of the API (300 req/min) to blunt brute-force and abuse.
- CORS is restricted to `CLIENT_ORIGIN` instead of wide open.
- Only `backend/api.js` and `backend/search.js` are served to the browser under `/backend` — the rest of `backend/` (controllers, models, middleware, `db.js`) is no longer web-accessible (it previously was, via a blanket static mount).

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
