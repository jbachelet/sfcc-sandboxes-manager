'use strict';

const axios = require('axios');
const querystring = require('querystring');
const helper = require('./helper');
const jsonwebtoken = require('jsonwebtoken');

const ACCOUNT_MANAGER_TOKEN_PATH = '/dw/oauth2/access_token';

/**
 * Obtain an access token using with the specified grant type from the access token endpoint
 * of the AM. If grantType is not provided or null grant_type=client_credentials is being used as default
 * grant payload.
 *
 * @param {Object} req ExpressJS Request object
 * @param {String} accountManagerHost Account Manager Host
 * @param {String} basicAuthUser User name used for basic auth
 * @param {String} basicAuthPassword Password used for basic auth
 * @param {Object} grantPayload the grant payload to sent, by default { grant_type : 'client_credentials' } is used
 *
 * @return {Promise}
 */
module.exports.obtainToken = async (
    req,
    accountManagerHost,
    basicAuthUser,
    basicAuthPassword,
    grantPayload
) => {
    // allow basic auth only if both user and password are passed
    if (!basicAuthUser || !basicAuthPassword) {
        basicAuthUser = undefined;
        basicAuthPassword = undefined;
    }

    // build the request options
    const options = helper.getOptions(
        'post',
        accountManagerHost,
        ACCOUNT_MANAGER_TOKEN_PATH,
        false,
        {
            username: basicAuthUser,
            password: encodeURIComponent(basicAuthPassword)
        }
    );
    // the grant type as form data
    if (grantPayload) {
        options.data = querystring.stringify(grantPayload);
    }

    console.log(options);

    try {
        const response = await axios(options);
        if (!response.statusText === 'OK' || response.status !== 200) {
            console.error(`Failed to obtain a token: ${response.data}`);
            return undefined;
        }

        req.session.accessToken = response.data.access_token;
        req.session.refreshToken = response.data.refresh_token;

        if (response.data.id_token) {
            const user = extractUserFromIDToken(response.data.id_token);
            req.session.userId = user.sub;
        }

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

        return undefined;
    }
};

/**
 * Utility function to extract user information from the passed JWT id_token.
 *
 * @param {String} idToken the JWT id_token
 * @return {Object} an object holding properties describing the user, or null
 */
function extractUserFromIDToken(idToken) {
    return jsonwebtoken.decode(idToken);
}
