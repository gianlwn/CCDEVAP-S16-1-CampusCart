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

const EYE_OPEN = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.innerHTML = show ? EYE_OFF : EYE_OPEN;
}

function handleHelp() {
  showToast('Help', 'For support, contact campuscart@support.edu.ph', 'info', 6000);
}

document.addEventListener('DOMContentLoaded', checkVerified);
