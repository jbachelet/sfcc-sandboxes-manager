'use strict';

const ocapi = require('../ocapi/helper');
const config = require('../../config');

/**
 * Get the Realm from the API based on the given {realmId}
 *
 * @param {Object} req The request
 * @param {String} realmId The realm ID
 * @param {String} extension The extension to get with the realm
 */
async function getRealm(req, realmId, extension) {
    if (!realmId) {
        return undefined;
    }

    const result = await ocapi.call(
        req,
        'get',
        `${config.ocapi.SANDBOXES_ENDPOINTS.API_BASE}/realms/${realmId}${extension}`
    );
    return result.data;
}

exports.list = async (req, res) => {
    const result = await ocapi.call(
        req,
        'get',
        config.ocapi.SANDBOXES_ENDPOINTS.API_BASE + '/me'
    );

    if (result?.data?.realms) {
        let realms = result.data.realms;
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
    const realmId = req.query.realmId;
    const topic = req.query.topic;
    const from = req.query.from || '';
    const to = req.query.to || '';

    if (!realmId) {
        res.json({
            error: true
        });
        return;
    }

    let extension = '?expand=configuration,usage';
    if (topic) {
        extension = '/' + topic;
        // for retrieving usage data, always retrieve full usage
        if (topic === 'usage' && (from || to)) {
            extension += `?from=${from}&to=${to}`;
        }
    }

    const realm = getRealm(req, realmId, extension);
    res.json({
        error: typeof realm !== 'undefined',
        data: realm
    });
};

exports.update = async (req, res) => {
    const realmId = req.body.realmId;
    const maxSandboxTTL = req.body.maxSandboxTTL;
    const defaultSandboxTTL = req.body.defaultSandboxTTL;
    const realm = getRealm(req, realmId, '');

    if (!realm) {
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

    res.json({
        error: typeof result.data !== 'undefined',
        data: result.data
    });
};
