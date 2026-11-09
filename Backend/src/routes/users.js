const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { auth } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../utils/errors');
const { clean } = require('../utils/sanitize');

const router = express.Router();

// Все маршруты профиля — только для вошедших пользователей
router.use(auth);

// Просмотр профиля
router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM cars WHERE user_id = $1', [req.user.id]);
    res.json({ user: req.user, carsCount: rows[0].count });
  })
);

// Редактирование профиля
router.put(
  '/me',
  asyncHandler(async (req, res) => {
    const name = clean(req.body.name, 100);
    const phone = clean(req.body.phone, 30);
    const city = clean(req.body.city, 100);
    if (name.length < 2) {
      throw new AppError(400, 'Проверьте введённые данные', { name: 'Имя: минимум 2 символа' });
    }
    const { rows } = await db.query(
      `UPDATE users SET name = $1, phone = $2, city = $3 WHERE id = $4
       RETURNING id, email, name, phone, city, created_at`,
      [name, phone || null, city || null, req.user.id]
    );
    res.json({ user: rows[0] });
  })
);

// Смена пароля
router.put(
  '/me/password',
  asyncHandler(async (req, res) => {
    const current = String(req.body.currentPassword || '');
    const next = String(req.body.newPassword || '');
    if (next.length < 8) throw new AppError(400, 'Новый пароль: минимум 8 символов');

    const { rows } = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const ok = await bcrypt.compare(current, rows[0].password_hash);
    if (!ok) throw new AppError(400, 'Текущий пароль неверный');

    const hash = await bcrypt.hash(next, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Пароль изменён' });
  })
);

// История объявлений пользователя
router.get(
  '/me/cars',
  asyncHandler(async (req, res) => {
    const { rows } = await db.query(
      `SELECT c.id, c.brand, c.model, c.year, c.price, c.mileage, c.city, c.views, c.created_at,
              (SELECT url FROM car_images i WHERE i.car_id = c.id ORDER BY position, id LIMIT 1) AS image
       FROM cars c
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json({ cars: rows });
  })
);

module.exports = router;