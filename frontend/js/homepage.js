const CATEGORY_ICONS = {
  Electronics: ICONS.laptop,
  Books: ICONS.book,
  "Lab Tools": ICONS.flask,
  Clothing: ICONS.shirt,
  Others: ICONS.package,
};

const CATEGORY_BG = {
  Electronics: "rgba(122,171,138,0.18)",
  Books: "rgba(212,184,150,0.28)",
  "Lab Tools": "rgba(122,171,215,0.18)",
  Clothing: "rgba(210,160,60,0.14)",
  Others: "rgba(158,144,132,0.18)",
};

const CONDITION_COLOR = {
  New: "#7aab8a",
  Used: "#d4883a",
  Good: "#7aaac8",
};

const HP_ITEMS_PER_PAGE = 15;
let allItems = [];
let _filteredItems = [];
let _hpPage = 1;
let activeFilter = "all";

let _advConditions = [];
let _advMinPrice = 0;
let _advMaxPrice = Infinity;

function renderGrid(items) {
  _filteredItems = items;
  _hpPage = 1;
  _renderHpPage();
}

function _renderHpPage() {
  const grid = document.getElementById("item-grid");
  const pag = document.getElementById("hp-pagination");
  if (!grid) return;

  const start = (_hpPage - 1) * HP_ITEMS_PER_PAGE;
  const pageItems = _filteredItems.slice(start, start + HP_ITEMS_PER_PAGE);

  if (!_filteredItems.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon-svg">${ICONS.search}</div>
        <p>No items found.</p>
      </div>`;
    if (pag) pag.innerHTML = "";
    return;
  }

  grid.innerHTML = pageItems
    .map((item) => {
      const bg = CATEGORY_BG[item.category] || CATEGORY_BG.Others;
      const cond = item.condition || "Available";
      const dotColor = CONDITION_COLOR[cond] || "#9e9084";
      const seller = item.seller || "Campus Seller";
      const icon = CATEGORY_ICONS[item.category] || ICONS.package;
      const isOwn = item.seller_id && item.seller_id === getSessionUserId();

      return `
      <div class="hp-item-card" onclick="viewItem('${item.id}')">
        <div class="hp-item-thumb" style="background:${bg}">
          <span class="hp-condition-badge">
            <span class="hp-condition-dot" style="background:${dotColor}"></span>
            ${cond}
          </span>
          ${icon}
        </div>
        <div class="hp-item-info">
          <div class="hp-cat-pills">
            ${(item.categories || [item.category]).map(c => `<span class="hp-cat-pill">${c}</span>`).join("")}
          </div>
          <p class="hp-item-name">${item.name}</p>
          <p class="hp-item-seller">${ICONS.user} ${seller}</p>
          <div class="hp-item-footer">
            <div>
              <p class="hp-item-price">₱${item.price}</p>
              <p class="hp-item-qty">Qty: ${item.quantity ?? 1}</p>
            </div>
            ${isOwn
              ? `<button class="hp-view-btn" disabled style="opacity:0.5;cursor:not-allowed;">Your Listing</button>`
              : `<button class="hp-view-btn" onclick="event.stopPropagation();addToCart('${item.id}')">Add to Cart</button>`
            }
          </div>
        </div>
      </div>`;
    })
    .join("");

  if (pag) _renderHpPagination(pag);
}

function _renderHpPagination(pag) {
  const totalPages = Math.ceil(_filteredItems.length / HP_ITEMS_PER_PAGE);
  if (totalPages <= 1) {
    pag.innerHTML = "";
    return;
  }

  let btns = `<button class="pg-btn${_hpPage === 1 ? " pg-disabled" : ""}" onclick="_hpPageTo(${_hpPage - 1})">&#8592;</button>`;
  for (let p = 1; p <= totalPages; p++) {
    btns += `<button class="pg-btn${p === _hpPage ? " pg-active" : ""}" onclick="_hpPageTo(${p})">${p}</button>`;
  }
  btns += `<button class="pg-btn${_hpPage === totalPages ? " pg-disabled" : ""}" onclick="_hpPageTo(${_hpPage + 1})">&#8594;</button>`;
  pag.innerHTML = `<div class="pg-wrap">${btns}</div>`;
}

function _hpPageTo(p) {
  const totalPages = Math.ceil(_filteredItems.length / HP_ITEMS_PER_PAGE);
  if (p < 1 || p > totalPages) return;
  _hpPage = p;
  _renderHpPage();
  document
    .getElementById("item-grid")
    ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function filterBy(cat, btn) {
  document
    .querySelectorAll(".hp-filter-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  activeFilter = cat;
  applyFilters();
}

function handleSearch() {
  applyFilters();
}

function applyFilters() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;
  const q = searchInput.value.toLowerCase().trim();
  renderGrid(
    filterListings(allItems, {
      category: activeFilter,
      query: q,
      conditions: _advConditions,
      minPrice: _advMinPrice,
      maxPrice: _advMaxPrice,
    }),
  );
}

function openFiltersPanel() {
  const existing = document.getElementById("hp-adv-filters");
  if (existing) {
    existing.remove();
    return;
  }

  const panel = document.createElement("div");
  panel.id = "hp-adv-filters";
  panel.className = "hp-adv-filters";

  const condOpts = ["New", "Good", "Used"];
  const checks = condOpts
    .map(
      (c) =>
        `<label class="hp-afp-check"><input type="checkbox" value="${c}" ${_advConditions.includes(c) ? "checked" : ""}> ${c}</label>`,
    )
    .join("");

  panel.innerHTML = `
    <div class="hp-afp-header">
      <span class="hp-afp-title">Advanced Filters</span>
      <button class="hp-afp-close" onclick="document.getElementById('hp-adv-filters').remove()">✕</button>
    </div>
    <div class="hp-afp-section">
      <p class="hp-afp-label">Condition</p>
      <div class="hp-afp-checks">${checks}</div>
    </div>
    <div class="hp-afp-section">
      <p class="hp-afp-label">Price Range (₱)</p>
      <div class="hp-afp-price-row">
        <input type="number" id="afp-min" placeholder="Min" min="0" value="${_advMinPrice || ""}">
        <span>–</span>
        <input type="number" id="afp-max" placeholder="Max" min="0" value="${_advMaxPrice === Infinity ? "" : _advMaxPrice}">
      </div>
    </div>
    <div class="hp-afp-footer">
      <button class="hp-afp-reset" onclick="resetAdvFilters()">Reset</button>
      <button class="hp-afp-apply" onclick="applyAdvFilters()">Apply</button>
    </div>
  `;

  document
    .querySelector(".hp-filters")
    .insertAdjacentElement("afterend", panel);
}

function applyAdvFilters() {
  _advConditions = [
    ...document.querySelectorAll(
      "#hp-adv-filters input[type=checkbox]:checked",
    ),
  ].map((c) => c.value);
  _advMinPrice = parseFloat(document.getElementById("afp-min")?.value) || 0;
  _advMaxPrice =
    parseFloat(document.getElementById("afp-max")?.value) || Infinity;
  applyFilters();
  document.getElementById("hp-adv-filters")?.remove();
}

function resetAdvFilters() {
  _advConditions = [];
  _advMinPrice = 0;
  _advMaxPrice = Infinity;
  document
    .querySelectorAll("#hp-adv-filters input[type=checkbox]")
    .forEach((c) => (c.checked = false));
  const minEl = document.getElementById("afp-min");
  const maxEl = document.getElementById("afp-max");
  if (minEl) minEl.value = "";
  if (maxEl) maxEl.value = "";
}

function viewItem(id) {
  const item = allItems.find((i) => i.id === id);
  if (item) sessionStorage.setItem("cc_item", JSON.stringify(item));
  window.location.href = "itempage.html?id=" + id;
}

async function addToCart(id) {
  const item = allItems.find((i) => i.id === id);
  if (item && item.seller_id === getSessionUserId()) {
    showToast("Not Allowed", "You cannot add your own listing to your cart.", "warning");
    return;
  }
  const itemName = item ? item.name : "Item";
  try {
    const { ok, data } = await addToCartAPI(id);
    if (ok) {
      showToast("Added to Cart", `"${itemName}" added to your cart.`, "success");
      bumpCartBadge(1);
    } else if (data.error === "already_in_cart") {
      showToast("Already in Cart", "This item is already in your cart.", "warning");
    } else if (data.error === "listing_unavailable") {
      showToast("Unavailable", "This item is no longer available.", "warning");
    } else {
      showToast("Error", "Could not add to cart.", "error");
    }
  } catch {
    showToast("Not Logged In", "Please log in to add items to your cart.", "warning");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");
  if (searchInput)
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSearch();
    });

  fetchListings()
    .then((items) => {
      allItems = items
        .filter((i) => i.status === "active" && (i.quantity ?? 1) > 0)
        .map((i) => ({
          ...i,
          seller: i.seller || "Campus Seller",
          condition: i.condition || "Used",
        }));

      renderGrid(allItems);
    })
    .catch(() => showToast("Error", "Could not load listings.", "error"));
});
