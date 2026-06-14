document.addEventListener("DOMContentLoaded", () => {
  if (typeof storeTheme === "function") {
    storeTheme();
  }
  initializeDashboardProfileValues();
});

function initializeDashboardProfileValues() {
  const activeUser = localStorage.getItem("session_email") || "username@university.edu.ph";
  const emailField = document.getElementById("profileEmail");
  if (emailField) {
    emailField.value = activeUser;
  }
}

/*VIEW / EDIT MODE*/

function activateProfileEditMode() {
  document.getElementById("toggleEditModeBtn").classList.add("hidden-action-node");
  document.getElementById("saveProfileEditsBtn").classList.remove("hidden-action-node");
  document.getElementById("cancelEditModeBtn").classList.remove("hidden-action-node");
  
  const avatarLink = document.getElementById("avatarLinkBtn");
  if (avatarLink) avatarLink.classList.remove("hidden-action-node");

  document.getElementById("profileFullName").removeAttribute("readonly");
  document.getElementById("profilePassword").removeAttribute("readonly");
  document.getElementById("profileCourse").removeAttribute("readonly");
  document.getElementById("profilePhone").removeAttribute("readonly");
  document.getElementById("profileSchool").removeAttribute("disabled");
}

function discardProfileEditChanges() {
  document.getElementById("toggleEditModeBtn").classList.remove("hidden-action-node");
  document.getElementById("saveProfileEditsBtn").classList.add("hidden-action-node");
  document.getElementById("cancelEditModeBtn").classList.add("hidden-action-node");
  
  const avatarLink = document.getElementById("avatarLinkBtn");
  if (avatarLink) avatarLink.classList.add("hidden-action-node");

  document.getElementById("profileFullName").setAttribute("readonly", true);
  document.getElementById("profilePassword").setAttribute("readonly", true);
  document.getElementById("profileCourse").setAttribute("readonly", true);
  document.getElementById("profilePhone").setAttribute("readonly", true);
  document.getElementById("profileSchool").setAttribute("disabled", true);
}

function saveProfileEdits(event) {
  event.preventDefault();
  const inputName = document.getElementById("profileFullName").value;
  localStorage.setItem("cached_profile_display_name", inputName);
  alert("Success: Changes to your user profile portfolio saved locally!");
  discardProfileEditChanges();
}

function triggerMockFileSelection(event) {
  event.preventDefault();
  alert("File uploads are not yet configured.");
}

/*Delete Account & Help Center*/

function triggerAccountDeletionSequence() {
  const accountConfirm = confirm("CRITICAL WARNING:\n\nAre you absolutely certain you desire to permanently delete your CampusCart account?\n\nThis action is irreversible.");
  if (accountConfirm) {
    localStorage.clear();
    window.location.href = "../login-path/login.html"; 
  }
}

function routeToHelpCenterHub() {
  alert("Redirecting to the CampusCart Student Help Center support desk hub...");
}

/*Sign Out & Header Icons*/

document.body.addEventListener("click", (event) => {
  if (event.target && event.target.textContent.trim() === "Sign Out") {
    event.preventDefault();
    const confirmLogOut = confirm("Sign Out confirmation:\n\nAre you sure you want to log out of CampusCart?");
    if (confirmLogOut) {
      localStorage.clear();
      window.location.href = "../login-path/login.html";
    }
    return;
  }

  const targetElement = event.target;
  if (targetElement && targetElement.tagName === "I") {
    const classList = targetElement.className;
    if (classList.includes("fa-shopping-cart")) {
      event.preventDefault();
      window.location.href = "../cart.html";
    } else if (classList.includes("fa-house")) {
      event.preventDefault();
      window.location.href = "../homepage.html";
    } else if (classList.includes("fa-circle-user")) {
      event.preventDefault();
      window.location.href = "./userprofile.html";
    }
  }
});
