let codeSent    = false;  
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

function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pw    = document.getElementById('login-pw').value;

  if (!email || !pw) {
    showToast('Missing Fields', 'Please enter your email and password.', 'warning');
    return;
  }

  if (!email.toLowerCase().endsWith('.edu.ph')) {
    showToast('Invalid Email', 'Only valid .edu.ph addresses are accepted.', 'error');
    return;
  }

  showToast('Logging in…', 'Redirecting to your workspace dashboard.', 'info', 1500);

  setTimeout(() => {
    localStorage.setItem('session_email', email);

    
    const lowerEmail = email.toLowerCase();
    if (
      lowerEmail === 'mikyla_kirsten_aguirre@dlsu.edu.ph' ||
      lowerEmail === 'giancarlo_lawan@dlsu.edu.ph'        ||
      lowerEmail === 'bernard_florian_llagas@dlsu.edu.ph' ||
      lowerEmail === 'sky_parado@dlsu.edu.ph'             ||
      lowerEmail === 'camille_erika_sarabia@dlsu.edu.ph'
    ) {
      localStorage.setItem('session_role', 'Administrator');
      window.location.href = '../admin-dashboard/adminDashboard.html';
    } else {
      localStorage.setItem('session_role', 'Student');
      window.location.href = '../user-profile-dashboard/dashboard.html';
    }
  }, 1200);
}

function handleSendCode() {
  const email = document.getElementById('vfy-email').value.trim();

  if (!email) {
    showToast('Missing Email', 'Please enter your school email.', 'warning');
    return;
  }
  if (!email.toLowerCase().endsWith('.edu.ph')) {
    showToast('Invalid Email', 'Only valid .edu.ph addresses are accepted.', 'error');
    return;
  }

  const btn    = document.getElementById('btn-send');
  btn.disabled = true;
  btn.textContent = 'Code Sent!';
  codeSent = true;

  showToast('Code Sent', 'Check your inbox! The code is: 123456', 'success', 5000);

  const codeInput = document.getElementById('vfy-code');
  if (codeInput) codeInput.focus();

  
  setTimeout(() => {
    btn.disabled    = false;
    btn.textContent = 'RESEND CODE';
  }, 30000);
}

function handleConfirm(event) {
  if (event) event.preventDefault();
  const code  = document.getElementById('vfy-code').value.trim();
  const email = document.getElementById('vfy-email').value.trim();

  if (!codeSent) {
    showToast('Send Code First', 'Please send a verification code before confirming.', 'warning');
    return;
  }
  if (code !== '123456') {
    showToast('Incorrect Code', 'The verification token you entered is incorrect.', 'error');
    return;
  }

  localStorage.setItem('verified-signup-email', email);
  showToast('Verified!', 'Email confirmed. Redirecting to registration…', 'success', 1500);
  setTimeout(() => { window.location.href = '../login-path/register.html'; }, 1200);
}

function handleRegister(event) {
  if (event) event.preventDefault();

  const name   = document.getElementById('reg-name').value.trim();
  const email  = document.getElementById('reg-email').value.trim();
  const pw     = document.getElementById('reg-pw').value;
  const pw2    = document.getElementById('reg-pw2').value;
  const school = document.getElementById('reg-school').value;
  const course = document.getElementById('reg-course').value.trim();
  const phone  = document.getElementById('reg-phone').value.trim();

  if (!name || !email || !pw || !school || !course || !phone) {
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

  
  const courseRegex = /^[a-zA-Z-]+$/;
  if (!courseRegex.test(course)) {
    showToast('Invalid Course', 'Course code can only contain letters or hyphens (e.g., BSIT, BS-CS).', 'error');
    return;
  }

  
  const phoneCleaned = phone.replace(/\s+/g, '');
  const phoneRegex   = /^09\d{9}$/;
  if (phoneCleaned.length !== 11 || !phoneRegex.test(phoneCleaned)) {
    showToast('Invalid Phone', 'Phone number must be exactly 11 digits and start with 09 (e.g., 09123456789).', 'error');
    return;
  }

  
  localStorage.setItem('cached_profile_display_name', name);

  showToast('Account Created!', 'Your profile has been created successfully! Redirecting to login...', 'success', 1500);
  setTimeout(() => { window.location.href = '../login-path/login.html'; }, 1200);
}

function handleSendRecoveryCode() {
  const email = document.getElementById('rec-email').value.trim();
  if (!email || !email.toLowerCase().endsWith('.edu.ph')) {
    showToast('Invalid Email', 'Please enter a valid .edu.ph address.', 'error');
    return;
  }
  recCodeSent = true;
  showToast('Code Sent', 'Recovery track initialized. Evaluation code token is: 123456', 'success', 5000);
}

function handleConfirmRecoveryCode() {
  const code = document.getElementById('rec-code').value.trim();

  if (!recCodeSent) {
    showToast('Send Code First', 'Please request a recovery code first.', 'warning');
    return;
  }
  if (code !== '123456') {
    showToast('Invalid Code', 'The verification token is incorrect.', 'error');
    return;
  }

  
  const emailField = document.getElementById('rec-email');
  if (emailField) {
    emailField.setAttribute('readonly', 'true');
    emailField.style.opacity = '0.7';
    emailField.style.cursor  = 'not-allowed';
  }

  document.getElementById('recovery-verify-zone').style.display   = 'none';
  document.getElementById('recovery-password-zone').style.display = 'block';
  showToast('Identity Verified', 'Please set your new account security password credentials.', 'success');
}

function handlePasswordResetSubmit(event) {
  if (event) event.preventDefault();
  const pw  = document.getElementById('rec-pw').value;
  const pw2 = document.getElementById('rec-pw2').value;

  if (!pw || pw.length < 6) {
    showToast('Weak Password', 'Password must be at least 6 characters long.', 'warning');
    return;
  }
  if (pw !== pw2) {
    showToast('Mismatch', 'Passwords do not match.', 'error');
    return;
  }

  showToast('Password Updated', 'Your account credentials have been modified. Redirecting to login...', 'success', 1500);
  setTimeout(() => { window.location.href = '../login-path/login.html'; }, 1200);
}
