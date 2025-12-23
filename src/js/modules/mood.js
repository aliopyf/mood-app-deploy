// Модуль добавления настроения. Обработка выбора настроения и добавления заметок

import { state, addMood, moodTypes } from './state.js';
import { updateHistory } from './history.js';
import { updateCalendar } from './calendar.js';
import { showToast } from './toast.js';
import { notifyMoodAdded } from './notifications.js';
import { syncMoodToServer } from './syncApi.js'; // POST API

export function initMoodSelector() {
  const moodButtons = document.querySelectorAll('.mood-button');
  const noteSection = document.getElementById('mood-note-section');
  const noteInput = document.querySelector('.mood-note');
  const saveButton = document.getElementById('save-mood-btn');

  if (!moodButtons.length || !noteSection || !noteInput || !saveButton) {
    console.error('Не найдены элементы для выбора настроения');
    return;
  }

  let selectedMood = null;

  // Клик на смайлики
  moodButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedMood = button.dataset.mood;

      moodButtons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');

      noteSection.classList.remove('hidden');
      saveButton.classList.remove('hidden');
    });
  });

  // Сохранение настроения
  saveButton.addEventListener('click', () => {
    if (!selectedMood) {
      alert('Выберите настроение!');
      return;
    }

    const note = noteInput.value.trim();

    // Локальное сохранение
    addMood(selectedMood, note);

    // Обновление UI
    updateHistory();
    updateCalendar();

    const moodLabel = moodTypes[selectedMood].label;
    showToast('Настроение сохранено!', '');
    notifyMoodAdded(moodLabel);

    // Очистка формы
    noteInput.value = '';
    moodButtons.forEach(btn => btn.classList.remove('selected'));
    selectedMood = null;

    noteSection.classList.add('hidden');
    saveButton.classList.add('hidden');

    // POST
    syncMoodToServer({
      mood: moodLabel,
      note,
      date: new Date().toISOString()
    }).catch(() => {
      console.warn('Не удалось отправить настроение на сервер');
    });
  });
}
