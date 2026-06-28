document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("top-nav")) loadTopNav();

  const sideEl = document.getElementById("side-nav");
  if (sideEl) {
    loadSideNav();
    loadBottomNav();
  }

  storeTheme();
});
