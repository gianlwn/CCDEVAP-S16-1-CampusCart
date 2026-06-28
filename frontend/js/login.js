const API = 'http://localhost:3000';

let codeSent = false;
let recCodeSent = false;

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('campuscart-theme');
  if (savedTheme === 'darkMode') {
    document.body.classList.add('darkMode');
  }

  const regEmailInput = document.getElementById('reg-email');
  if (regEmailInput) {
    const verifiedEmail = localStorage.getItem('verified-signup-email');
    if (verifiedEmail) {
      regEmailInput.value = verifiedEmail;
    }
  }
});

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pw = document.getElementById('login-pw').value;

  if (!email || !pw) {
    showToast('Missing Fields', 'Please enter your email and password.', 'warning');
    return;
  }
  if (!email.toLowerCase().endsWith('.edu.ph')) {
    showToast('Invalid Email', 'Only valid .edu.ph addresses are accepted.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pw }),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.error === 'invalid_credentials') {
        showToast('Login Failed', 'Incorrect email or password.', 'error');
      } else if (data.error === 'account_banned') {
        showToast('Account Banned', 'Your account has been banned. Contact support.', 'error');
      } else if (data.error === 'account_suspended') {
        showToast('Account Suspended', 'Your account is currently suspended.', 'error');
      } else {
        showToast('Error', 'Something went wrong. Please try again.', 'error');
      }
      return;
    }

    showToast('Logging in…', 'Redirecting to your dashboard.', 'info', 1500);
    setSession(data.email, data.role);
    setTimeout(() => { window.location.href = getLoginRedirect(data.role); }, 1200);
  } catch {
    showToast('Connection Error', 'Could not reach the server. Make sure it is running.', 'error');
  }
}

async function handleSendCode() {
  const email = document.getElementById('vfy-email').value.trim();

  if (!email) {
    showToast('Missing Email', 'Please enter your school email.', 'warning');
    return;
  }
  if (!email.toLowerCase().endsWith('.edu.ph')) {
    showToast('Invalid Email', 'Only valid .edu.ph addresses are accepted.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.error === 'email_taken') {
        showToast('Email Taken', 'An account with this email already exists.', 'error');
      } else {
        showToast('Error', 'Something went wrong. Please try again.', 'error');
      }
      return;
    }

    const btn = document.getElementById('btn-send');
    btn.disabled = true;
    btn.textContent = 'Code Sent!';
    codeSent = true;

    showToast('Code Sent', 'Check your inbox for the verification code.', 'success', 5000);
    document.getElementById('vfy-code')?.focus();

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'RESEND CODE';
    }, 30000);
  } catch {
    showToast('Connection Error', 'Could not reach the server. Make sure it is running.', 'error');
  }
}

async function handleConfirm(event) {
  if (event) event.preventDefault();
  const code = document.getElementById('vfy-code').value.trim();
  const email = document.getElementById('vfy-email').value.trim();

  if (!codeSent) {
    showToast('Send Code First', 'Please send a verification code before confirming.', 'warning');
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.error === 'invalid_code') {
        showToast('Incorrect Code', 'The verification code you entered is incorrect.', 'error');
      } else if (data.error === 'code_expired') {
        showToast('Code Expired', 'The code has expired. Please request a new one.', 'error');
      } else {
        showToast('Error', 'Something went wrong. Please try again.', 'error');
      }
      return;
    }

    localStorage.setItem('verified-signup-email', email);
    showToast('Verified!', 'Email confirmed. Redirecting to registration…', 'success', 1500);
    setTimeout(() => { window.location.href = '../login-path/register.html'; }, 1200);
  } catch {
    showToast('Connection Error', 'Could not reach the server. Make sure it is running.', 'error');
  }
}

