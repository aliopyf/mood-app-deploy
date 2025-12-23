// Модуль для работы с DOM. Утилиты для создания и обновления элементов

// Форматирование даты
export function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

// Форматирование времени
export function formatTime(date) {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Создать пустое состояние
export function createEmptyState(message, icon = '📝') {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">${icon}</div>
      <p class="empty-state__message">${message}</p>
    </div>
  `;
}
