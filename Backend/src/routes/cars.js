const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');

const db = require('../db');
const { auth, optionalAuth } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../utils/errors');
const { clean } = require('../utils/sanitize');
const { cache, invalidate } = require('../utils/cache');
const catalog = require('../utils/catalog');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const MAX_IMAGES = 10;

// ---------- Загрузка фото ----------
const ALLOWED = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + ALLOWED[file.mimetype]),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_IMAGES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED[file.mimetype]) return cb(null, true);
    cb(new AppError(400, 'Разрешены только изображения JPG, PNG или WebP'));
  },
});

function removeFiles(urls) {
  for (const url of urls) {
    const file = path.join(UPLOAD_DIR, path.basename(url));
    fs.unlink(file, () => {});
  }
}

// ---------- Проверка данных объявления ----------
function parseCar(body) {
  const data = {
    brand: clean(body.brand, 50),
    model: clean(body.model, 50),
    year: parseInt(body.year, 10),
    price: parseInt(body.price, 10),
    mileage: parseInt(body.mileage, 10),
    fuel: clean(body.fuel, 20),
    transmission: clean(body.transmission, 20),
    body_type: clean(body.body_type, 30),
    color: clean(body.color, 30),
    city: clean(body.city, 100),
    description: clean(body.description, 5000),
  };

  const errors = {};
  if (!catalog.brands[data.brand]) errors.brand = 'Выберите марку из списка';
  else if (!catalog.brands[data.brand].includes(data.model)) errors.model = 'Выберите модель из списка';
  const maxYear = new Date().getFullYear() + 1;
  if (!(data.year >= 1950 && data.year <= maxYear)) errors.year = `Год: от 1950 до ${maxYear}`;
  if (!(data.price >= 0 && data.price <= 1000000000)) errors.price = 'Укажите цену';
  if (!(data.mileage >= 0 && data.mileage <= 5000000)) errors.mileage = 'Укажите пробег';
  if (!catalog.fuels.includes(data.fuel)) errors.fuel = 'Выберите тип топлива';
  if (!catalog.transmissions.includes(data.transmission)) errors.transmission = 'Выберите коробку передач';
  if (!catalog.bodyTypes.includes(data.body_type)) errors.body_type = 'Выберите тип кузова';
  if (data.city.length < 2) errors.city = 'Укажите город';

  if (Object.keys(errors).length) throw new AppError(400, 'Проверьте введённые данные', errors);
  return data;
}

const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