async function handleRegister(event) {
  if (event) event.preventDefault();

  const name   = document.getElementById('reg-name').value.trim();
  const email  = document.getElementById('reg-email').value.trim();
  const pw     = document.getElementById('reg-pw').value;
  const pw2    = document.getElementById('reg-pw2').value;
  const school = document.getElementById('reg-school').value;
  const course = document.getElementById('reg-course').value.trim();
  const phone  = document.getElementById('reg-phone').value.trim();

  if (!name || !email || !pw || !school || !phone) {
    showToast('Missing Fields', 'Please fill in all required fields.', 'warning');
    return;
  }
  if (pw.length < 6) {
    showToast('Weak Password', 'Password must be at least 6 characters long.', 'warning');
    return;
  }
  if (pw !== pw2) {
    showToast('Password Mismatch', 'Passwords do not match.', 'error');
    return;
  }
  if (!/^[a-zA-Z-]+$/.test(course)) {
    showToast('Invalid Course', 'Course code can only contain letters or hyphens (e.g., BSIT, BS-CS).', 'error');
    return;
  }
  const phoneCleaned = phone.replace(/\s+/g, '');
  if (!/^09\d{9}$/.test(phoneCleaned)) {
    showToast('Invalid Phone', 'Phone number must be 11 digits starting with 09.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pw, school, course_code: course, phone: phoneCleaned }),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.error === 'email_taken') {
        showToast('Email Taken', 'An account with this email already exists.', 'error');
      } else {
        showToast('Error', 'Something went wrong. Please try again.', 'error');
      }
      return;
    }

    localStorage.removeItem('verified-signup-email');
    showToast('Account Created!', 'Your account has been created. Redirecting to login…', 'success', 1500);
    setTimeout(() => { window.location.href = '../login-path/login.html'; }, 1200);
  } catch {
    showToast('Connection Error', 'Could not reach the server. Make sure it is running.', 'error');
  }
}

async function handleSendRecoveryCode() {
  const email = document.getElementById('rec-email').value.trim();
  if (!email || !email.toLowerCase().endsWith('.edu.ph')) {
    showToast('Invalid Email', 'Please enter a valid .edu.ph address.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/send-recovery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.error === 'not_found') {
        showToast('Not Found', 'No account found with that email address.', 'error');
      } else {
        showToast('Error', 'Something went wrong. Please try again.', 'error');
      }
      return;
    }

    recCodeSent = true;
    showToast('Code Sent', 'Check your inbox for the recovery code.', 'success', 5000);
  } catch {
    showToast('Connection Error', 'Could not reach the server. Make sure it is running.', 'error');
  }
}

async function handleConfirmRecoveryCode() {
  const email = document.getElementById('rec-email').value.trim();
  const code  = document.getElementById('rec-code').value.trim();

  if (!recCodeSent) {
    showToast('Send Code First', 'Please request a recovery code first.', 'warning');
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/verify-recovery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.error === 'invalid_code') {
        showToast('Invalid Code', 'The verification code is incorrect.', 'error');
      } else if (data.error === 'code_expired') {
        showToast('Code Expired', 'The code has expired. Please request a new one.', 'error');
      } else {
        showToast('Error', 'Something went wrong. Please try again.', 'error');
      }
      return;
    }

    const emailField = document.getElementById('rec-email');
    if (emailField) {
      emailField.setAttribute('readonly', 'true');
      emailField.style.opacity = '0.7';
      emailField.style.cursor = 'not-allowed';
    }

    document.getElementById('recovery-verify-zone').style.display = 'none';
    document.getElementById('recovery-password-zone').style.display = 'block';
    showToast('Identity Verified', 'Please set your new password.', 'success');
  } catch {
    showToast('Connection Error', 'Could not reach the server. Make sure it is running.', 'error');
  }
}

async function handlePasswordResetSubmit(event) {
  if (event) event.preventDefault();
  const email = document.getElementById('rec-email').value.trim();
  const pw    = document.getElementById('rec-pw').value;
  const pw2   = document.getElementById('rec-pw2').value;

  if (!pw || pw.length < 6) {
    showToast('Weak Password', 'Password must be at least 6 characters long.', 'warning');
    return;
  }
  if (pw !== pw2) {
    showToast('Mismatch', 'Passwords do not match.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pw }),
    });

    if (!res.ok) {
      showToast('Error', 'Password reset failed. Please start over.', 'error');
      return;
    }

    showToast('Password Updated', 'Your password has been changed. Redirecting to login…', 'success', 1500);
    setTimeout(() => { window.location.href = '../login-path/login.html'; }, 1200);
  } catch {
    showToast('Connection Error', 'Could not reach the server. Make sure it is running.', 'error');
  }
}

function togglePw(inputId, btn) {
  const inp = document.getElementById(inputId);
  const icon = btn.querySelector('svg');
  if (!inp) return;
  const isHidden = inp.type === 'password';
  inp.type = isHidden ? 'text' : 'password';
  icon.innerHTML = isHidden
    ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}
