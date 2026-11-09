function notFound(req, res) {
  res.status(404).json({ message: 'Маршрут не найден' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Файл слишком большой (максимум 5 МБ)' });
  }
  if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: 'Можно загрузить не более 10 фотографий' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Некорректный JSON' });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    message: status >= 500 ? 'Внутренняя ошибка сервера' : err.message,
    ...(err.details ? { errors: err.details } : {}),
  });
}

module.exports = { notFound, errorHandler };