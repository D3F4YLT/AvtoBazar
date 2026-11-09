require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`AvtoBazar API запущен: http://localhost:${PORT}`);
  console.log(`Проверка: http://localhost:${PORT}/api/health`);
});