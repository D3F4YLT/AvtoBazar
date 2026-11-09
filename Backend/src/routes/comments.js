const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../utils/errors');
const { clean } = require('../utils/sanitize');

const router = express.Router();

const toId = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

// Комментарии к объявлению
router.get(
  '/cars/:carId/comments',
  asyncHandler(async (req, res) => {
    const carId = toId(req.params.carId);
    if (carId === null) throw new AppError(404, 'Объявление не найдено');
    const { rows } = await db.query(
      `SELECT c.id, c.text, c.created_at, c.user_id, u.name AS author
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.car_id = $1
       ORDER BY c.created_at ASC`,
      [carId]
    );
    res.json({ comments: rows });
  })
);

// Добавить комментарий
router.post(
  '/cars/:carId/comments',
  auth,
  asyncHandler(async (req, res) => {
    const carId = toId(req.params.carId);
    if (carId === null) throw new AppError(404, 'Объявление не найдено');
    const text = clean(req.body.text, 1000);
    if (text.length < 1) throw new AppError(400, 'Комментарий не может быть пустым');

    const car = await db.query('SELECT 1 FROM cars WHERE id = $1', [carId]);
    if (!car.rowCount) throw new AppError(404, 'Объявление не найдено');

    const { rows } = await db.query(
      'INSERT INTO comments (car_id, user_id, text) VALUES ($1, $2, $3) RETURNING id, text, created_at, user_id',
      [carId, req.user.id, text]
    );
    res.status(201).json({ comment: { ...rows[0], author: req.user.name } });
  })
);

// Удалить комментарий: автор комментария или владелец объявления
router.delete(
  '/comments/:id',
  auth,
  asyncHandler(async (req, res) => {
    const id = toId(req.params.id);
    if (id === null) throw new AppError(404, 'Комментарий не найден');

    const { rows } = await db.query(
      `SELECT c.user_id, cars.user_id AS owner_id
       FROM comments c JOIN cars ON cars.id = c.car_id
       WHERE c.id = $1`,
      [id]
    );
    if (!rows[0]) throw new AppError(404, 'Комментарий не найден');
    if (rows[0].user_id !== req.user.id && rows[0].owner_id !== req.user.id) {
      throw new AppError(403, 'Нет прав на удаление');
    }
    await db.query('DELETE FROM comments WHERE id = $1', [id]);
    res.json({ message: 'Комментарий удалён' });
  })
);

module.exports = router;