function applyTheme(isDark) {
  document.body.classList.toggle("darkMode", isDark);
  localStorage.setItem("campuscart-theme", isDark ? "darkMode" : "lightMode");
  _updateThemeBtn();
}

function storeTheme() {
  // Apply the locally cached theme immediately so there's no flash of the
  // wrong theme, then reconcile with the account's saved theme (source of
  // truth) in case it was changed on another device/browser.
  const saved = localStorage.getItem("campuscart-theme");
  applyTheme(saved === "darkMode");

  if (typeof fetchMeAPI !== "function" || !getSessionUserId()) return;
  fetchMeAPI()
    .then((me) => applyTheme(me.theme === "dark"))
    .catch(() => {});
}

function toggleTheme() {
  const isDark = !document.body.classList.contains("darkMode");
  applyTheme(isDark);
  document.dispatchEvent(
    new CustomEvent("themeChanged", { detail: { isDark } }),
  );
  if (typeof updateThemeAPI === "function") {
    updateThemeAPI(isDark ? "dark" : "light");
  }
}

function _updateThemeBtn() {
  const isDark = document.body.classList.contains("darkMode");
  const icon = isDark ? ICONS.sun : ICONS.moon;
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.innerHTML = icon;

  const floatBtn = document.getElementById("theme-toggle-float");
  if (floatBtn) floatBtn.innerHTML = icon;
}
