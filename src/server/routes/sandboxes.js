'use strict';

const express = require('express');
const router = express.Router();

const sandboxesController = require('../controllers/sandboxes');

router.get('/', sandboxesController.list);
router.post('/', sandboxesController.create);
router.get('/:sandboxId', sandboxesController.get);
router.patch('/:sandboxId', sandboxesController.update);
router.delete('/:sandboxId', sandboxesController.delete);
router.get('/:sandboxId/usage', sandboxesController.usage);
router.get('/:sandboxId/settings', sandboxesController.settings);
router.get('/:sandboxId/operations', sandboxesController.getOperations);
router.post('/:sandboxId/operations', sandboxesController.runOperation);
router.get(
    '/:sandboxId/operations/{operationId}',
    sandboxesController.getOperation
);

module.exports = router;
