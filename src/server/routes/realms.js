'use strict';

const express = require('express');
const router = express.Router();

const realmsController = require('../controllers/realms');

router.get('/', realmsController.list);
router.get('/{realmId}', realmsController.get);
router.patch('/{realmId}', realmsController.update);

module.exports = router;
