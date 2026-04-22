async function initCatalog() {
  const container = document.querySelector('[data-catalog]');
  if (!container) return;

  await loadAndRenderCatalog();

  // Знаходимо всі елементи керування
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const sortSelect = document.getElementById('sort-select'); // Додали селект сортування
  
  // Функція, яка збирає всі параметри і відправляє запит на сервер
  const applyFilters = () => {
    // Додаємо .trim(), щоб випадковий пробіл у полі не ламав пошук
    const q = searchInput.value.trim(); 
    const cat = categoryFilter.value;
    const sortVal = sortSelect.value;
    
    const params = new URLSearchParams();
    
    // 1. Пошук
    if (q) params.set('q', q); 
    
    // 2. Фільтр по категорії
    if (cat && cat !== 'all') params.set('category', cat);
    
    // 3. Сортування (НОВА ЛОГІКА ДЛЯ json-server v1+)
    if (sortVal === 'price-asc') {
      params.set('_sort', 'price');  // За зростанням
    } else if (sortVal === 'price-desc') {
      params.set('_sort', '-price'); // Мінус на початку означає за спаданням
    } else if (sortVal === 'name-asc') {
      params.set('_sort', 'title');
    }

    // Відправляємо запит
    loadAndRenderCatalog(params.toString());
  };

  // Вішаємо слухачів подій на всі три елементи
  searchInput.addEventListener('input', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);
  sortSelect.addEventListener('change', applyFilters); // Підключили сортування!

  // Делегація для видалення
  container.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-delete')) {
      const id = e.target.getAttribute('data-id');
      if (confirm('Ви впевнені, що хочете видалити цей курс?')) {
        await deleteItem(id);
        UI.showMessage('Успішно видалено');
        
        // Даємо серверу 100 мілісекунд на оновлення бази
        setTimeout(() => {
          applyFilters(); 
        }, 100);
      }
    }
  });
}

async function loadAndRenderCatalog(queryString = '') {
  const container = document.querySelector('[data-catalog]');
  container.innerHTML = '';
  UI.showLoading(); UI.hideError(); UI.hideEmpty();

  try {
    const items = await getItems(queryString);
    UI.hideLoading();
    
    if (items.length === 0) {
      UI.showEmpty();
      return;
    }

    items.forEach(item => {
      const html = `
        <div class="card course-card">
          <img src="${item.image}" alt="${item.title}" class="course-img">
          <div class="course-meta"><span>🏷️ ${item.category}</span></div>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <div class="course-price">${item.price} грн</div>
          <div class="card-actions">
            <a href="./item-form.html?id=${item.id}" class="btn-primary" style="text-align:center; text-decoration:none; flex:1;">Редагувати</a>
            <button class="btn-delete" data-id="${item.id}" style="background:#dc2626; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer;">🗑️</button>
          </div>
        </div>`;
      container.insertAdjacentHTML('beforeend', html);
    });
  } catch (error) {
    UI.hideLoading();
    UI.showError();
  }
}