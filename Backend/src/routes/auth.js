const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { auth, signToken } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../utils/errors');
const { clean } = require('../utils/sanitize');

const router = express.Router();

// Защита от подбора паролей: считаются только неудачные запросы
router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Слишком много попыток, попробуйте позже' },
  })
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');

// Регистрация
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const email = clean(req.body.email, 255).toLowerCase();
    const name = clean(req.body.name, 100);
    const phone = clean(req.body.phone, 30);
    const city = clean(req.body.city, 100);
    const password = String(req.body.password || '');

    const errors = {};
    if (!EMAIL_RE.test(email)) errors.email = 'Некорректный email';
    if (name.length < 2) errors.name = 'Имя: минимум 2 символа';
    if (password.length < 8) errors.password = 'Пароль: минимум 8 символов';
    if (Object.keys(errors).length) throw new AppError(400, 'Проверьте введённые данные', errors);

    const exists = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (exists.rowCount) throw new AppError(409, 'Пользователь с таким email уже существует');

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, name, phone, city)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, phone, city`,
      [email, passwordHash, name, phone || null, city || null]
    );
    res.status(201).json({ token: signToken(rows[0]), user: rows[0] });
  })
);

// Вход
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = clean(req.body.email, 255).toLowerCase();
    const password = String(req.body.password || '');

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) throw new AppError(401, 'Неверный email или пароль');

    res.json({
      token: signToken(user),
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone, city: user.city },
    });
  })
);

// Текущий пользователь
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

// Запрос на сброс пароля
router.post(
  '/forgot',
  asyncHandler(async (req, res) => {
    const email = clean(req.body.email, 255).toLowerCase();
    const response = { message: 'Если такой email зарегистрирован, ссылка для сброса пароля отправлена' };

    const { rows } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (rows[0]) {
      const token = crypto.randomBytes(32).toString('hex');
      await db.query(
        `INSERT INTO password_resets (user_id, token_hash, expires_at)
         VALUES ($1, $2, now() + interval '1 hour')`,
        [rows[0].id, hashToken(token)]
      );
      const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
      console.log('Ссылка для сброса пароля:', link); // вместо отправки письма
      if (process.env.NODE_ENV !== 'production') response.devResetLink = link;
    }
    res.json(response);
  })
);

// Установка нового пароля
router.post(
  '/reset',
  asyncHandler(async (req, res) => {
    const token = String(req.body.token || '');
    const password = String(req.body.password || '');
    if (password.length < 8) throw new AppError(400, 'Пароль: минимум 8 символов');

    const { rows } = await db.query(
      `SELECT id, user_id FROM password_resets
       WHERE token_hash = $1 AND used = false AND expires_at > now()`,
      [hashToken(token)]
    );
    if (!rows[0]) throw new AppError(400, 'Ссылка недействительна или устарела');

    const passwordHash = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, rows[0].user_id]);
    await db.query('UPDATE password_resets SET used = true WHERE id = $1', [rows[0].id]);
    res.json({ message: 'Пароль изменён. Теперь можно войти' });
  })
);

module.exports = router;