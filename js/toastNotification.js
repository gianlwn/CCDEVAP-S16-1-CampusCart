(function () {

  function getContainer() {
    var c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  var META = {
    success: { icon: '✓' },
    warning: { icon: '⚠' },
    error: { icon: '✕' },
    info: { icon: 'ℹ' },
  };

  function dismiss(toast) {
    if (!toast.parentNode || toast.classList.contains('is-dismissing')) return;
    toast.classList.add('is-dismissing');
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    toast.style.animation = 'toastOut 0.3s ease forwards';
    toast.addEventListener('animationend', function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    });
  }

  window.showToast = function (title, message, type, duration) {
    type = type || 'info';
    duration = (duration !== undefined && duration !== null) ? duration : 5000;

    var container = getContainer();
    var meta = META[type] || META.info;

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML =
      '<span class="toast-icon">' + meta.icon + '</span>' +
      '<div class="toast-body">' +
      '<p class="toast-title">' + title + '</p>' +
      (message ? '<p class="toast-message">' + message + '</p>' : '') +
      '</div>' +
      '<button class="toast-close" aria-label="Close">✕</button>';

    toast.querySelector('.toast-close').addEventListener('click', function () {
      dismiss(toast);
    });

    container.appendChild(toast);

    if (duration > 0) {
      toast.timeoutId = setTimeout(function () { dismiss(toast); }, duration);
    }
  };

})();
