require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");
const connectDB = require("./backend/db");
const sanitizeInput = require("./backend/middleware/sanitize");

const app = express();

// When deployed behind a reverse proxy (Apache/Nginx in front of this Node
// process), Express needs to know how many hops to trust so req.ip and the
// X-Forwarded-For header are read correctly — express-rate-limit throws on
// every request without this once a proxy is in the path. Left unset (the
// local-dev default) so a spoofed X-Forwarded-For can't be trusted blindly
// when nothing is actually proxying.
if (process.env.TRUST_PROXY) {
  const hops = Number(process.env.TRUST_PROXY);
  app.set("trust proxy", Number.isNaN(hops) ? process.env.TRUST_PROXY : hops);
}

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Helmet's CSP defaults (merged in unless disabled) include
        // upgrade-insecure-requests, which forces every request on the page
        // — subresources and full navigations alike — to https regardless
        // of the browser's own settings. This deployment is plain http only
        // (CCS Cloud gives no TLS on this port), so that default silently
        // breaks every asset load and link click. Explicitly null it out.
        upgradeInsecureRequests: null,
        // The UI relies on inline onclick="" handlers throughout; removing
        // 'unsafe-inline' would break the app. escaping in the render layer
        // (see frontend/js) is the real XSS defense, this is defense-in-depth.
        // scriptSrcAttr must be set explicitly too - helmet defaults it to
        // 'none' even when scriptSrc allows 'unsafe-inline', which silently
        // blocks every onclick="" attribute in the app.
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: "same-site" },
  }),
);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(sanitizeInput);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too_many_requests" },
});
app.use("/api/auth", authLimiter);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too_many_requests" },
});
app.use("/api", apiLimiter);

app.use("/uploads", express.static(path.join(__dirname, "backend", "uploads")));

connectDB();

app.use("/api/auth", require("./backend/routes/auth"));
app.use("/api/listings", require("./backend/routes/listings"));
app.use("/api/categories", require("./backend/routes/categories"));
app.use("/api/cart", require("./backend/routes/cart"));
app.use("/api/users", require("./backend/routes/users"));
app.use("/api/dashboard", require("./backend/routes/dashboard"));
app.use("/api/ratings", require("./backend/routes/ratings"));
app.use("/api/claims", require("./backend/routes/claims"));
app.use("/api/reports", require("./backend/routes/reports"));
app.use("/api/notifications", require("./backend/routes/notifications"));
app.use("/api/admin", require("./backend/routes/admin"));

app.use(express.static("frontend"));
// Only these two browser-facing scripts are exposed under /backend; the rest of
// the backend/ tree (controllers, models, middleware, db.js) must stay private.
app.get("/backend/api.js", (req, res) =>
  res.sendFile(path.join(__dirname, "backend", "api.js")),
);
app.get("/backend/search.js", (req, res) =>
  res.sendFile(path.join(__dirname, "backend", "search.js")),
);
app.use("/data", express.static("data"));
app.get("/", (req, res) =>
  // A relative (no leading slash) redirect target so the browser lands on
  // login-path/login.html relative to wherever this app is actually mounted
  // (root, or a reverse-proxy path prefix) — res.sendFile() here would leave
  // the address bar at "/", breaking every relative asset path on that page.
  res.redirect("login-path/login.html"),
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at ${CLIENT_ORIGIN}`));
