const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/cars', require('./cars'));
router.use('/', require('./comments'));
router.use('/meta', require('./meta'));

module.exports = router;