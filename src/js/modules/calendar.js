// Модуль календаря. Визуализация настроений по дням месяца

import { state, moodTypes, getMoodForDay, changeMonth } from './state.js';

export function updateCalendar() {
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  // Обновить заголовок
  const monthTitle = document.getElementById('calendar-month');
  if (monthTitle) {
    monthTitle.textContent = `${monthNames[state.currentMonth]} ${state.currentYear}`;
  }

  // Получить первый и последний день месяца
  const firstDay = new Date(state.currentYear, state.currentMonth, 1);
  const lastDay = new Date(state.currentYear, state.currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Получить день недели первого дня
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  // Создать сетку календаря
  const grid = document.getElementById('calendar-grid');
  if (!grid) {
    console.error('Сетка календаря не найдена');
    return;
  }

  grid.innerHTML = '';

  // Даты из предыдущего месяца
  const prevMonthLastDay = new Date(state.currentYear, state.currentMonth, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day calendar-day--other-month';
    const day = prevMonthLastDay - i;
    cell.innerHTML = `<div class="calendar-day__number">${day}</div>`;
    grid.appendChild(cell);
  }

  // Дни текущего месяца
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';

    const mood = getMoodForDay(state.currentYear, state.currentMonth, day);

    if (mood) {
      const moodInfo = moodTypes[mood.type];
      cell.classList.add('calendar-day--has-mood');
      cell.innerHTML = `
        <div class="calendar-day__number">${day}</div>
        <div class="calendar-day__emoji" title="${moodInfo.label}">${moodInfo.emoji}</div>
      `;
      cell.style.borderColor = moodInfo.color;
    } else {
      cell.innerHTML = `<div class="calendar-day__number">${day}</div>`;
    }

    // Подсветить сегодняшний день
    const today = new Date();
    if (day === today.getDate() && 
        state.currentMonth === today.getMonth() && 
        state.currentYear === today.getFullYear()) {
      cell.classList.add('calendar-day--today');
    }

    grid.appendChild(cell);
  }

  // Даты из следующего месяца
  const totalCells = grid.children.length;
  const remainingCells = 35 - totalCells; // 5 недель по 7 дней = 35 ячеек
  for (let day = 1; day <= remainingCells; day++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day calendar-day--other-month';
    cell.innerHTML = `<div class="calendar-day__number">${day}</div>`;
    grid.appendChild(cell);
  }
}

export function initCalendar() {
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');

  if (!prevBtn || !nextBtn) {
    console.error('Кнопки навигации календаря не найдены');
    return;
  }

  // Кнопки навигации
  prevBtn.addEventListener('click', () => {
    changeMonth('prev');
    updateCalendar();
  });

  nextBtn.addEventListener('click', () => {
    changeMonth('next');
    updateCalendar();
  });

  updateCalendar();
}