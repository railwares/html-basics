
document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Попередні функції ініціалізації
  initActiveNav(); 
  initMenuToggle(); 
  initThemeToggle();
  initBackToTop(); 
  initAccordion(); 
  initFilters(); // Для статичної таблиці на головній
  initModal(); // Lightbox для звичайних картинок
  initContactForm();

  // НОВЕ: Ініціалізація динамічного каталогу
  await initCatalogPage();
}

// Функції-помічники
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// --- ГЛОБАЛЬНІ ЗМІННІ КАТАЛОГУ ---
let allItems = [];
let filteredItems = [];
let displayedCount = 0;
const ITEMS_PER_PAGE = 4;

// 1, 2. Завантаження даних через fetch() (async/await + try/catch)
async function initCatalogPage() {
  const container = $('[data-catalog]');
  if (!container) return;

  const loading = $('#state-loading');
  const errorEl = $('#state-error');

  try {
    loading?.classList.remove('hidden');
    // Шлях до JSON (виходимо з папки js та заходимо в data)
    const response = await fetch('../data/items.json');
    if (!response.ok) throw new Error('Помилка мережі');
    
    allItems = await response.json();
    filteredItems = [...allItems];
    
    loading?.classList.add('hidden');
    
    initCatalogControls();
    applyFiltersAndSort(); // Перший рендер
  } catch (err) {
    console.error(err);
    loading?.classList.add('hidden');
    errorEl?.classList.remove('hidden');
  }
}

// 4, 9. Рендеринг карток та пагінація
function renderCatalog() {
  const container = $('[data-catalog]');
  const empty = $('#state-empty');
  const pagination = $('#pagination-wrapper');
  const favs = JSON.parse(localStorage.getItem('favoritesList') || '[]');

  container.innerHTML = '';
  
  if (filteredItems.length === 0) {
    empty?.classList.remove('hidden');
    pagination?.classList.add('hidden');
    return;
  }

  empty?.classList.add('hidden');
  const toShow = filteredItems.slice(0, displayedCount);

  toShow.forEach(item => {
    const isFav = favs.includes(item.id);
    const html = `
      <div class="card course-card">
        <img src="${item.image}" alt="${item.title}" class="course-img">
        <div class="course-meta"><span>🏷️ ${item.category}</span><span>⭐ ${item.level}</span></div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <div class="course-price">${item.price === 0 ? 'Безкоштовно' : item.price + ' грн'}</div>
        <div class="card-actions">
          <button class="btn-primary btn-details" data-id="${item.id}" style="flex:1;">Детальніше</button>
          <button class="btn-fav ${isFav ? 'active' : ''}" data-id="${item.id}">${isFav ? '❤️' : '🤍'}</button>
        </div>
      </div>`;
    container.insertAdjacentHTML('beforeend', html);
  });

  pagination?.classList.toggle('hidden', displayedCount >= filteredItems.length);
}

// 5, 6, 7. Пошук, Фільтрація та Сортування
function applyFiltersAndSort() {
  const query = $('#search-input')?.value.toLowerCase() || '';
  const cat = $('#category-filter')?.value || 'all';
  const sort = $('#sort-select')?.value || 'default';

  filteredItems = allItems.filter(item => 
    (item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)) &&
    (cat === 'all' || item.category === cat)
  );

  if (sort === 'price-asc') filteredItems.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') filteredItems.sort((a, b) => b.price - a.price);
  if (sort === 'name-asc') filteredItems.sort((a, b) => a.title.localeCompare(b.title));

  displayedCount = ITEMS_PER_PAGE;
  renderCatalog();
}

function initCatalogControls() {
  const search = $('#search-input'), cat = $('#category-filter'), sort = $('#sort-select'), more = $('#btn-show-more');

  [search, cat, sort].forEach(el => el?.addEventListener('change', applyFiltersAndSort));
  search?.addEventListener('input', applyFiltersAndSort);
  
  more?.addEventListener('click', () => {
    displayedCount += ITEMS_PER_PAGE;
    renderCatalog();
  });

  $('[data-catalog]')?.addEventListener('click', handleCatalogActions);
}

