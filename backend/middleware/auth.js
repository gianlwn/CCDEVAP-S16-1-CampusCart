const jwt = require("jsonwebtoken");

const COOKIE_NAME = "cc_session";
const TOKEN_TTL = "7d";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

function issueSession(res, user) {
  const token = jwt.sign(
    { user_id: user.user_id, role: user.role },
    getSecret(),
    { expiresIn: TOKEN_TTL },
  );
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    // Tied to an explicit flag, not NODE_ENV: a "production" deploy served
    // over plain http (no TLS) would otherwise get a Secure cookie the
    // browser silently refuses to send, breaking every login/session check.
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function clearSession(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

function readUser(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getSecret());
    return { user_id: payload.user_id, role: payload.role };
  } catch {
    return null;
  }
}

function attachUser(req, res, next) {
  req.user = readUser(req);
  next();
}

function requireAuth(req, res, next) {
  const user = readUser(req);
  if (!user) return res.status(401).json({ error: "not_authenticated" });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "forbidden" });
    }
    next();
  });
}

function requireSelfOrAdmin(paramName) {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      if (req.user.role === "admin" || req.user.user_id === req.params[paramName]) {
        return next();
      }
      return res.status(403).json({ error: "forbidden" });
    });
  };
}

module.exports = {
  COOKIE_NAME,
  issueSession,
  clearSession,
  attachUser,
  requireAuth,
  requireAdmin,
  requireSelfOrAdmin,
};
