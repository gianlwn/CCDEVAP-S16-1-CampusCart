function setSession(email, role) {
  localStorage.setItem("session_email", email);
  localStorage.setItem("session_role", role);
}

function getSessionEmail() {
  return localStorage.getItem("session_email");
}

function getSessionRole() {
  return localStorage.getItem("session_role");
}

function clearSession() {
  localStorage.removeItem("session_email");
  localStorage.removeItem("session_role");
}

function getLoginRedirect(role) {
  return role === "admin"
    ? "../admin-dashboard/adminDashboard.html"
    : "../user-profile-dashboard/dashboard.html";
}
