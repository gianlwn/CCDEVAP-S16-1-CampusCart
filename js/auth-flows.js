let simulatedToken = null;
let countdownIntervalId = null;

document.addEventListener("DOMContentLoaded", () => {
  if (typeof storeTheme === "function") {
    storeTheme();
  }
  
  if (document.getElementById("profileForm")) {
    initializeRegistrationPage();
  }
  if (document.getElementById("dashboardProfileForm")) {
    initializeDashboardProfileValues();
  }
});

/*LOGIN ACTION*/

function executeMockLogin(event) {
  event.preventDefault();
  
  const emailInput = document.getElementById("email").value.trim().toLowerCase();
  const errorAlert = document.getElementById("error-alert");
  const btn = document.getElementById("submitBtn");

  if (errorAlert) errorAlert.style.display = "none";

  if (!emailInput.endsWith(".edu.ph")) {
    if (errorAlert) {
      errorAlert.innerHTML = "Access Denied: Only valid institutional .edu.ph addresses are allowed.";
      errorAlert.style.display = "block";
    }
    return;
  }

  btn.disabled = true;
  btn.innerHTML = "Please wait...";
  
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = "LOG IN";
    
    localStorage.setItem("session_email", emailInput);
    localStorage.setItem("session_role", "Student");
    
    window.location.href = "../homepage.html"; 
  }, 1200);
}

/*VERIFICATION CODE TIMERS & LOGIC*/

function simulateTokenDispatch() {
  const emailField = document.getElementById("email");
  const errorAlert = document.getElementById("error-alert");
  const successAlert = document.getElementById("success-alert");
  const sendBtn = document.getElementById("sendCodeBtn");
  const timerDisplay = document.getElementById("timerDisplay");

  if (errorAlert) errorAlert.style.display = "none";
  if (successAlert) successAlert.style.display = "none";

  if (!emailField.checkValidity()) {
    if (errorAlert) {
      errorAlert.innerHTML = "Invalid institutional address layout formatting profile.";
      errorAlert.style.display = "block";
    }
    return;
  }

  simulatedToken = "123456"; 
  if (successAlert) {
    successAlert.innerHTML = "Verification code sent! code is: 123456";
    successAlert.style.display = "block";
  }

  sendBtn.disabled = true;
  sendBtn.style.backgroundColor = "#888888";
  sendBtn.style.cursor = "not-allowed";

  let traceTimeLeft = 120;
  if (timerDisplay) timerDisplay.innerHTML = `Token lifecycle expires in: ${traceTimeLeft}s`;
  
  clearInterval(countdownIntervalId);
  countdownIntervalId = setInterval(() => {
    traceTimeLeft--;
    if (traceTimeLeft <= 0) {
      clearInterval(countdownIntervalId);
      simulatedToken = null;
      sendBtn.disabled = false;
      sendBtn.style.backgroundColor = "var(--accent)";
      sendBtn.style.cursor = "pointer";
      if (timerDisplay) timerDisplay.innerHTML = "Token expired. Please request a new transmission code.";
    } else {
      if (timerDisplay) timerDisplay.innerHTML = `Token lifecycle expires in: ${traceTimeLeft}s`;
    }
  }, 1000);
}

function validateSecurityToken(event) {
  event.preventDefault();
  const codeInput = document.getElementById("code").value.trim();
  const emailInput = document.getElementById("email").value.trim();
  const errorAlert = document.getElementById("error-alert");

  if (errorAlert) errorAlert.style.display = "none";

  if (codeInput !== "123456") {
    if (errorAlert) {
      errorAlert.innerHTML = "Incorrect verification key.";
      errorAlert.style.display = "block";
    }
    return;
  }

  clearInterval(countdownIntervalId);
  localStorage.setItem("verified_registration_email", emailInput);
  window.location.href = "register.html";
}

/*PROFILE SETUP*/

function initializeRegistrationPage() {
  const cachedEmail = localStorage.getItem("verified_registration_email") || "username@university.edu.ph";
  const targetNode = document.getElementById("emailDisplay");
  if (targetNode) {
    targetNode.innerHTML = cachedEmail;
  }
}

