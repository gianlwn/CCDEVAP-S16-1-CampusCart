const API = "http://localhost:3000";

function getSessionUserId() {
  return localStorage.getItem("session_user_id");
}

function fetchListings() {
  return fetch(`${API}/api/listings`).then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  });
}

function fetchCartItems() {
  const userId = getSessionUserId();
  if (!userId) return Promise.resolve([]);
  return fetch(`${API}/api/cart?user_id=${encodeURIComponent(userId)}`).then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  });
}

// Alias kept so existing callers don't break
function fetchClaimedItems() {
  return fetchCartItems();
}

function fetchSellerProfile(user_id) {
  return fetch(`${API}/api/users/${encodeURIComponent(user_id)}`).then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  });
}

function addToCartAPI(listing_id) {
  const user_id = getSessionUserId();
  if (!user_id) return Promise.reject(new Error("not_logged_in"));
  return fetch(`${API}/api/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, listing_id }),
  }).then((r) => r.json().then((data) => ({ ok: r.ok, status: r.status, data })));
}

function removeFromCartAPI(cart_id) {
  return fetch(`${API}/api/cart/${encodeURIComponent(cart_id)}`, {
    method: "DELETE",
  }).then((r) => r.json().then((data) => ({ ok: r.ok, data })));
}

function claimCartItemAPI(cart_id) {
  return fetch(`${API}/api/cart/${encodeURIComponent(cart_id)}/claim`, {
    method: "POST",
  }).then((r) => r.json().then((data) => ({ ok: r.ok, data })));
}

function fetchDashboardData() {
  return fetch("../../data/mock-dashboard.json").then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  });
}

function fetchRatings() {
  return fetch("../../data/mock-ratings.json").then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  });
}

function fetchSellerReviews() {
  return fetch("../../data/mock-seller-reviews.json").then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  });
}
