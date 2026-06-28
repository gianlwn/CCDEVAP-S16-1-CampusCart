function fetchListings() {
  return fetch("../../data/mock-listings.json").then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  });
}

function fetchClaimedItems() {
  return fetch("../../data/mock-claimed.json").then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  });
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

function fetchUsers() {
  return fetch("../../data/mock-users.json").then((r) => {
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