function commitUserProfile(event) {
  event.preventDefault();
  
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const errorAlert = document.getElementById("error-alert");
  const successAlert = document.getElementById("success-alert");

  if (errorAlert) errorAlert.style.display = "none";
  if (successAlert) successAlert.style.display = "none";

  if (password !== confirmPassword) {
    if (errorAlert) {
      errorAlert.innerHTML = "Error: Passwords do not match. Please verify your entries.";
      errorAlert.style.display = "block";
    }
    return;
  }

  const inputName = document.getElementById("fullName").value;
  localStorage.setItem("cached_profile_display_name", inputName);

  if (successAlert) {
    successAlert.innerHTML = "Success: Account profile registration initialized successfully!";
    successAlert.style.display = "block";
  }

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
}

function triggerMockFileSelection(event) {
  event.preventDefault();
  alert("Image updates are not yet configured.");
}

/*PASSWORD RECOVERY*/

function dispatchRecoveryToken() {
  const emailField = document.getElementById("resetEmail");
  const errorAlert = document.getElementById("error-alert");
  const successAlert = document.getElementById("success-alert");
  const sendBtn = document.getElementById("sendCodeBtn");
  const timerDisplay = document.getElementById("timerDisplay");

  if (errorAlert) errorAlert.style.display = "none";
  if (successAlert) successAlert.style.display = "none";

  if (!emailField.checkValidity() || emailField.value.trim() === "") {
    if (errorAlert) {
      errorAlert.innerHTML = "Please provide a valid official university email ending in .edu.ph";
      errorAlert.style.display = "block";
    }
    return;
  }

  if (successAlert) {
    successAlert.innerHTML = "Recovery code sent! code is: 123456";
    successAlert.style.display = "block";
  }

  sendBtn.disabled = true;
  sendBtn.style.backgroundColor = "#888888";
  sendBtn.style.cursor = "not-allowed";

  let traceTimeLeft = 120;
  if (timerDisplay) {
    timerDisplay.innerHTML = `Token lifecycle expires in: ${traceTimeLeft}s`;
    timerDisplay.style.display = "flex";
  }

  clearInterval(countdownIntervalId);
  countdownIntervalId = setInterval(() => {
    traceTimeLeft--;
    if (traceTimeLeft <= 0) {
      clearInterval(countdownIntervalId);
      sendBtn.disabled = false;
      sendBtn.style.backgroundColor = "";
      sendBtn.style.cursor = "pointer";
      if (timerDisplay) timerDisplay.innerHTML = "Token expired. Please request a new transmission code.";
    } else {
      if (timerDisplay) timerDisplay.innerHTML = `Token lifecycle expires in: ${traceTimeLeft}s`;
    }
  }, 1000);
}

function verifyRecoveryToken() {
  const codeInput = document.getElementById("recoveryCode").value.trim();
  const errorAlert = document.getElementById("error-alert");
  const successAlert = document.getElementById("success-alert");

  if (errorAlert) errorAlert.style.display = "none";

  if (codeInput !== "123456") {
    if (errorAlert) {
      errorAlert.innerHTML = "Incorrect configuration authentication token sequence key.";
      errorAlert.style.display = "block";
    }
    return;
  }

  clearInterval(countdownIntervalId);
  if (successAlert) {
    successAlert.innerHTML = "Identity confirmed successfully! Please type your new password below.";
    successAlert.style.display = "block";
  }

  document.getElementById("verification-stage").style.display = "none";
  document.getElementById("password-stage").style.display = "block";
}

function executePasswordReset(event) {
  event.preventDefault();
  
  const pass = document.getElementById("newPassword").value;
  const confirmPass = document.getElementById("confirmNewPassword").value;
  const errorAlert = document.getElementById("error-alert");
  const successAlert = document.getElementById("success-alert");

  if (errorAlert) errorAlert.style.display = "none";
  if (successAlert) successAlert.style.display = "none";

  if (pass !== confirmPass) {
    if (errorAlert) {
      errorAlert.innerHTML = "Error: Passwords do not match. Please verify your entries.";
      errorAlert.style.display = "block";
    }
    return;
  }

  if (successAlert) {
    successAlert.innerHTML = "Success: Your user account password has been updated.";
    successAlert.style.display = "block";
  }

  document.getElementById("resetBtn").disabled = true;

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
}
