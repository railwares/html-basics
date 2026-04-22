
document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Попередні функції ініціалізації загального інтерфейсу сайту
  initActiveNav(); 
  initMenuToggle(); 
  initThemeToggle();
  initBackToTop(); 
  initAccordion(); 
  initFilters(); // Для статичної таблиці на головній
  initModal(); // Lightbox для звичайних картинок
  initContactForm(); // Для сторінки контактів

  // Виклик функцій з НОВИХ модулів (якщо вони існують на сторінці)
  if (typeof initCatalog === 'function') initCatalog();
  if (typeof initItemForm === 'function') initItemForm();
}

// Функції-помічники
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ==========================================
// ЗАГАЛЬНІ UI ФУНКЦІЇ (Залишилися без змін)
// ==========================================

// 2. Підсвічування активної сторінки
const initActiveNav = () => {
  let currentFile = window.location.pathname.split('/').pop();
  if (currentFile === '') currentFile = 'index.html';
  $$('.nav-list a').forEach(a => {
    let linkFile = a.getAttribute('href').split('/').pop();
    if (linkFile === '') linkFile = 'index.html';
    if (currentFile === linkFile) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
};

// 3. Мобільне меню
const initMenuToggle = () => {
  const btn = $('.burger-btn'), nav = $('.nav-list');
  if (!btn || !nav) return;
  
  const toggleMenu = (isOpen) => {
    nav.classList.toggle('is-open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
  };

  btn.addEventListener('click', () => toggleMenu(btn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', e => e.target.tagName === 'A' && toggleMenu(false));
};

// 4. Темна тема
const initThemeToggle = () => {
  const btn = $('.theme-toggle');
  if (localStorage.getItem('siteTheme') === 'dark') document.body.classList.add('theme-dark');
  
  if (btn) btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('theme-dark');
    localStorage.setItem('siteTheme', isDark ? 'dark' : 'light');
  });
};

// 5. Кнопка "Вгору" та рік
const initBackToTop = () => {
  const topBtn = $('.back-to-top'), year = $('.current-year');
  if (year) year.textContent = new Date().getFullYear();
  
  if (topBtn) {
    window.addEventListener('scroll', () => topBtn.classList.toggle('hidden', window.scrollY < 300));
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
};

// 6. Акордеон
const initAccordion = () => {
  $$('.accordion-header').forEach(h => h.addEventListener('click', () => {
    const isActive = h.classList.contains('active');
    // Закриваємо всі
    $$('.accordion-header').forEach(el => { el.classList.remove('active'); el.nextElementSibling.classList.add('hidden'); });
    // Відкриваємо клікнутий, якщо він був закритий
    if (!isActive) { h.classList.add('active'); h.nextElementSibling.classList.remove('hidden'); }
  }));
};

// 7. Пошук/Фільтр у статичній таблиці
const initFilters = () => {
  const search = $('#table-search'), rows = $$('.styled-table tbody tr');
  if (search) search.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    rows.forEach(r => r.classList.toggle('hidden', !r.textContent.toLowerCase().includes(term)));
  });
};

// 8. Модальне вікно (Lightbox) для звичайних картинок
const initModal = () => {
  const modal = $('.modal-overlay'), imgNode = $('.modal-img');
  // Якщо ми на сторінці каталогу, це може конфліктувати, тому перевіряємо, чи є зображення для лайтбоксу
  const imgs = $$('.responsive-img');
  if (!modal || imgs.length === 0) return;
  
  imgs.forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => { imgNode.src = img.src; modal.classList.remove('hidden'); });
  });
  
  modal.addEventListener('click', e => (e.target === modal || e.target.closest('.modal-close')) && modal.classList.add('hidden'));
};

// 9 та 10. Форма (Чернетка, Валідація, FormData) - Сторінка Контактів
const initContactForm = () => {
  const form = $('.contact-form');
  // Перевірка, щоб код виконувався тільки для форми контактів, а не для crud-form
  if (!form || form.id === 'crud-form') return;

  const name = $('#name'), email = $('#email'), msg = $('#message'), cnt = $('#char-count');
  const draft = JSON.parse(localStorage.getItem('contactDraft') || '{}');

  // Відновлення значень масивом
  if(name && email && msg) {
    [name, email, msg].forEach(el => el.value = draft[el.id] || '');

    const updCnt = () => cnt && (cnt.textContent = `Введено символів: ${msg.value.length}`);
    updCnt();
    msg.addEventListener('input', updCnt);

    // Збереження чернетки
    form.addEventListener('input', () => localStorage.setItem('contactDraft', JSON.stringify({
      name: name.value, email: email.value, message: msg.value
    })));
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    $$('.error-text').forEach(el => el.remove()); // Очищення старих помилок
    let valid = true;

    // Вбудована функція показу помилок
    const err = (el, txt) => {
      el.insertAdjacentHTML('afterend', `<div class="error-text" style="color:#dc2626;font-size:0.85rem;margin-top:4px;">${txt}</div>`);
      valid = false;
    };

    if (name && name.value.trim().length < 2) err(name, "Ім'я має містити щонайменше 2 символи.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) err(email, "Введіть коректний email.");
    if (msg && !msg.value.trim()) err(msg, "Повідомлення не може бути порожнім.");

    if (valid) {
      form.classList.add('hidden');
      const success = $('#form-success');
      if(success) {
        success.classList.remove('hidden');
        success.innerHTML = `<h3>Дякуємо, ${name.value}!</h3><p>Повідомлення отримано.</p><p>Спосіб зв'язку: <strong>${new FormData(form).get('contactWay')}</strong>.</p>`;
      }
      localStorage.removeItem('contactDraft');
      form.reset();
    }
  });
};

