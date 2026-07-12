function syncSummaryName(val) {
  document.getElementById("summary-name").textContent =
    val.trim() || "Your Name";
}

const SCHOOL_PRESETS = [
  "De La Salle University",
  "University of Santo Tomas",
  "Ateneo de Manila University",
  "University of the Philippines",
];

function toggleOtherSchool(value) {
  document.getElementById("prof-school-other").style.display =
    value === "Other" ? "block" : "none";
}

const BIO_MAX = 300;

function updateBioCounter() {
  const n = document.getElementById("prof-bio").value.length;
  const counter = document.getElementById("bio-counter");
  counter.textContent = `${n} / ${BIO_MAX}`;
  counter.className =
    "char-counter" +
    (n >= BIO_MAX ? " at-limit" : n >= BIO_MAX * 0.9 ? " near-limit" : "");
}

let _pendingProfilePicture = null;
let _pendingRemovePicture = false;

const DEFAULT_AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>`;

function setRemoveBtnVisible(visible) {
  const btn = document.getElementById("btn-remove-img");
  if (btn) btn.style.display = visible ? "" : "none";
}

function renderDefaultAvatar() {
  document.getElementById("profile-avatar-el").innerHTML = DEFAULT_AVATAR_SVG;
}

function renderAvatar(profilePicture) {
  const hasCustom = profilePicture && profilePicture.startsWith("/uploads/");
  if (hasCustom) {
    document.getElementById("profile-avatar-el").innerHTML =
      `<img src="${API}${profilePicture}" alt="Profile photo">`;
  } else {
    renderDefaultAvatar();
  }
  setRemoveBtnVisible(hasCustom);
}

function previewProfilePicture(dataUrl) {
  _pendingProfilePicture = dataUrl;
  _pendingRemovePicture = false;
  document.getElementById("profile-avatar-el").innerHTML =
    `<img src="${dataUrl}" alt="Profile photo">`;
  setRemoveBtnVisible(true);
  showToast("Photo Selected", "Press Save Changes to apply your new photo.", "info");
}

function handleRemovePicture() {
  _pendingRemovePicture = true;
  _pendingProfilePicture = null;
  renderDefaultAvatar();
  setRemoveBtnVisible(false);
  showToast("Photo Removed", "Press Save Changes to apply.", "info");
}

function handleSaveProfile() {
  const fullName = document.getElementById("prof-name").value.trim();
  const pw = document.getElementById("prof-pw").value;
  const pw2 = document.getElementById("prof-pw2").value;

  if (!fullName) {
    showToast("Missing Field", "Full name cannot be empty.", "warning");
    return;
  }
  if (pw && !pw2) {
    showToast("Confirm Password", "Please confirm your new password.", "warning");
    return;
  }
  if (!pw && pw2) {
    showToast("New Password", "Please enter a new password to confirm.", "warning");
    return;
  }
  if (pw && pw !== pw2) {
    showToast("Password Mismatch", "Passwords do not match.", "error");
    return;
  }

  const schoolSelect = document.getElementById("prof-school").value;
  const schoolOther = document.getElementById("prof-school-other").value.trim();
  if (schoolSelect === "Other" && !schoolOther) {
    showToast("Missing Field", "Please enter your school name.", "warning");
    return;
  }
  const school = schoolSelect === "Other" ? schoolOther : schoolSelect;

  const parts = fullName.split(" ");
  const last_name = parts.length > 1 ? parts.pop() : "";
  const first_name = parts.join(" ");

  const data = {
    first_name,
    last_name,
    contact_number: document.getElementById("prof-phone").value.trim(),
    bio: document.getElementById("prof-bio").value.trim(),
    school,
    course_code: document.getElementById("prof-course").value.trim(),
  };
  if (pw) data.password = pw;
  if (_pendingProfilePicture) data.profile_picture = _pendingProfilePicture;
  else if (_pendingRemovePicture) data.remove_picture = true;

  updateProfileAPI(data)
    .then(({ ok, data: resData }) => {
      if (!ok) {
        showToast("Error", "Could not save profile.", "error");
        return;
      }
      document.getElementById("prof-pw").value = "";
      document.getElementById("prof-pw2").value = "";
      document.getElementById("summary-school").textContent =
        school || "CampusCart Member";
      if (_pendingProfilePicture || _pendingRemovePicture) {
        renderAvatar(resData.profile_picture);
        _pendingProfilePicture = null;
        _pendingRemovePicture = false;
      }
      showToast("Profile Saved", "Your profile has been updated.", "success");
    })
    .catch(() => showToast("Error", "Could not save profile.", "error"));
}

function handleDeleteAccount() {
  showConfirm(
    "Delete Account?",
    "This will permanently delete your account and all associated data. This action cannot be undone.",
    async () => {
      try {
        const { ok } = await deleteAccountAPI();
        if (!ok) {
          showToast(
            "Error",
            "Could not delete account. Please try again.",
            "error",
          );
          return;
        }
        localStorage.removeItem("session_email");
        localStorage.removeItem("session_role");
        localStorage.removeItem("session_user_id");
        showToast(
          "Account Deleted",
          "Your account has been removed.",
          "error",
          0,
        );
        setTimeout(
          () => (window.location.href = "../login-path/login.html"),
          1200,
        );
      } catch {
        showToast("Error", "Could not reach the server.", "error");
      }
    },
  );
}

const EYE_OPEN = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  btn.innerHTML = show ? EYE_OFF : EYE_OPEN;
}

function handleHelp() {
  showToast(
    "Help",
    "For support, contact campuscart@support.edu.ph",
    "info",
    6000,
  );
}

function renderMyReports(reports) {
  const el = document.getElementById("my-reports-list");
  if (!el) return;
  if (!reports.length) {
    el.innerHTML =
      '<p style="color:var(--text-muted);font-size:13px;">You haven\'t filed any reports.</p>';
    return;
  }
  el.innerHTML = reports
    .map((r) => {
      const statusClass = r.status === "Resolved" ? "active" : "pending_review";
      const outcome = r.actionTaken ? ` — ${r.actionTaken}` : "";
      return `
      <div class="listing-row">
        <div class="item-info" style="flex:1;min-width:0;">
          <p class="item-name">${r.subject}</p>
          <p class="item-meta">${r.reportType} · Reason: ${r.reason} · ${r.date}</p>
          ${r.status === "Resolved" ? `<p class="item-meta">${outcome.replace(/^ — /, "")}</p>` : ""}
        </div>
        <span class="badge-status ${statusClass}">${r.status}</span>
      </div>
    `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  fetchMyReports()
    .then((reports) => renderMyReports(reports))
    .catch(() => {
      const el = document.getElementById("my-reports-list");
      if (el)
        el.innerHTML =
          '<p style="color:var(--text-muted);font-size:13px;">Could not load reports.</p>';
    });

  fetchMyProfile()
    .then((data) => {
      const fullName = `${data.first_name} ${data.last_name}`.trim();

      document.getElementById("prof-name").value = fullName;
      document.getElementById("summary-name").textContent =
        fullName || "Your Name";
      document.getElementById("prof-phone").value = data.contact_number || "";
      document.getElementById("prof-bio").value = data.bio || "";
      updateBioCounter();
      document.getElementById("prof-email").value = data.email || "";
      const school = data.school || "";
      document.getElementById("summary-school").textContent =
        school || "CampusCart Member";
      if (school && !SCHOOL_PRESETS.includes(school)) {
        document.getElementById("prof-school").value = "Other";
        document.getElementById("prof-school-other").value = school;
        toggleOtherSchool("Other");
      } else {
        document.getElementById("prof-school").value = school;
      }
      document.getElementById("prof-course").value = data.course_code || "";

      document.getElementById("summary-rating-val").textContent =
        data.rating != null
          ? `${Number(data.rating).toFixed(1)} / 5.0`
          : "No ratings yet";
      document.getElementById("stat-items-sold").textContent =
        data.itemsSold ?? 0;
      document.getElementById("stat-active-listings").textContent =
        data.activeListings ?? 0;
      document.getElementById("stat-member-since").textContent =
        data.memberSince || "—";

      renderAvatar(data.profile_picture);
    })
    .catch(() => showToast("Error", "Failed to load profile.", "error"));

  document.getElementById("profile-img-input").addEventListener("change", function (e) {
    const file = e.target.files[0];
    this.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Invalid File", "Please select an image file.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => previewProfilePicture(ev.target.result);
    reader.readAsDataURL(file);
  });
});