// 8, 10. Обране та Деталі (Модальне вікно)
function handleCatalogActions(e) {
  const id = e.target.closest('[data-id]')?.dataset.id;
  if (!id) return;

  if (e.target.closest('.btn-fav')) {
    let favs = JSON.parse(localStorage.getItem('favoritesList') || '[]');
    favs = favs.includes(id) ? favs.filter(i => i !== id) : [...favs, id];
    localStorage.setItem('favoritesList', JSON.stringify(favs));
    renderCatalog();
  }

  if (e.target.closest('.btn-details')) {
    const item = allItems.find(i => i.id === id);
    const modal = $('#details-modal'), body = $('#modal-body');
    if (!item || !modal) return;

    body.innerHTML = `
      <img src="${item.image}" alt="${item.title}" style="width:100%;border-radius:8px;margin-bottom:15px;">
      <h2>${item.title}</h2>
      <p><strong>Рівень:</strong> ${item.level}</p>
      <p><strong>Ціна:</strong> ${item.price} грн</p>
      <p style="margin-top:10px;">${item.description}</p>`;
    modal.classList.remove('hidden');
    $('#modal-close').onclick = () => modal.classList.add('hidden');
  }
}

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

// 7. Пошук/Фільтр у таблиці
const initFilters = () => {
  const search = $('#table-search'), rows = $$('.styled-table tbody tr');
  if (search) search.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    rows.forEach(r => r.classList.toggle('hidden', !r.textContent.toLowerCase().includes(term)));
  });
};

// 8. Модальне вікно (Lightbox)
const initModal = () => {
  const modal = $('.modal-overlay'), imgNode = $('.modal-img');
  if (!modal) return;
  
  $$('.responsive-img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => { imgNode.src = img.src; modal.classList.remove('hidden'); });
  });
  
  modal.addEventListener('click', e => (e.target === modal || e.target.closest('.modal-close')) && modal.classList.add('hidden'));
};

// 9 та 10. Форма (Чернетка, Валідація, FormData)
const initContactForm = () => {
  const form = $('.contact-form');
  if (!form) return;

  const name = $('#name'), email = $('#email'), msg = $('#message'), cnt = $('#char-count');
  const draft = JSON.parse(localStorage.getItem('contactDraft') || '{}');

  // Відновлення значень масивом
  [name, email, msg].forEach(el => el.value = draft[el.id] || '');

  const updCnt = () => cnt && (cnt.textContent = `Введено символів: ${msg.value.length}`);
  updCnt();
  msg.addEventListener('input', updCnt);

  // Збереження чернетки
  form.addEventListener('input', () => localStorage.setItem('contactDraft', JSON.stringify({
    name: name.value, email: email.value, message: msg.value
  })));

  form.addEventListener('submit', e => {
    e.preventDefault();
    $$('.error-text').forEach(el => el.remove()); // Очищення старих помилок
    let valid = true;

    // Вбудована функція показу помилок
    const err = (el, txt) => {
      el.insertAdjacentHTML('afterend', `<div class="error-text" style="color:#dc2626;font-size:0.85rem;margin-top:4px;">${txt}</div>`);
      valid = false;
    };

    if (name.value.trim().length < 2) err(name, "Ім'я має містити щонайменше 2 символи.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) err(email, "Введіть коректний email.");
    if (!msg.value.trim()) err(msg, "Повідомлення не може бути порожнім.");

    if (valid) {
      form.classList.add('hidden');
      const success = $('#form-success');
      success.classList.remove('hidden');
      success.innerHTML = `<h3>Дякуємо, ${name.value}!</h3><p>Повідомлення отримано.</p><p>Спосіб зв'язку: <strong>${new FormData(form).get('contactWay')}</strong>.</p>`;
      localStorage.removeItem('contactDraft');
      form.reset();
    }
  });
};

