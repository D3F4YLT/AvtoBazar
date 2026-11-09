const jwt = require('jsonwebtoken');
const db = require('../db');
const { AppError } = require('../utils/errors');

function extractToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

async function resolveUser(token) {
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError(401, 'Недействительный или просроченный токен');
  }
  const { rows } = await db.query(
    'SELECT id, email, name, phone, city, created_at FROM users WHERE id = $1',
    [payload.id]
  );
  if (!rows[0]) throw new AppError(401, 'Пользователь не найден');
  return rows[0];
}

// Обязательная авторизация
async function auth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) throw new AppError(401, 'Требуется авторизация');
    req.user = await resolveUser(token);
    next();
  } catch (e) {
    next(e);
  }
}

// Необязательная: если токен есть и валиден — подставляем пользователя
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (token) req.user = await resolveUser(token);
  } catch {
    /* игнорируем — продолжаем как гость */
  }
  next();
}

function signToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = { auth, optionalAuth, signToken };