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
  return fetch(`${API}/api/cart?user_id=${encodeURIComponent(userId)}`).then(
    (r) => {
      if (!r.ok) throw new Error();
      return r.json();
    },
  );
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

function fetchMyProfile() {
  const userId = getSessionUserId();
  if (!userId) return Promise.reject(new Error("not_logged_in"));
  return fetchSellerProfile(userId);
}

function updateProfileAPI(data) {
  const userId = getSessionUserId();
  if (!userId) return Promise.reject(new Error("not_logged_in"));
  return fetch(`${API}/api/users/${encodeURIComponent(userId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json().then((d) => ({ ok: r.ok, data: d })));
}

function deleteAccountAPI() {
  const userId = getSessionUserId();
  if (!userId) return Promise.reject(new Error("not_logged_in"));
  return fetch(`${API}/api/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  }).then((r) => r.json().then((d) => ({ ok: r.ok, data: d })));
}

function addToCartAPI(listing_id) {
  const user_id = getSessionUserId();
  if (!user_id) return Promise.reject(new Error("not_logged_in"));
  return fetch(`${API}/api/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, listing_id }),
  }).then((r) =>
    r.json().then((data) => ({ ok: r.ok, status: r.status, data })),
  );
}

function removeFromCartAPI(cart_id) {
  return fetch(`${API}/api/cart/${encodeURIComponent(cart_id)}`, {
    method: "DELETE",
  }).then((r) => r.json().then((data) => ({ ok: r.ok, data })));
}

function claimCartItemAPI(cart_id, quantity) {
  return fetch(`${API}/api/cart/${encodeURIComponent(cart_id)}/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: quantity || 1 }),
  }).then((r) => r.json().then((data) => ({ ok: r.ok, data })));
}

function fetchDashboardData() {
  const userId = getSessionUserId();
  if (!userId) return Promise.reject(new Error("not_logged_in"));
  return fetch(
    `${API}/api/dashboard?user_id=${encodeURIComponent(userId)}`,
  ).then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  });
}

function fetchClaims() {
  const userId = getSessionUserId();
  if (!userId) return Promise.resolve([]);
  return fetch(`${API}/api/claims?buyer_id=${encodeURIComponent(userId)}`).then(
    (r) => {
      if (!r.ok) throw new Error();
      return r.json();
    },
  );
}

function fetchSellerClaims() {
  const userId = getSessionUserId();
  if (!userId) return Promise.resolve([]);
  return fetch(
    `${API}/api/claims?seller_id=${encodeURIComponent(userId)}`,
  ).then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  });
}

function markBuyerCompleteAPI(claim_id) {
  return fetch(
    `${API}/api/claims/${encodeURIComponent(claim_id)}/buyer-complete`,
    {
      method: "PATCH",
    },
  ).then((r) => r.json().then((d) => ({ ok: r.ok, data: d })));
}

function markSellerCompleteAPI(claim_id) {
  return fetch(
    `${API}/api/claims/${encodeURIComponent(claim_id)}/seller-complete`,
    {
      method: "PATCH",
    },
  ).then((r) => r.json().then((d) => ({ ok: r.ok, data: d })));
}

function submitRatingAPI(listing_id, rating, review) {
  const rater_id = getSessionUserId();
  return fetch(`${API}/api/ratings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listing_id, rater_id, rating, review }),
  }).then((r) => r.json().then((d) => ({ ok: r.ok, data: d })));
}

function updateRatingAPI(rating_id, rating, review) {
  return fetch(`${API}/api/ratings/${encodeURIComponent(rating_id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating, review }),
  }).then((r) => r.json().then((d) => ({ ok: r.ok, data: d })));
}

function fetchUserListings() {
  const userId = getSessionUserId();
  if (!userId) return Promise.resolve([]);
  return fetch(
    `${API}/api/listings?seller_id=${encodeURIComponent(userId)}`,
  ).then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  });
}

function fetchCategories() {
  return fetch(`${API}/api/categories`).then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  });
}

function addListingAPI(data) {
  const seller_id = getSessionUserId();
  if (!seller_id) return Promise.reject(new Error("not_logged_in"));
  return fetch(`${API}/api/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, seller_id }),
  }).then((r) => r.json().then((d) => ({ ok: r.ok, data: d })));
}

function updateListingAPI(listing_id, data) {
  return fetch(`${API}/api/listings/${encodeURIComponent(listing_id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json().then((d) => ({ ok: r.ok, data: d })));
}

function deleteListingAPI(listing_id) {
  return fetch(`${API}/api/listings/${encodeURIComponent(listing_id)}`, {
    method: "DELETE",
  }).then((r) => r.json().then((d) => ({ ok: r.ok, data: d })));
}

function fetchSellerReviews() {
  const userId = getSessionUserId();
  if (!userId) return Promise.resolve([]);
  return fetch(`${API}/api/ratings/seller/${encodeURIComponent(userId)}`).then(
    (r) => {
      if (!r.ok) throw new Error();
      return r.json();
    },
  );
}

function fetchNotificationsAPI() {
  const userId = getSessionUserId();
  if (!userId) return Promise.resolve([]);
  return fetch(
    `${API}/api/notifications?user_id=${encodeURIComponent(userId)}`,
  ).then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  });
}

function markAllNotificationsReadAPI() {
  const userId = getSessionUserId();
  if (!userId) return Promise.resolve();
  return fetch(
    `${API}/api/notifications/read-all?user_id=${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
    },
  ).then((r) => r.json());
}

function markNotificationReadAPI(notification_id) {
  return fetch(
    `${API}/api/notifications/${encodeURIComponent(notification_id)}/read`,
    {
      method: "PATCH",
    },
  ).then((r) => r.json());
}

function submitReportAPI({ reported_user_id, reported_listing_id, reason }) {
  const reporter_id = getSessionUserId();
  return fetch(`${API}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reporter_id,
      reported_user_id,
      reported_listing_id: reported_listing_id || null,
      reason,
    }),
  }).then((r) => r.json().then((d) => ({ ok: r.ok, data: d })));
}
