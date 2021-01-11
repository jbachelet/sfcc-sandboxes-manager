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
    return result?.data;
}

exports.list = async (req, res) => {
    const result = await ocapi.call(
        req,
        'get',
        config.ocapi.SANDBOXES_ENDPOINTS.API_BASE + '/me'
    );
    const sortBy = req.body?.sortBy;

    if (result.data?.realms) {
        if (sortBy) {
            res.json(ocapi.sortRecords(result.data.realms, sortBy));
            return;
        }

        res.json({
            error: false,
            data: result.data.realms
        });
        return;
    }

    res.json({
        error: true,
        data: []
    });
};

exports.get = async (req, res) => {
    const realmId = req.body?.realmId;
    const topic = req.body?.topic;
    const from = req.body?.from || '';
    const to = req.body?.to || '';

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
    const realmId = req.body?.realmId;
    const maxSandboxTTL = req.body?.maxSandboxTTL;
    const defaultSandboxTTL = req.body?.defaultSandboxTTL;
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
