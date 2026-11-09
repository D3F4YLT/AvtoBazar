// Сообщения сервера (на русском) -> английский
const en = {
  'Требуется авторизация': 'Authentication required',
  'Недействительный или просроченный токен': 'Invalid or expired token',
  'Пользователь не найден': 'User not found',
  'Проверьте введённые данные': 'Please check the entered data',
  'Некорректный email': 'Invalid email',
  'Имя: минимум 2 символа': 'Name: at least 2 characters',
  'Пароль: минимум 8 символов': 'Password: at least 8 characters',
  'Новый пароль: минимум 8 символов': 'New password: at least 8 characters',
  'Пользователь с таким email уже существует': 'A user with this email already exists',
  'Неверный email или пароль': 'Incorrect email or password',
  'Если такой email зарегистрирован, ссылка для сброса пароля отправлена':
    'If this email is registered, a password reset link has been sent',
  'Ссылка недействительна или устарела': 'The link is invalid or has expired',
  'Пароль изменён. Теперь можно войти': 'Password changed. You can now log in',
  'Текущий пароль неверный': 'Current password is incorrect',
  'Пароль изменён': 'Password changed',
  'Слишком много попыток, попробуйте позже': 'Too many attempts, please try again later',
  'Слишком много запросов, попробуйте позже': 'Too many requests, please try again later',
  'Маршрут не найден': 'Route not found',
  'Файл слишком большой (максимум 5 МБ)': 'File is too large (5 MB max)',
  'Можно загрузить не более 10 фотографий': 'You can upload up to 10 photos',
  'Некорректный JSON': 'Invalid JSON',
  'Внутренняя ошибка сервера': 'Internal server error',
  'Объявление не найдено': 'Listing not found',
  'Разрешены только изображения JPG, PNG или WebP': 'Only JPG, PNG or WebP images are allowed',
  'Выберите марку из списка': 'Select a make from the list',
  'Выберите модель из списка': 'Select a model from the list',
  'Укажите цену': 'Enter the price',
  'Укажите пробег': 'Enter the mileage',
  'Выберите тип топлива': 'Select the fuel type',
  'Выберите коробку передач': 'Select the transmission',
  'Выберите тип кузова': 'Select the body type',
  'Укажите город': 'Enter the city',
  'Можно изменять только свои объявления': 'You can only edit your own listings',
  'Можно удалять только свои объявления': 'You can only delete your own listings',
  'Объявление удалено': 'Listing deleted',
  'Комментарий не может быть пустым': 'The comment cannot be empty',
  'Комментарий не найден': 'Comment not found',
  'Комментарий удалён': 'Comment deleted',
  'Нет прав на удаление': 'You do not have permission to delete this',
  'Ошибка запроса': 'Request failed',
};

export function translateServerMessage(message, lang) {
  if (lang !== 'en' || typeof message !== 'string') return message;
  if (en[message]) return en[message];

  let m = message.match(/^Год: от 1950 до (\d+)$/);
  if (m) return `Year: from 1950 to ${m[1]}`;
  m = message.match(/^Не более (\d+) фотографий на объявление$/);
  if (m) return `No more than ${m[1]} photos per listing`;
  return message;
}