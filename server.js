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
        upgradeInsecureRequests: null,
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
  limit: 100,
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
  skip: (req) => req.originalUrl.startsWith("/api/auth"),
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
app.get("/backend/api.js", (req, res) =>
  res.sendFile(path.join(__dirname, "backend", "api.js")),
);
app.get("/backend/search.js", (req, res) =>
  res.sendFile(path.join(__dirname, "backend", "search.js")),
);
app.use("/data", express.static("data"));
app.get("/", (req, res) => res.redirect("login-path/login.html"));

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running at ${CLIENT_ORIGIN}`));
}

module.exports = app;
