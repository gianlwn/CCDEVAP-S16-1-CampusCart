const ADMIN_EMAILS = [
  'mikyla_kirsten_aguirre@dlsu.edu.ph',
  'giancarlo_lawan@dlsu.edu.ph',
  'bernard_florian_llagas@dlsu.edu.ph',
  'sky_parado@dlsu.edu.ph',
  'camille_erika_sarabia@dlsu.edu.ph',
];

function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

function setSession(email) {
  localStorage.setItem('session_email', email);
  localStorage.setItem('session_role', isAdminEmail(email) ? 'Administrator' : 'Student');
}

function getSessionEmail() {
  return localStorage.getItem('session_email');
}

function getSessionRole() {
  return localStorage.getItem('session_role');
}

function clearSession() {
  localStorage.removeItem('session_email');
  localStorage.removeItem('session_role');
}

function getLoginRedirect(email) {
  return isAdminEmail(email)
    ? '../admin-dashboard/adminDashboard.html'
    : '../user-profile-dashboard/dashboard.html';
}
