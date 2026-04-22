const API_URL = 'http://localhost:3000/items';

async function getItems(queryString = '') {
  const response = await fetch(`${API_URL}?${queryString}`);
  if (!response.ok) throw new Error('Помилка завантаження списку');
  return response.json();
}

async function getItemById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error('Запис не знайдено');
  return response.json();
}

async function createItem(data) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Помилка створення');
  return response.json();
}

async function updateItem(id, data) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Помилка оновлення');
  return response.json();
}

async function deleteItem(id) {
  const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Помилка видалення');
}