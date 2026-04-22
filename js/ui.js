const UI = {
  showLoading: () => document.getElementById('state-loading')?.classList.remove('hidden'),
  hideLoading: () => document.getElementById('state-loading')?.classList.add('hidden'),
  showError: () => document.getElementById('state-error')?.classList.remove('hidden'),
  hideError: () => document.getElementById('state-error')?.classList.add('hidden'),
  showEmpty: () => document.getElementById('state-empty')?.classList.remove('hidden'),
  hideEmpty: () => document.getElementById('state-empty')?.classList.add('hidden'),
  showMessage: (msg) => { alert(msg); } // Можна замінити на красивий тост (toast)
};