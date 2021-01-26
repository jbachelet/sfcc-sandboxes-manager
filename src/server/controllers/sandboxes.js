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

    // Return an error if the HTTP Status code is greater than 210
    // Or if no data is sent
    if (result.status > 210 || !result?.data?.data) {
        res.json({
            error: true,
            status: result.status
        });
        return;
    }

    if (result?.data) {
        let sandboxes = result?.data?.data;
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

exports.create = async (req, res) => {
    const realmId = req.body.realmId;
    if (!realmId) {
        res.json({
            error: true
        });
        return;
    }

    const ttl = parseInt(req.body.ttl, 10) || config.defaults.ttl;
    let ocapiSettings = req.body.ocapiSettings || config.defaults.ocapiSettings;
    let webdavSettings =
        req.body.webdavSettings || config.defaults.webdavSettings;
    const clientId = ocapi.getClientId(req);

    // Replace the client ID by the one used here if needed
    ocapiSettings = ocapiSettings.map((setting) => {
        setting.client_id = setting.client_id.replace(
            '<your client id>',
            clientId
        );
        return setting;
    });
    webdavSettings = webdavSettings.map((setting) => {
        setting.client_id = setting.client_id.replace(
            '<your client id>',
            clientId
        );
        return setting;
    });

    const result = await ocapi.call(
        req,
        'post',
        config.ocapi.SANDBOXES_ENDPOINTS.API_SANDBOXES,
        {
            realm: realmId,
            ttl: ttl,
            settings: {
                ocapi: ocapiSettings,
                webdav: webdavSettings
            }
        }
    );

    res.json(ocapi.prepareResponse(result));
};
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

    // Return an error if the HTTP Status code is greater than 210
    // Or if no data is sent
    if (result.status > 210 || !result?.data?.data) {
        res.json({
            error: true,
            status: result.status
        });
        return;
    }

    if (result?.data) {
        if (storage) {
            const storageResult = await ocapi.call(
                req,
                'get',
                `${config.ocapi.SANDBOXES_ENDPOINTS.API_SANDBOXES}/${sandboxId}/storage`
            );

            // Return an error if the HTTP Status code is greater than 210
            // Or if no data is sent
            if (result.status > 210 || !result?.data?.data) {
                res.json({
                    error: true,
                    status: result.status
                });
                return;
            }

            if (storageResult?.data?.data) {
                result.data.data.storage = storageResult.data.data;
            }
        }

        res.json({
            error: false,
            data: result?.data?.data
        });
        return;
    }

    res.json({
        error: true,
        status: result.status
    });
};
exports.update = (req, res) => res.send('TODO');
exports.delete = async (req, res) => {
    const sandboxId = req.params.sandboxId;
    if (!sandboxId) {
        res.json({
            error: true
        });
        return;
    }

    const result = await ocapi.call(
        req,
        'delete',
        `${config.ocapi.SANDBOXES_ENDPOINTS.API_SANDBOXES}/${sandboxId}`
    );

    res.json(ocapi.prepareResponse(result));
};
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

    res.json(ocapi.prepareResponse(result));
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

    res.json(ocapi.prepareResponse(result));
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

    res.json(ocapi.prepareResponse(result));
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

    res.json(ocapi.prepareResponse(result));
};
exports.getOperation = (req, res) => res.send('TODO');
