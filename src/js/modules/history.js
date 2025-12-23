// Модуль истории настроений. Отображение всех записей о настроении

import { state, moodTypes, deleteMood } from './state.js';
import { formatDate, formatTime, createEmptyState } from './dom.js';
import { updateCalendar } from './calendar.js';

export function updateHistory() {
  const container = document.getElementById('history-list');
  
  if (!container) {
    console.error('Контейнер с историей не найден');
    return;
  }

  if (state.moods.length === 0) {
    container.innerHTML = createEmptyState(
      'Здесь пока пусто. Добавьте своё первое настроение во вкладке 📝Трекер!',
      '📊'
    );
    return;
  }

  container.innerHTML = state.moods.map(mood => {
    const moodInfo = moodTypes[mood.type];
    return `
      <div class="mood-entry">
        <span class="mood-entry__emoji">${moodInfo.emoji}</span>
        <div class="mood-entry__content">
          <div class="mood-entry__header">
            <strong class="mood-entry__title">${moodInfo.label}</strong>
            <time class="mood-entry__date" datetime="${mood.date}">${formatDate(mood.date)} в ${formatTime(mood.date)}</time>
          </div>
          ${mood.note ? `<p class="mood-entry__note">${mood.note}</p>` : ''}
        </div>
        <button class="mood-entry__delete delete-btn" data-id="${mood.id}" aria-label="Удалить">&times;</button>
      </div>
    `;
  }).join('');

  // Добавить обработчики удаления
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      if (confirm('Удалить запись?')) {
        deleteMood(id);
        updateHistory();
        updateCalendar();
      }
    });
  });
}

export function initHistory() {
  updateHistory();
}