'use strict';

const ocapi = require('../ocapi/helper');

exports.get = async (req, res) => {
    const result = await ocapi.call(req, 'get', '/me');

    res.json(ocapi.prepareResponse(result));
};
