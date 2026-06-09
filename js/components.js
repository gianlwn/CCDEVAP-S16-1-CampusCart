
function loadTopNav(){
  const html = `
    <nav class = "top-nav">

    <div class = "nav-brand">
      <!-- <img src="..."> --> 
      <span> CampusCart </span>
    </div>

    <div class = "nav-icons">
      <button id = "theme-toggle" onclick="toggleTheme()"> 🌙 </button>
      <button id = "notifications"> 🔔 </button>
      <button id = "cart" onclick = "window.location.href='../homepage/cart.html'"> 🛒 </button>
      <button id = "home" onclick = "window.location.href='../homepage/homepage.html'"> 🏠 </button>
      <button id = "profileView" onclick="window.location.href='../user-dashboard/dashboard.html'"> 👤</button>
    </div>
  </nav>
  `;
  
  document.getElementById('top-nav').innerHTML = html;
}


function loadSideNav(){

  const currentPage = window.location.pathname;

  function isActive(page) {
    return currentPage.includes(page) ? 'active' : '';
  }

  const html = `
    <aside class = "side-nav">

      <ul>
        <li class="${isActive('dashboard')}">
          <a href = "../user-profile-dashboard/dashboard.html">
            <span class ="icon"> 📋 </span> Overview
          </a>
        </li>

        <li class="${isActive('userListings')}">
          <a href ="../user-profile-dashboard/userListings.html">
            <span class = "icon"> 🏷️ </span> Listings
          </a>
        </li>
        
        <li class="${isActive('claimed')}">
          <a href ="../user-profile-dashboard/claimed.html">
            <span class = "icon"> 🛍️ </span> Claimed
          </a>
        </li>
        
        <li class="${isActive('ratings')}">
          <a href = "../user-profile-dashboard/ratings.html">
            <span class = "icon"> ⭐ </span> Ratings
          </a>
        </li>

        <li class="${isActive('profile')}">
          <a href = "../user-profile-dashboard/profile.html">
            <span class = "icon"> 👤</span> Profile
          </a>
        </li>

      </ul>

      <button class="signout-btn">Sign Out</button>

    </aside>
    `;
  
  document.getElementById('side-nav').innerHTML = html;
}

// function loadAdminSideNav() { } 

function createClaimedRow(item) {
  return `
  
    <div class="claimed-row">
    
      <div class="spacing"></div>
      
      <div class="item-info">
        <p class="item-name">${item.name}</p>
        <p class="item-meta">${item.price} · ${item.category}</p>
      </div>
      
      <div class="item-stars">${renderStars(item.rating)}</div>
      
      <button class="msg-btn" onclick="window.location.href='../user-dashboard/dashboard.html'" >💬</button>
      
    </div>
    
  `;
}

function createRatingsRow(item){
  return `
    <div class ="ratings-row">
    
      <div class="spacing"></div>
        
      <div class ="item-info">
        <p class="item-name">${item.name}</p>
        <p class="item-meta">${item.price} · ${item.category}</p>
      </div>
      
      <div class = "item-stars">
          ${renderStars(item.rating)}
      </div>
      
      <div class="row-actions">
          <button>✏️</button>
          <button>🗑️</button>
      </div>
          
    </div>
  `;
}

function renderStars(rating){
  let stars = '';
    for (let i = 1; i <=5; i++) {
      stars += i <= rating ? '★' : '☆';
    }
  
  return stars;
}

function loadClaimedRows(containerId) {
 fetch ('../data/mock-claimed.json')
        .then (res => res.json())
        .then(items => {
      const container = document.getElementById(containerId);
  container.innerHTML = items.map (item => createClaimedRow(item)).join('');
        });
}

function loadRatingsRows(containerId) {
 fetch ('../data/mock-ratings.json')
  .then( res => res.json())
  .then ( items => {
    const container = document.getElementById(containerId);
    container.innerHTML = items.map(item => createRatingsRow(item)).join('');
  });
   
}
