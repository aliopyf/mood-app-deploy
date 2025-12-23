/// Модуль управления вкладками. Переключение между разделами приложения

import { state } from './state.js';

export function initTabs() {
  
  const tabInputs = document.querySelectorAll('.tab-input');
  
  tabInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const tabName = e.target.id.replace('tab-', '');
      state.activeTab = tabName;
      console.log(`Переключено на вкладку: ${tabName}`);
    });
  });
}
