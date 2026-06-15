function storeTheme() {
  const saved = localStorage.getItem('campuscart-theme');
  if (saved === 'darkMode') {
    document.body.classList.add('darkMode');
  }
  _updateThemeBtn();
}

function toggleTheme() {
  document.body.classList.toggle('darkMode');
  const isDark = document.body.classList.contains('darkMode');
  localStorage.setItem('campuscart-theme', isDark ? 'darkMode' : 'lightMode');
  _updateThemeBtn();
  document.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark } }));
}

function _updateThemeBtn() {
  const isDark = document.body.classList.contains('darkMode');
  const icon = isDark ? '☀️' : '🌙';
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = icon;
  const floatBtn = document.getElementById('theme-toggle-float');
  if (floatBtn) floatBtn.textContent = icon;
}
