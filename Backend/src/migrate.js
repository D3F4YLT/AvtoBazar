require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./db');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await db.query(sql);
    console.log('Миграция выполнена: таблицы и индексы созданы.');
  } catch (e) {
    console.error('Ошибка миграции:', e.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
})();