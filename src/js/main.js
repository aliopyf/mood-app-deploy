// Главный файл приложения. Инициализирует все модули

import { initTabs } from './modules/tabs.js';
import { initMoodSelector } from './modules/mood.js';
import { initHistory } from './modules/history.js';
import { initNotes } from './modules/notes.js';
import { initCalendar } from './modules/calendar.js';
import { loadState } from './modules/state.js';
import { isStorageAvailable } from './modules/storage.js';
import { 
  isNotificationSupported, 
  getNotificationPermission,
  initReminders 
} from './modules/notifications.js';
import { getAdvice } from './modules/adviceApi.js';

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log('Трекер настроения запущен!');
  
  // Проверка поддержки браузерных API
  checkBrowserSupport();
  
  // Загрузить данные
  loadState();
  
  // Инициализируем все модули
  initTabs();
  initMoodSelector();
  initHistory();
  initNotes();
  initCalendar();
  
  // Инициализировать напоминания
  initReminders();
  
  // Инициализировать настройки
  initSettings();
  
  console.log('Все модули инициализированы');
});

// Проверка поддержки браузерных API
function checkBrowserSupport() {
  console.log('Проверка поддержки браузерных API:');
  
  // Web Storage API
  if (isStorageAvailable()) {
    console.log('Storage поддерживается');
  } else {
    console.warn('Storage недоступен. Данные не будут сохраняться.');
  }
  
  // Notification API
  if (isNotificationSupported()) {
    console.log('Notification API поддерживается');
    console.log(`Статус разрешения: ${getNotificationPermission()}`);
  } else {
    console.warn('Notification API не поддерживается');
  }
}

// Инициализация настроек
function initSettings() {
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings');
  
  if (!settingsBtn || !settingsModal || !closeSettingsBtn) {
    console.warn('Элементы настроек не найдены');
    return;
  }
  
  // Открыть настройки
  settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
    initSettingsPanel();
  });
  
  // Закрыть настройки
  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });
  
  // Закрыть по клику вне модального окна
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add('hidden');
    }
  });
}

// Инициализация панели настроек
async function initSettingsPanel() {
  const { 
    requestNotificationPermission,
    setupReminder,
    disableReminder,
    loadReminderSettings,
    getNotificationPermission
  } = await import('./modules/notifications.js');
  
  const { exportData, importData, clearStorage, getStorageSize } = await import('./modules/storage.js');
  const { clearAllData, loadState } = await import('./modules/state.js');
  const { updateHistory } = await import('./modules/history.js');
  const { updateNotes } = await import('./modules/notes.js');
  const { updateCalendar } = await import('./modules/calendar.js');
  const { showToast } = await import('./modules/toast.js');
  
  // Уведомления
  const notificationToggle = document.getElementById('notification-toggle');
  const reminderSelect = document.getElementById('reminder-interval');
  
  if (notificationToggle) {
    const permission = getNotificationPermission();
    notificationToggle.checked = permission === 'granted';
    
    notificationToggle.addEventListener('change', async () => {
      if (notificationToggle.checked) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          notificationToggle.checked = false;
        }
      }
    });
  }
  
  if (reminderSelect) {
    const settings = loadReminderSettings();
    reminderSelect.value = settings.enabled ? settings.hours : '0';
    
    reminderSelect.addEventListener('change', () => {
      const hours = parseInt(reminderSelect.value);
      if (hours === 0) {
        disableReminder();
      } else {
        setupReminder(hours);
      }
    });
  }
  
  // Экспорт данных
  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportData();
      showToast('Данные экспортированы!', '');
    });
  }
  
  // Импорт данных
  const importInput = document.getElementById('import-data-input');
  const importBtn = document.getElementById('import-data-btn');
  
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => {
      importInput.click();
    });
    
    importInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const data = await importData(file);
        
        // Импортировать данные в state
        const { state } = await import('./modules/state.js');
        state.moods = data.moods;
        state.notes = data.notes;
        
        // Сохранить в Storage
        const { saveToStorage } = await import('./modules/storage.js');
        saveToStorage('MOODS', data.moods);
        saveToStorage('NOTES', data.notes);
        saveToStorage('SETTINGS', data.settings);
        
        // Обновить UI
        updateHistory();
        updateNotes();
        updateCalendar();
        
        showToast('Данные импортированы!', '');
      } catch (error) {
        showToast('Ошибка импорта данных', '');
        console.error(error);
      }
      
      importInput.value = '';
    });
  }
  
  // Очистка данных
  const clearBtn = document.getElementById('clear-data-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Удалить все данные? Это действие нельзя отменить!')) {
        clearAllData();
        clearStorage();
        updateHistory();
        updateNotes();
        updateCalendar();
        showToast('Все данные удалены', '');
      }
    });
  }
  
  // Показать размер данных
  const storageSize = document.getElementById('storage-size');
  if (storageSize) {
    storageSize.textContent = `${getStorageSize()} KB`;
  }
}

// Обработка ошибок
window.addEventListener('error', (event) => {
  console.error('Ошибка приложения:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Необработанное событие:', event.reason);
});

// Совет/мысль дня
document.addEventListener('DOMContentLoaded', async () => {
  const adviceEl = document.getElementById('advice-text');
  if (!adviceEl) return;

  const advice = await getAdvice();
  adviceEl.textContent = advice || 'Не забывайте заботиться о себе, своем ментальном и физическом состоянии';
});

