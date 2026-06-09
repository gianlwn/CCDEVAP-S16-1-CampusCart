function storeTheme(){
  
  const saved = localStorage.getItem('theme')
  
  if (saved == 'darkMode') {
    document.body.classList.add('darkMode');
  }
  
}

function toggleTheme(){
  
document.body.classList.toggle('darkMode');
  
const isDark = document.body.classList.contains('darkMode');
  localStorage.setItem('theme', isDark ? 'darkMode' : 'lightMode');

  document.getElementById('theme-toggle').textContent = isDark ? '☀️' : '🌙';
}


