'use strict';

const ocapi = require('../ocapi/helper');
const config = require('../../config');

exports.get = async (req, res) => {
    const result = await ocapi.call(
        req,
        'get',
        `${config.ocapi.SANDBOXES_ENDPOINTS.API_BASE}/me`
    );

    res.json(ocapi.prepareResponse(result));
};
