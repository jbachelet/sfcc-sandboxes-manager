'use strict';

const ocapi = require('../ocapi/helper');
const config = require('../../config');

exports.list = async (req, res) => {
    const result = await ocapi.call(
        req,
        'get',
        config.ocapi.SANDBOXES_ENDPOINTS.API_BASE + '/me'
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

    if (result?.data?.data?.realms) {
        let realms = result.data.data.realms;
        realms = realms.map((realm) => ({
            id: realm
        }));

        const sortBy = req.query.sortBy;
        if (sortBy) {
            realms = ocapi.sortRecords(realms, sortBy);
        }

        res.json({
            error: false,
            data: realms
        });
        return;
    }

    res.json({
        error: true,
        data: []
    });
};

exports.get = async (req, res) => {
    const realmId = req.params.realmId;
    const topic = req.query.topic;
    const from = req.query.from || '';
    const to = req.query.to || '';

    if (!realmId) {
        res.json({
            error: true
        });
        return;
    }

    let extension = '?expand=configuration';
    if (topic) {
        extension = '/' + topic;
        // for retrieving usage data, always retrieve full usage
        if (topic === 'usage' && (from || to)) {
            extension += `?from=${from}&to=${to}`;
        }
    }

    const result = await ocapi.call(
        req,
        'get',
        `${config.ocapi.SANDBOXES_ENDPOINTS.API_BASE}/realms/${realmId}${extension}`
    );

    res.json(ocapi.prepareResponse(result));
};

exports.update = async (req, res) => {
    const realmId = req.params.realmId;
    const maxSandboxTTL = req.body.maxSandboxTTL;
    const defaultSandboxTTL = req.body.defaultSandboxTTL;

    if (!realmId || (!maxSandboxTTL && !defaultSandboxTTL)) {
        res.json({
            error: true
        });
        return;
    }

    const data = {
        sandbox: {
            sandboxTTL: {}
        }
    };
    if (maxSandboxTTL) {
        data.sandbox.sandboxTTL.maximum = maxSandboxTTL.toFixed();
    }
    if (defaultSandboxTTL) {
        data.sandbox.sandboxTTL.defaultValue = defaultSandboxTTL.toFixed();
    }

    const result = await ocapi.call(
        req,
        'patch',
        `${config.ocapi.SANDBOXES_ENDPOINTS.API_BASE}/realms/${realmId}/configuration`,
        data
    );

    res.json(ocapi.prepareResponse(result));
};
