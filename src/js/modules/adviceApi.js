// Получение совета с сервера (GET)

const ADVICE_URL = 'https://api.adviceslip.com/advice';

export async function getAdvice() {
  try {
    const response = await fetch(ADVICE_URL);

    if (!response.ok) {
      throw new Error('Ошибка при получении совета');
    }

    const data = await response.json();
    return data.slip.advice;
  } catch (error) {
    console.error('Advice API error:', error);
    return null;
  }
}
