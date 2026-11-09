const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const db = require('./db');
const routes = require('./routes');
const { asyncHandler } = require('./utils/errors');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();


app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); 
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Слишком много запросов, попробуйте позже' },
  })
);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get(
  '/api/health',
  asyncHandler(async (req, res) => {
    const { rows } = await db.query('SELECT now() AS time');
    res.json({ status: 'ok', project: 'AvtoBazar', dbTime: rows[0].time });
  })
);


app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;