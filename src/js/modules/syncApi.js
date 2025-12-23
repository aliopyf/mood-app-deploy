// Отправка данных на сервер (POST)

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

export async function syncMoodToServer(moodData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(moodData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error('Ошибка при отправке данных');
    }

    return result;
  } catch (error) {
    console.error('Sync API error:', error);
    return null;
  }
}
