// Модуль работы с Notification API. Управление уведомлениями и напоминаниями


import { showToast } from './toast.js';
import { saveToStorage, loadFromStorage } from './storage.js';

// Проверка поддержки Notification API
export function isNotificationSupported() {
  return 'Notification' in window;
}

// Проверка разрешения на уведомления
export function getNotificationPermission() {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Запросить разрешение на уведомления
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    showToast('Ваш браузер не поддерживает уведомления', '');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      showToast('Уведомления включены!', '');
      
      // Показать тестовое уведомление
      showNotification(
        'Уведомления активны!',
        'Теперь вы будете получать напоминания о записи настроения'
      );
      
      return true;
    } else if (permission === 'denied') {
      showToast('Уведомления отклонены. Измените настройки браузера.', '');
      return false;
    } else {
      showToast('Разрешение на уведомления не получено', '');
      return false;
    }
  } catch (error) {
    console.error('Ошибка запроса разрешения на уведомления:', error);
    showToast('Ошибка при запросе уведомлений', '');
    return false;
  }
}

// Показать уведомление
export function showNotification(title, body, icon = '✔️') {
  if (!isNotificationSupported()) {
    console.warn('Notification API не поддерживается');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Нет разрешения на показ уведомлений');
    return null;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: getFaviconOrDefault(),
      badge: getFaviconOrDefault(),
      tag: 'mood-tracker',
      requireInteraction: false,
      silent: false,
      data: {
        dateTime: Date.now()
      }
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Автоматически закрыть через 5 секунд
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  } catch (error) {
    console.error('Ошибка показа уведомления:', error);
    return null;
  }
}

// Получить favicon или использовать дефолтный
function getFaviconOrDefault() {
  const favicon = document.querySelector("link[rel~='icon']");
  return favicon ? favicon.href : '/favicon.ico';
}

// Настройка напоминаний
let reminderInterval = null;

export function setupReminder(hours = 3) {
  if (reminderInterval) {
    clearInterval(reminderInterval);
  }

  if (hours === 0) {
    console.log('Напоминания отключены');
    saveReminderSettings({ enabled: false, hours: 0 });
    return;
  }

  // Проверить разрешение
  if (Notification.permission !== 'granted') {
    console.warn('Нет разрешения на уведомления');
    return;
  }

  const intervalMs = hours * 60 * 60 * 1000; 

  reminderInterval = setInterval(() => {
    showNotification(
      'Время записать настроение!',
      'Не забудьте зафиксировать, как вы себя чувствуете сегодня'
    );
    console.log('Показано напоминание');
  }, intervalMs);

  // Сохранить настройки
  saveReminderSettings({ enabled: true, hours, lastSetup: Date.now() });
  
  console.log(`Напоминания настроены: каждые ${hours} ч.`);
  showToast(`Напоминания настроены: каждые ${hours} ч.`, '');
}

// Отключить напоминания
export function disableReminder() {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
  saveReminderSettings({ enabled: false, hours: 0 });
  showToast('Напоминания отключены', '');
  console.log('Напоминания отключены');
}

// Сохранить настройки напоминаний
function saveReminderSettings(settings) {
  const allSettings = loadFromStorage('SETTINGS') || {};
  allSettings.reminder = settings;
  saveToStorage('SETTINGS', allSettings);
}

// Загрузить настройки напоминаний
export function loadReminderSettings() {
  const allSettings = loadFromStorage('SETTINGS') || {};
  return allSettings.reminder || { enabled: false, hours: 0 };
}

// Инициализация напоминаний при загрузке
export function initReminders() {
  const settings = loadReminderSettings();
  
  if (settings.enabled && settings.hours > 0) {
    // Проверить, есть ли разрешение
    if (Notification.permission === 'granted') {
      setupReminder(settings.hours);
      console.log('Напоминания восстановлены из настроек');
    } else {
      console.log('Напоминания были включены, но нет разрешения');
    }
  }
}

// Уведомление при добавлении настроения
export function notifyMoodAdded(moodLabel) {
  if (Notification.permission === 'granted') {
    showNotification(
      'Настроение сохранено!',
      `Вы записали: ${moodLabel}`
    );
  }
}

// Уведомление при добавлении заметки
export function notifyNoteAdded(title) {
  if (Notification.permission === 'granted') {
    showNotification(
      'Заметка сохранена!',
      `"${title}" успешно добавлена`
    );
  }
}
