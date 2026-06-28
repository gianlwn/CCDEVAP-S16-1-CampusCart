function setSession(email, role, userId) {
  localStorage.setItem("session_email", email);
  localStorage.setItem("session_role", role);
  if (userId) localStorage.setItem("session_user_id", userId);
}
function getSessionEmail() {
  return localStorage.getItem("session_email");
}
function getSessionRole() {
  return localStorage.getItem("session_role");
}
function getSessionUserId() {
  return localStorage.getItem("session_user_id");
}
function clearSession() {
  localStorage.removeItem("session_email");
  localStorage.removeItem("session_role");
  localStorage.removeItem("session_user_id");
}
function getLoginRedirect(role) {
  return role === "admin"
    ? "../admin-dashboard/adminDashboard.html"
    : "../user-profile-dashboard/dashboard.html";
}
