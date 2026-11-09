require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');
const catalog = require('./utils/catalog');

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const CITIES = ['Кызылорда', 'Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Тараз', 'Павлодар'];
const COLORS = ['Белый', 'Чёрный', 'Серый', 'Синий', 'Красный', 'Серебристый'];
const DESCRIPTIONS = [
  'Один владелец, обслуживался у официального дилера.',
  'Состояние отличное, без аварий и окрасов.',
  'Салон чистый, не курили. Торг уместен.',
  'Недавно заменены масло и фильтры, всё работает исправно.',
  'Хорошая машина для города и трассы, расход небольшой.',
];

const SELLERS = [
  ['Алмас', 'almas@example.com', '+77011111111', 'Кызылорда'],
  ['Дана', 'dana@example.com', '+77022222222', 'Алматы'],
  ['Ержан', 'erzhan@example.com', '+77033333333', 'Астана'],
];

(async () => {
  try {
    const count = await db.query('SELECT COUNT(*)::int AS n FROM cars');
    if (count.rows[0].n >= 20) {
      console.log('В базе уже есть объявления, пропускаем.');
      return;
    }

    const hash = await bcrypt.hash('password123', 10);
    const ids = [];
    for (const [name, email, phone, city] of SELLERS) {
      const { rows } = await db.query(
        `INSERT INTO users (email, password_hash, name, phone, city)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [email, hash, name, phone, city]
      );
      ids.push(rows[0].id);
    }

    const brandNames = Object.keys(catalog.brands);
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 30; i++) {
      const brand = pick(brandNames);
      const model = pick(catalog.brands[brand]);
      const year = rand(2005, currentYear - 1);
      const age = currentYear - year;
      const mileage = age * rand(8000, 25000) + rand(0, 5000);
      const price = Math.max(1500, Math.round((30000 - age * 1200 + rand(-3000, 5000)) / 100) * 100);

      await db.query(
        `INSERT INTO cars (user_id, brand, model, year, price, mileage, fuel, transmission,
                           body_type, color, city, description, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, now() - make_interval(days => $13))`,
        [pick(ids), brand, model, year, price, mileage, pick(catalog.fuels), pick(catalog.transmissions),
         pick(catalog.bodyTypes), pick(COLORS), pick(CITIES), pick(DESCRIPTIONS), rand(0, 60)]
      );
    }

    console.log('Готово: добавлено 3 продавца и 30 объявлений. Пароль продавцов: password123');
  } catch (e) {
    console.error('Ошибка seed:', e.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
})();