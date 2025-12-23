// Модуль работы с Web Storage API. Сохранение и загрузка данных приложения

const STORAGE_KEYS = {
  MOODS: 'moodTracker_moods',
  NOTES: 'moodTracker_notes',
  SETTINGS: 'moodTracker_settings'
};

// Проверка поддержки Storage

export function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn('Local Storage недоступен:', e);
    return false;
  }
}

// Сохранить данные в Storage

export function saveToStorage(key, data) {
  if (!isStorageAvailable()) {
    console.warn('Local Storage недоступен. Данные не сохранены.');
    return false;
  }

  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEYS[key], serialized);
    console.log(`Данные сохранены: ${key}`);
    return true;
  } catch (e) {
    console.error('Ошибка сохранения в localStorage:', e);
    return false;
  }
}

// Загрузить данные из Storage

export function loadFromStorage(key) {
  if (!isStorageAvailable()) {
    console.warn('Local Storage недоступен. Возвращены пустые данные.');
    return null;
  }

  try {
    const serialized = localStorage.getItem(STORAGE_KEYS[key]);
    if (serialized === null) {
      return null;
    }

    const data = JSON.parse(serialized);
    
    // Преобразовать строки дат обратно в объекты Date
    if (key === 'MOODS' && Array.isArray(data)) {
      return data.map(mood => ({
        ...mood,
        date: new Date(mood.date)
      }));
    }
    
    if (key === 'NOTES' && Array.isArray(data)) {
      return data.map(note => ({
        ...note,
        date: new Date(note.date)
      }));
    }

    console.log(`Данные загружены: ${key}`);
    return data;
  } catch (e) {
    console.error('Ошибка загрузки из localStorage:', e);
    return null;
  }
}

// Очистить все данные приложения

export function clearStorage() {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('Все данные очищены');
    return true;
  } catch (e) {
    console.error('Ошибка очистки localStorage:', e);
    return false;
  }
}

// Получить размер занимаемых данных

export function getStorageSize() {
  if (!isStorageAvailable()) {
    return 0;
  }

  try {
    let total = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        total += value.length;
      }
    });
    return (total / 1024).toFixed(2); // KB
  } catch (e) {
    console.error('Ошибка получения размера данных:', e);
    return 0;
  }
}

// Экспорт данных в JSON файл

export function exportData() {
  const moods = loadFromStorage('MOODS') || [];
  const notes = loadFromStorage('NOTES') || [];
  const settings = loadFromStorage('SETTINGS') || {};

  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    moods,
    notes,
    settings
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `mood-tracker-backup-${Date.now()}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  console.log('Данные экспортированы');
}

// Импорт данных из JSON файла

export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Валидация данных
        if (!importedData.version || !importedData.moods || !importedData.notes) {
          throw new Error('Неверный формат файла');
        }

        // Преобразовать даты
        const moods = importedData.moods.map(mood => ({
          ...mood,
          date: new Date(mood.date)
        }));

        const notes = importedData.notes.map(note => ({
          ...note,
          date: new Date(note.date)
        }));

        resolve({ moods, notes, settings: importedData.settings || {} });
        console.log('Данные импортированы');
      } catch (error) {
        console.error('Ошибка импорта данных:', error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'));
    };

    reader.readAsText(file);
  });
}
