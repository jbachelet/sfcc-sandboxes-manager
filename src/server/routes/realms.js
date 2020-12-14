'use strict';

const express = require('express');
const router = express.Router();

const realmsController = require('../controllers/realms');

router.get('/{realmId}', realmsController.get);
router.get('/{realmId}/configuration', realmsController.getConfiguration);
router.patch('/{realmId}/configuration', realmsController.updateConfiguration);
router.get('/{realmId}/usage', realmsController.getUsage);

module.exports = router;
