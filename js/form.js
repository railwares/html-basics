async function initItemForm() {
  const form = document.getElementById('crud-form');
  if (!form) return;

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');
  const pageTitle = document.getElementById('form-page-title');

  // Якщо є ID в URL - це режим редагування (PATCH)
  if (editId) {
    pageTitle.textContent = 'Редагування курсу';
    try {
      const item = await getItemById(editId);
      document.getElementById('title').value = item.title;
      document.getElementById('category').value = item.category;
      document.getElementById('price').value = item.price;
      document.getElementById('description').value = item.description;
      document.getElementById('image').value = item.image;
    } catch (e) {
      UI.showMessage('Помилка завантаження даних для редагування');
    }
  }

  // Обробка відправки форми
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Клієнтська валідація
    const title = document.getElementById('title').value.trim();
    if (title.length < 3) {
      alert('Назва має бути довшою за 3 символи!');
      return;
    }

    const formData = new FormData(form);
    const dataObj = Object.fromEntries(formData.entries());
    dataObj.price = Number(dataObj.price); // Перетворення ціни в число

    try {
      if (editId) {
        await updateItem(editId, dataObj);
        UI.showMessage('Курс успішно оновлено!');
      } else {
        await createItem(dataObj);
        UI.showMessage('Новий курс створено!');
      }
      // Після успіху повертаємось в каталог
      window.location.href = './catalog.html';
    } catch (error) {
      UI.showMessage('Помилка збереження даних');
    }
  });
}