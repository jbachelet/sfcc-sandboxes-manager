'use strict';

const express = require('express');
const router = express.Router();

const authenticationController = require('../controllers/authentication');

router.get('/details', authenticationController.details);
router.post('/get_oauth', authenticationController.getOauth);
router.get('/login_reentry', authenticationController.login_reentry);
router.get('/logout', authenticationController.logout);

module.exports = router;
