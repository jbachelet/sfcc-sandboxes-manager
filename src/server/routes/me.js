'use strict';

const express = require('express');
const router = express.Router();

const meController = require('../controllers/me');

router.get('/', meController.get);

module.exports = router;
