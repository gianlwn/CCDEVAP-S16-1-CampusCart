function enhanceSelect(select) {
  if (select.dataset.enhanced) return;
  select.dataset.enhanced = "true";

  const wrap = document.createElement("div");
  wrap.className = "custom-select";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "custom-select-trigger " + select.className;
  trigger.innerHTML = `<span class="custom-select-value"></span>${ICONS.chevronDown}`;

  const panel = document.createElement("div");
  panel.className = "custom-select-panel";

  wrap.appendChild(trigger);
  wrap.appendChild(panel);
  select.insertAdjacentElement("afterend", wrap);
  select.style.display = "none";

  const valueEl = trigger.querySelector(".custom-select-value");

  const nativeDescriptor =
    Object.getOwnPropertyDescriptor(select, "value") ||
    Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(select),
      "value",
    ) ||
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");

  function currentLabel() {
    const opt = select.options[select.selectedIndex];
    return opt ? opt.textContent : "";
  }

  function syncFromSelect() {
    valueEl.textContent = currentLabel();
    panel.querySelectorAll(".custom-select-option").forEach((el) => {
      el.classList.toggle("selected", el.dataset.value === select.value);
    });
  }

  function rebuildPanel() {
    panel.innerHTML = "";
    Array.from(select.options).forEach((opt) => {
      const item = document.createElement("div");
      item.className = "custom-select-option";
      item.dataset.value = opt.value;
      item.textContent = opt.textContent;
      item.tabIndex = -1;
      if (opt.value === select.value) item.classList.add("selected");
      if (opt.disabled) item.classList.add("disabled");
      item.addEventListener("click", () => {
        if (opt.disabled) return;
        nativeDescriptor.set.call(select, opt.value);
        syncFromSelect();
        closePanel();
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
      panel.appendChild(item);
    });
    syncFromSelect();
  }

  function openPanel() {
    if (select.disabled) return;
    wrap.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
  }
  function closePanel() {
    wrap.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  }
  function togglePanel() {
    wrap.classList.contains("open") ? closePanel() : openPanel();
  }

  trigger.addEventListener("click", togglePanel);
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      openPanel();
      const first = panel.querySelector(
        ".custom-select-option.selected",
      ) || panel.querySelector(".custom-select-option");
      if (first) first.focus();
    } else if (e.key === "Escape") {
      closePanel();
    }
  });

  panel.addEventListener("keydown", (e) => {
    const options = Array.from(panel.querySelectorAll(".custom-select-option"));
    const idx = options.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      (options[idx + 1] || options[0])?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      (options[idx - 1] || options[options.length - 1])?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      document.activeElement?.click();
    } else if (e.key === "Escape") {
      closePanel();
      trigger.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) closePanel();
  });

  if (nativeDescriptor && nativeDescriptor.configurable !== false) {
    Object.defineProperty(select, "value", {
      get() {
        return nativeDescriptor.get.call(select);
      },
      set(v) {
        nativeDescriptor.set.call(select, v);
        syncFromSelect();
      },
      configurable: true,
    });
  }

  new MutationObserver(rebuildPanel).observe(select, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["disabled"],
  });

  rebuildPanel();
}

function initCustomSelects(root) {
  (root || document)
    .querySelectorAll("select.form-select, select.status-filter-dropdown")
    .forEach(enhanceSelect);
}

document.addEventListener("DOMContentLoaded", () => initCustomSelects());
