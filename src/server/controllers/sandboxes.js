'use strict';

const ocapi = require('../ocapi/helper');
const config = require('../../config');

exports.list = async (req, res) => {
    const result = await ocapi.call(
        req,
        'get',
        config.ocapi.SANDBOXES_ENDPOINTS.API_SANDBOXES +
            '?include_deleted=' +
            (req.body?.includeDeleted || false)
    );
    const sortBy = req.body?.sortBy;

    if (result?.data) {
        if (sortBy) {
            res.json(ocapi.sortRecords(result.data, sortBy));
            return;
        }

        res.json({
            error: false,
            data: result.data
        });
        return;
    }

    res.json({
        error: true,
        data: []
    });
};
exports.create = (req, res) => res.send('TODO');
exports.get = (req, res) => res.send('TODO');
exports.update = (req, res) => res.send('TODO');
exports.delete = (req, res) => res.send('TODO');
exports.listOperations = (req, res) => res.send('TODO');
exports.runOperation = (req, res) => res.send('TODO');
exports.getOperation = (req, res) => res.send('TODO');
