'use strict';

const axios = require('axios');
const jsonwebtoken = require('jsonwebtoken');
const querystring = require('querystring');

const config = require('../../config');

const HOST =
    process.env.OAUTH_REDIRECT_HOST || process.env.HOST || config.defaults.host;
const PORT = process.env.PORT || config.defaults.port;
const ACCOUNT_MANAGER_HOST =
    process.env.ACCOUNT_MANAGER_HOST || 'account.demandware.com';
const ACCOUNT_MANAGER_AUTH_PATH = '/dwsso/oauth2/authorize';
const ACCOUNT_MANAGER_TOKEN_PATH = '/dw/oauth2/access_token';
const ACCOUNT_MANAGER_URL = `https://${ACCOUNT_MANAGER_HOST}${ACCOUNT_MANAGER_AUTH_PATH}`;
const OAUTH_REDIRECT_PATH = '/auth/login_reentry';
const OAUTH_REDIRECT_URL = `http${HOST === 'localhost' ? '' : 's'}://${HOST}${
    PORT !== '80' ? `:${PORT}` : ''
}${OAUTH_REDIRECT_PATH}`;
const GRANT = {
    grant: 'authorization_code',
    response_type: 'code',
    redirect_uri: OAUTH_REDIRECT_URL
};
// https://account.demandware.com/dwsso/oauth2/authorize?client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&redirect_uri=https://sfcc-sandboxes-manager.herokuapp.com/auth/login_reentry&response_type=token
const AUTHENTICATION_URL = `${ACCOUNT_MANAGER_URL}?client_id={0}&redirect_uri=${GRANT.redirect_uri}&response_type=${GRANT.response_type}`;

exports.details = (req, res) => {
    res.json({
        authenticated: req.session.accessToken !== undefined
    });
};

exports.getOauth = (req, res) => {
    const clientId = req.body.client_id;
    const clientSecret = req.body.client_secret;

    if (!clientId || !clientSecret) {
        res.send({
            error: true
        });
        return;
    }

    req.session.clientId = clientId;
    req.session.clientSecret = clientSecret;

    res.send({
        error: false,
        oauthURL: AUTHENTICATION_URL.replace('{0}', clientId)
    });
};

exports.login_reentry = async (req, res) => {
    const code = req.query.code;

    // Authorization flow - Code returned by AM
    if (!code) {
        console.log(
            'Calling the endpoint without any code in query string, abort...'
        );
        res.send({
            error: true
        });
        return;
    }

    const clientId = req.session.clientId;
    const clientSecret = req.session.clientSecret;
    const grantPayload = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: OAUTH_REDIRECT_URL
    };

    const responseData = await obtainToken(
        ACCOUNT_MANAGER_HOST,
        clientId,
        clientSecret,
        grantPayload
    );
    if (!responseData) {
        console.error('Failed to retrieve the access token.');
        res.send('Failed to authenticate, please verify your configuration.');
        return;
    }
    req.session.accessToken = responseData.access_token;
    req.session.refreshToken = responseData.refresh_token;
    if (responseData.id_token) {
        const user = extractUserFromIDToken(responseData.id_token);
        req.session.userId = user.sub;
    }

    res.send(getOAuthSuccessHTML(res.locals.cspNonce));
};

exports.logout = (req, res) => {
    // Clear the access token
    req.session.accessToken = undefined;
    // Clear the user token
    req.session.userToken = undefined;
    // Clear the client details
    req.session.clientId = undefined;
    req.session.clientSecret = undefined;

    res.json({
        authenticated: false
    });
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

/**
 * Obtain an access token using with the specified grant type from the access token endpoint
 * of the AM. If grantType is not provided or null grant_type=client_credentials is being used as default
 * grant payload.
 *
 * @param {String} accountManagerHost Account Manager Host
 * @param {String} basicAuthUser User name used for basic auth
 * @param {String} basicAuthPassword Password used for basic auth
 * @param {Object} grantPayload the grant payload to sent, by default { grant_type : 'client_credentials' } is used
 *
 * @return {Promise}
 */
async function obtainToken(
    accountManagerHost,
    basicAuthUser,
    basicAuthPassword,
    grantPayload
) {
    // allow basic auth only, if both user and password are passed
    if (!basicAuthUser || !basicAuthPassword) {
        basicAuthUser = undefined;
        basicAuthPassword = undefined;
    }

    // build the request options
    const options = getOptions(
        accountManagerHost,
        ACCOUNT_MANAGER_TOKEN_PATH,
        basicAuthUser,
        basicAuthPassword
    );
    // the grant type as form data
    if (grantPayload) {
        options.data = querystring.stringify(grantPayload);
    }

    // just do the request and pass the callback
    try {
        const response = await axios(options);
        if (!response.statusText === 'OK' || response.status !== 200) {
            console.error(`Failed to obtain a token: ${response.data}`);
        }

        return response.data;
    } catch (e) {
        //console.error(e)
        return undefined;
    }
}

/**
 * Contructs the http request options for request at the authorization server and ensure shared request
 * headers across requests.
 *
 * @param {String} host
 * @param {String} path
 * @param {String} basicAuthUser
 * @param {String} basicAuthPassword
 *
 * @return {Object} the request options
 */
function getOptions(host, path, basicAuthUser, basicAuthPassword) {
    let opts = {
        url: 'https://' + host + path,
        method: 'post',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    };
    // append basic auth, if either user or password are passed
    if (basicAuthUser || basicAuthPassword) {
        // apply URI component encoding to secret
        opts.auth = {
            username: basicAuthUser,
            password: encodeURIComponent(basicAuthPassword)
        };
    }
    return opts;
}

function getOAuthSuccessHTML(nonce) {
    return `
        <!doctype html>
        <html lang="en">
        <body>
        </body>
        <script nonce="${nonce}">
            function process () {
                window.opener.location.reload()
                // Close this window after a few time, to let the time to the parent window to refresh
                setTimeout(() => window.close(), 500)
            }

            process()
        </script>
        </html>
    `;
}
