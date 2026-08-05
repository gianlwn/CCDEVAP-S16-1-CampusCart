(function () {
  function getContainer() {
    var c = document.getElementById("toast-container");
    if (!c) {
      c = document.createElement("div");
      c.id = "toast-container";
      document.body.appendChild(c);
    }
    return c;
  }

  var META = {
    success: { icon: ICONS.check },
    warning: { icon: ICONS.alert },
    error: { icon: ICONS.close },
    info: { icon: ICONS.info },
  };

  function dismiss(toast) {
    if (!toast.parentNode || toast.classList.contains("is-dismissing")) return;
    toast.classList.add("is-dismissing");
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    toast.style.animation = "toastOut 0.3s ease forwards";
    toast.addEventListener("animationend", function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    });
  }

  window.showToast = function (title, message, type, duration) {
    type = type || "info";
    duration = duration !== undefined && duration !== null ? duration : 5000;

    var container = getContainer();
    var meta = META[type] || META.info;

    var toast = document.createElement("div");
    toast.className = "toast toast-" + type;

    var iconSpan = document.createElement("span");
    iconSpan.className = "toast-icon";
    iconSpan.innerHTML = meta.icon;

    var body = document.createElement("div");
    body.className = "toast-body";

    var titleEl = document.createElement("p");
    titleEl.className = "toast-title";
    titleEl.textContent = title;
    body.appendChild(titleEl);

    if (message) {
      var messageEl = document.createElement("p");
      messageEl.className = "toast-message";
      messageEl.textContent = message;
      body.appendChild(messageEl);
    }

    var closeBtn = document.createElement("button");
    closeBtn.className = "toast-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML = ICONS.close;
    closeBtn.addEventListener("click", function () {
      dismiss(toast);
    });

    toast.appendChild(iconSpan);
    toast.appendChild(body);
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    if (duration > 0) {
      toast.timeoutId = setTimeout(function () {
        dismiss(toast);
      }, duration);
    }
  };
})();
