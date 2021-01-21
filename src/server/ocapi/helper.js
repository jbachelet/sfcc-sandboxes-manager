'use strict';

const axios = require('axios');
const auth = require('./auth');
const config = require('../../config');

/**
 * Contructs the http request options for request at the authorization server and ensure shared request
 * headers across requests.
 *
 * @param {String} host
 * @param {String} path
 * @param {String} basicAuthUser
 * @param {String} basicAuthPassword
 * @param {Boolean} isJson
 *
 * @return {Object} the request options
 */
module.exports.getOptions = (method, host, path, isJson, authOption) => {
    let opts = {
        url: 'https://' + host + (path || ''),
        method: method,
        headers: {
            'content-type': isJson
                ? 'application/json'
                : 'application/x-www-form-urlencoded'
        }
    };

    // append auth
    if (authOption && authOption.username && authOption.password) {
        // apply URI component encoding to secret
        opts.auth = authOption;
    } else if (authOption && authOption.bearer) {
        opts.headers.Authorization = `Bearer ${authOption.bearer}`;
    }

    return opts;
};

module.exports.getAccessToken = (req) => req.session.accessToken;
module.exports.getRefreshToken = (req) => req.session.refreshToken;
module.exports.getClientId = (req) => {
    if (!req.session.clientCredentials) {
        return undefined;
    }
    const credentials = Buffer.from(req.session.clientCredentials, 'base64')
        .toString()
        .split(':');
    return credentials ? credentials[0] : undefined;
};
module.exports.getClientSecret = (req) => {
    if (!req.session.clientCredentials) {
        return undefined;
    }
    const credentials = Buffer.from(req.session.clientCredentials, 'base64')
        .toString()
        .split(':');
    return credentials ? credentials[1] : undefined;
};

module.exports.ensureValidResponse = (req, err, res) => {
    // token invalid
    if (
        res &&
        res.body &&
        ((res.body.fault &&
            res.body.fault.type === 'InvalidAccessTokenException') ||
            (res.body.error === 'invalid_token' &&
                res.body.error_description === module.exports.getToken(req)))
    ) {
        throw new Error(
            'Authorization missing or invalid. Please (re-)authenticate first by' +
                ' running ´sfcc-ci auth:login´ or ´sfcc-ci client:auth´ and make sure, your client has access to ' +
                'the instance.'
        );
    } else if (
        res &&
        res.body &&
        res.body.fault &&
        res.body.fault.type === 'InvalidAuthorizationHeaderException'
    ) {
        // invalid auth header
        throw new Error(
            'Authorization missing or invalid. Please authenticate first by running ' +
                '´sfcc-ci auth:login´ or ´sfcc-ci client:auth´.'
        );
    } else if (res && res.statusCode === 401) {
        // authentication failed in WebDAV request
        throw new Error(
            'Authentication failed. Please (re-)authenticate first by running ' +
                '´sfcc-ci auth:login´ or ´sfcc-ci client:auth´. No token auto-renewal is performed. If the problem ' +
                'still occurs please check the WebDAV Client Permissions on the instance and ensure your client ID ' +
                'has been granted access to required WebDAV resources.'
        );
    } else if (err && !res) {
        // any error, without a proper (JSON) response (body)
        // handle special error cases
        if (err.code === 'EPROTO') {
            console.error('Network or certificate error');
        } else if (err.message === 'wrong tag') {
            console.error('Certificate error');
        } else if (err.code === 'ENOTFOUND') {
            console.error(
                'Cannot resolve host name. Ensure you use a proper instance host name or an alias from ' +
                    'the instance configuration. Detailed error: %s',
                err.message
            );
        }
        console.debug(
            'Error code: %s, message: %s, stack: %s',
            err.code,
            err.message,
            err.stack
        );
        throw new Error(
            'An error occured. Try running the command again with -D,--debug flag.'
        );
    }
};

module.exports.sortRecords = (list, sortby) => {
    if (!list) {
        return undefined;
    }

    list.sort((a, b) => {
        if (
            typeof a[sortby] === 'undefined' &&
            typeof b[sortby] === 'undefined'
        ) {
            return 0;
        }
        if (typeof a[sortby] === 'undefined' || a[sortby] < b[sortby]) {
            return -1;
        }
        if (typeof b[sortby] === 'undefined' || a[sortby] > b[sortby]) {
            return 1;
        }
        return 0;
    });
    return list;
};

/**
 * Call `url` using the current access token. If this fails, renew the token if
 * possible and retry the request.
 *
 * @param {String} method HTTP request method to use on `url`
 * @param {String} url full URL to call
 */
module.exports.call = async (req, method, url, data, nbRetry = 0) => {
    const accessToken = module.exports.getAccessToken(req);
    const options = module.exports.getOptions(method, url, undefined, true, {
        bearer: accessToken
    });
    if (data) {
        options.data = data;
    }

    try {
        const response = await axios(options);
        // Ensure the response is valid
        module.exports.ensureValidResponse(req, undefined, response.data);
        return response.data;
    } catch (err) {
        if (err.response) {
            // Request made and server responded
            console.log(
                `Response status: ${err.response.status}`,
                err.response.data
            );
        } else if (err.request) {
            // The request was made but no response was received
            console.log(err.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', err.message);
        }

        // If the status is something else than 401
        // Abort directly
        // Only the 401 status means we might need to re-authenticate
        if (err.response.status !== 401) {
            return undefined;
        }

        // Only retry once
        if (nbRetry > 0) {
            return undefined;
        }

        // If failing, retry just one time thanks to the refresh token, if any
        const refreshToken = module.exports.getRefreshToken(req);
        if (!refreshToken) {
            return undefined;
        }

        // Try to re-authenticate based on the refresh token if any exist
        const authResponse = await auth.obtainToken(
            req,
            config.ocapi.ACCOUNT_MANAGER_HOST,
            module.exports.getClientId(req),
            module.exports.getClientSecret(req),
            { grant_type: 'refresh_token', refresh_token: refreshToken }
        );
        // If the authentication succeed, then re-try the API call that we were suppose to perform
        if (authResponse) {
            return module.exports.call(req, method, url, data, 1);
        }

        return undefined;
    }
};
