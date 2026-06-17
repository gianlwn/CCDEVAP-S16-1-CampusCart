document.addEventListener('DOMContentLoaded', function () {
  
  if (document.getElementById('top-nav')) loadTopNav();

  
  const sideEl = document.getElementById('side-nav');
  if (sideEl) {
    const isAdmin = window.location.pathname.includes('admin-dashboard');
    if (isAdmin) {
      loadAdminSideNav();     
      loadBottomNav('admin'); 
    } else {
      loadSideNav();          
      loadBottomNav('user');  
    }
  }

  
  storeTheme();
});
