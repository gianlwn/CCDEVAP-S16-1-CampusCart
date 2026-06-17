function syncSummaryName(val) {
  document.getElementById('summary-name').textContent = val.trim() || 'Your Name';
}

function checkVerified() {
  const email = document.getElementById('prof-email').value;
  const badge = document.getElementById('verified-badge');
  if (email && email.includes('.edu.ph')) {
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }
}

function handleEditImage() {
  showToast('Edit Photo', 'Photo upload coming soon!', 'info');
}

function handleSaveProfile() {
  const name = document.getElementById('prof-name').value.trim();
  const pw = document.getElementById('prof-pw').value;
  const pw2 = document.getElementById('prof-pw2').value;

  if (!name) {
    showToast('Missing Field', 'Full name cannot be empty.', 'warning');
    return;
  }
  if (pw && pw !== pw2) {
    showToast('Password Mismatch', 'Passwords do not match.', 'error');
    return;
  }
  showToast('Profile Saved', 'Your profile has been updated.', 'success');
}

function handleDeleteAccount() {
  showConfirm(
    'Delete Account?',
    'This will permanently delete your account and all associated data. This action cannot be undone.',
    () => {
      showToast('Account Deleted', 'Your account has been removed.', 'error', 0);
      setTimeout(() => window.location.href = '../login-path/login.html', 1200);
    }
  );
}

function handleHelp() {
  showToast('Help', 'For support, contact campuscart@support.edu.ph', 'info', 6000);
}

document.addEventListener('DOMContentLoaded', checkVerified);
