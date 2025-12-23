// Модуль toast-уведомлений

export function showToast(title = 'Успешно!', message = 'Операция выполнена', duration = 3000) {
  const toast = document.getElementById('toast-notification');
  
  if (!toast) {
    console.error('Toast элемент не найден');
    return;
  }

  // Обновить содержимое
  const titleElement = toast.querySelector('.toast-notification__title');
  const messageElement = toast.querySelector('.toast-notification__message');
  
  if (titleElement) titleElement.textContent = title;
  if (messageElement) messageElement.textContent = message;

  // Показать уведомление
  toast.classList.add('toast-notification--show');

  // Автоматически скрыть через время
  setTimeout(() => {
    toast.classList.remove('toast-notification--show');
  }, duration);
}
