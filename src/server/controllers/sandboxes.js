'use strict';

const ocapi = require('../ocapi/helper');
const config = require('../../config');

exports.list = async (req, res) => {
    const result = await ocapi.call(
        req,
        'get',
        config.ocapi.SANDBOXES_ENDPOINTS.API_SANDBOXES +
            '?include_deleted=' +
            (req.query.includeDeleted || false)
    );
    const sortBy = req.query.sortBy;
    const realmId = req.query.realmId;

    if (result.data) {
        let sandboxes = result.data;
        if (sortBy) {
            sandboxes = ocapi.sortRecords(sandboxes, sortBy);
        }

        if (realmId) {
            sandboxes = sandboxes.filter(
                (sandbox) => sandbox.realm === realmId
            );
        }

        res.json({
            error: false,
            data: sandboxes
        });
        return;
    }

    res.json({
        error: true,
        data: []
    });
};
exports.create = (req, res) => res.send('TODO');
exports.get = async (req, res) => {
    const sandboxId = req.params.sandboxId;
    const storage = req.query.storage || false;
    if (!sandboxId) {
        res.json({
            error: true
        });
        return;
    }

    const result = await ocapi.call(
        req,
        'get',
        `${config.ocapi.SANDBOXES_ENDPOINTS.API_SANDBOXES}/${sandboxId}`
    );

    if (result.data) {
        if (storage) {
            const storageResult = await ocapi.call(
                req,
                'get',
                `${config.ocapi.SANDBOXES_ENDPOINTS.API_SANDBOXES}/${sandboxId}/storage`
            );

            if (storageResult.data) {
                result.data.storage = storageResult.data;
            }
        }

        res.json({
            error: false,
            data: result.data
        });
        return;
    }

    res.json({
        error: true
    });
};
exports.update = (req, res) => res.send('TODO');
exports.delete = (req, res) => res.send('TODO');
exports.usage = async (req, res) => {
    const sandboxId = req.params.sandboxId;
    const from = req.query.from;
    const to = req.query.to;
    if (!sandboxId) {
        res.json({
            error: true
        });
        return;
    }

    let queryString = '';
    if (from && to) {
        queryString = `?from=${from}&to=${to}`;
    }

    const result = await ocapi.call(
        req,
        'get',
        `${config.ocapi.SANDBOXES_ENDPOINTS.API_SANDBOXES}/${sandboxId}/usage${queryString}`
    );

    if (result.data) {
        res.json({
            error: false,
            data: result.data
        });
        return;
    }

    res.json({
        error: true
    });
};
exports.settings = async (req, res) => {
    const sandboxId = req.params.sandboxId;
    if (!sandboxId) {
        res.json({
            error: true
        });
        return;
    }

    const result = await ocapi.call(
        req,
        'get',
        `${config.ocapi.SANDBOXES_ENDPOINTS.API_SANDBOXES}/${sandboxId}/settings`
    );

    if (result.data) {
        res.json({
            error: false,
            data: result.data
        });
        return;
    }

    res.json({
        error: true
    });
};
exports.getOperations = async (req, res) => {
    const sandboxId = req.params.sandboxId;
    const operation = req.query.operation;
    const sortBy = req.query.sortBy || 'created';
    const sortOrder = req.query.sortOrder || 'desc';

    if (!sandboxId) {
        res.json({
            error: true
        });
        return;
    }

    let queryString = '?';
    if (operation) {
        queryString += `operation=${operation}`;
    }
    if (sortBy) {
        queryString += `${
            queryString.length === 1 ? '' : '&'
        }sort_by=${sortBy}`;
    }
    if (sortOrder) {
        queryString += `${
            queryString.length === 1 ? '' : '&'
        }sort_order=${sortOrder}`;
    }

    const result = await ocapi.call(
        req,
        'get',
        `${config.ocapi.SANDBOXES_ENDPOINTS.API_SANDBOXES}/${sandboxId}/operations${queryString}`
    );

    if (result.data) {
        res.json({
            error: false,
            data: result.data
        });
        return;
    }

    res.json({
        error: true
    });
};
exports.runOperation = async (req, res) => {
    const sandboxId = req.params.sandboxId;
    const operation = req.body.operation;
    if (!sandboxId || !operation) {
        res.json({
            error: true
        });
        return;
    }

    const result = await ocapi.call(
        req,
        'post',
        `${config.ocapi.SANDBOXES_ENDPOINTS.API_SANDBOXES}/${sandboxId}/operations`,
        {
            operation
        }
    );

    if (result.data) {
        res.json({
            error: false,
            data: result.data
        });
        return;
    }

    res.json({
        error: true
    });
};
exports.getOperation = (req, res) => res.send('TODO');
