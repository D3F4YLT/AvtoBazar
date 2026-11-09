const express = require('express');
const catalog = require('../utils/catalog');

const router = express.Router();

// Справочники для форм и фильтров
router.get('/', (req, res) => {
  res.set('Cache-Control', 'public, max-age=600');
  res.json(catalog);
});

module.exports = router;