// ---------- Список объявлений: поиск, фильтры, сортировка, страницы ----------
const SORTS = {
  newest: 'c.created_at DESC',
  oldest: 'c.created_at ASC',
  price_asc: 'c.price ASC',
  price_desc: 'c.price DESC',
  year_desc: 'c.year DESC',
  year_asc: 'c.year ASC',
  mileage_asc: 'c.mileage ASC',
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = req.query;
    const page = Math.max(toInt(q.page) || 1, 1);
    const limit = Math.min(Math.max(toInt(q.limit) || 12, 1), 50);
    const sort = SORTS[q.sort] ? q.sort : 'newest';

    const cacheKey = 'cars:' + JSON.stringify([q.q, q.brand, q.model, q.yearFrom, q.yearTo, q.priceFrom, q.priceTo,
      q.mileageFrom, q.mileageTo, q.fuel, q.transmission, q.bodyType, q.city, sort, page, limit]);
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    const where = [];
    const params = [];
    const add = (sql, value) => {
      params.push(value);
      where.push(sql.replace('?', '$' + params.length));
    };

    if (q.q) add("(c.brand || ' ' || c.model || ' ' || c.description) ILIKE ?", `%${String(q.q).slice(0, 100)}%`);
    if (q.brand) add('c.brand = ?', String(q.brand));
    if (q.model) add('c.model = ?', String(q.model));
    if (q.fuel) add('c.fuel = ?', String(q.fuel));
    if (q.transmission) add('c.transmission = ?', String(q.transmission));
    if (q.bodyType) add('c.body_type = ?', String(q.bodyType));
    if (q.city) add('c.city ILIKE ?', `%${String(q.city).slice(0, 100)}%`);
    if (toInt(q.yearFrom) !== null) add('c.year >= ?', toInt(q.yearFrom));
    if (toInt(q.yearTo) !== null) add('c.year <= ?', toInt(q.yearTo));
    if (toInt(q.priceFrom) !== null) add('c.price >= ?', toInt(q.priceFrom));
    if (toInt(q.priceTo) !== null) add('c.price <= ?', toInt(q.priceTo));
    if (toInt(q.mileageFrom) !== null) add('c.mileage >= ?', toInt(q.mileageFrom));
    if (toInt(q.mileageTo) !== null) add('c.mileage <= ?', toInt(q.mileageTo));

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
    params.push(limit, (page - 1) * limit);

    const { rows } = await db.query(
      `SELECT c.id, c.brand, c.model, c.year, c.price, c.mileage, c.fuel, c.transmission,
              c.body_type, c.city, c.created_at,
              (SELECT url FROM car_images i WHERE i.car_id = c.id ORDER BY position, id LIMIT 1) AS image,
              COUNT(*) OVER() AS total
       FROM cars c
       ${whereSql}
       ORDER BY ${SORTS[sort]}, c.id DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = rows.length ? Number(rows[0].total) : 0;
    const result = {
      cars: rows.map(({ total: _t, ...car }) => car),
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
    };
    cache.set(cacheKey, result);
    res.json({ ...result, cached: false });
  })
);

// ---------- Карточка объявления ----------
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const id = toInt(req.params.id);
    if (id === null) throw new AppError(404, 'Объявление не найдено');

    const { rows } = await db.query(
      `UPDATE cars SET views = views + 1 WHERE id = $1 RETURNING *`,
      [id]
    );
    if (!rows[0]) throw new AppError(404, 'Объявление не найдено');
    const car = rows[0];

    const [images, seller] = await Promise.all([
      db.query('SELECT id, url FROM car_images WHERE car_id = $1 ORDER BY position, id', [id]),
      db.query('SELECT id, name, phone, email, city FROM users WHERE id = $1', [car.user_id]),
    ]);

    res.json({
      car: { ...car, images: images.rows, seller: seller.rows[0], isOwner: req.user?.id === car.user_id },
    });
  })
);

// ---------- Создание ----------
router.post(
  '/',
  auth,
  upload.array('images', MAX_IMAGES),
  asyncHandler(async (req, res) => {
    const files = req.files || [];
    const urls = files.map((f) => '/uploads/' + f.filename);
    let data;
    try {
      data = parseCar(req.body);
    } catch (e) {
      removeFiles(urls);
      throw e;
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO cars (user_id, brand, model, year, price, mileage, fuel, transmission, body_type, color, city, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
        [req.user.id, data.brand, data.model, data.year, data.price, data.mileage, data.fuel,
         data.transmission, data.body_type, data.color || null, data.city, data.description]
      );
      const carId = rows[0].id;
      for (let i = 0; i < urls.length; i++) {
        await client.query('INSERT INTO car_images (car_id, url, position) VALUES ($1,$2,$3)', [carId, urls[i], i]);
      }
      await client.query('COMMIT');
      invalidate('cars:');
      res.status(201).json({ id: carId });
    } catch (e) {
      await client.query('ROLLBACK');
      removeFiles(urls);
      throw e;
    } finally {
      client.release();
    }
  })
);

// ---------- Изменение ----------
router.put(
  '/:id',
  auth,
  upload.array('images', MAX_IMAGES),
  asyncHandler(async (req, res) => {
    const newUrls = (req.files || []).map((f) => '/uploads/' + f.filename);
    const id = toInt(req.params.id);

    const client = await db.pool.connect();
    try {
      const found = await client.query('SELECT user_id FROM cars WHERE id = $1', [id]);
      if (!found.rows[0]) throw new AppError(404, 'Объявление не найдено');
      if (found.rows[0].user_id !== req.user.id) throw new AppError(403, 'Можно изменять только свои объявления');

      const data = parseCar(req.body);

      // фото, которые пользователь удалил в форме (список id через запятую)
      const removeIds = String(req.body.removeImages || '')
        .split(',').map((s) => parseInt(s, 10)).filter(Number.isFinite);

      await client.query('BEGIN');
      await client.query(
        `UPDATE cars SET brand=$1, model=$2, year=$3, price=$4, mileage=$5, fuel=$6, transmission=$7,
                body_type=$8, color=$9, city=$10, description=$11, updated_at=now() WHERE id=$12`,
        [data.brand, data.model, data.year, data.price, data.mileage, data.fuel, data.transmission,
         data.body_type, data.color || null, data.city, data.description, id]
      );

      let removedUrls = [];
      if (removeIds.length) {
        const del = await client.query(
          'DELETE FROM car_images WHERE car_id = $1 AND id = ANY($2::int[]) RETURNING url',
          [id, removeIds]
        );
        removedUrls = del.rows.map((r) => r.url);
      }

      const count = await client.query('SELECT COUNT(*)::int AS n, COALESCE(MAX(position), -1) AS maxpos FROM car_images WHERE car_id = $1', [id]);
      if (count.rows[0].n + newUrls.length > MAX_IMAGES) {
        throw new AppError(400, `Не более ${MAX_IMAGES} фотографий на объявление`);
      }
      for (let i = 0; i < newUrls.length; i++) {
        await client.query('INSERT INTO car_images (car_id, url, position) VALUES ($1,$2,$3)',
          [id, newUrls[i], count.rows[0].maxpos + 1 + i]);
      }

      await client.query('COMMIT');
      removeFiles(removedUrls);
      invalidate('cars:');
      res.json({ id });
    } catch (e) {
      await client.query('ROLLBACK').catch(() => {});
      removeFiles(newUrls);
      throw e;
    } finally {
      client.release();
    }
  })
);

// ---------- Удаление ----------
router.delete(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const id = toInt(req.params.id);
    const found = await db.query('SELECT user_id FROM cars WHERE id = $1', [id]);
    if (!found.rows[0]) throw new AppError(404, 'Объявление не найдено');
    if (found.rows[0].user_id !== req.user.id) throw new AppError(403, 'Можно удалять только свои объявления');

    const images = await db.query('SELECT url FROM car_images WHERE car_id = $1', [id]);
    await db.query('DELETE FROM cars WHERE id = $1', [id]); // фото и комментарии удалятся каскадом
    removeFiles(images.rows.map((r) => r.url));
    invalidate('cars:');
    res.json({ message: 'Объявление удалено' });
  })
);

module.exports = router;