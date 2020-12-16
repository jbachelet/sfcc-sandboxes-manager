'use strict';

const jsonwebtoken = require('jsonwebtoken');

const ACCOUNT_MANAGER_HOST =
    process.env.ACCOUNT_MANAGER_HOST || 'account.demandware.com';
const ACCOUNT_MANAGER_AUTH_PATH = '/dwsso/oauth2/authorize';
const ACCOUNT_MANAGER_URL = `https://${ACCOUNT_MANAGER_HOST}${ACCOUNT_MANAGER_AUTH_PATH}`;
const OAUTH_REDIRECT_PATH = '/auth/login_reentry';
const OAUTH_REDIRECT_URL = `https://${
    (process.env.OAUTH_REDIRECT_HOST || process.env.HOST) &&
    (process.env.PORT || 3001)
}${OAUTH_REDIRECT_PATH}`;
const GRANTS = {
    IMPLICIT: {
        grant: 'implicit',
        response_type: 'token',
        redirect_uri: OAUTH_REDIRECT_URL
    },
    AUTHORIZATION_CODE: {
        grant: 'authorization_code',
        response_type: 'code',
        redirect_uri: OAUTH_REDIRECT_URL
    }
};
const NOT_AUTHENTICATED_RESPONSE = {
    authenticated: false,
    accountManagerURL: ACCOUNT_MANAGER_URL,
    // https://account.demandware.com/dwsso/oauth2/authorize?client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&redirect_uri=https://sfcc-sandboxes-manager.herokuapp.com/auth/login_reentry&response_type=token
    authenticationURL: `${ACCOUNT_MANAGER_URL}?client_id={0}&redirect_uri=${GRANTS.IMPLICIT.redirect_uri}&response_type=token`,
    grant: GRANTS.IMPLICIT.grant
};

exports.details = (req, res) => {
    // If the user is already authenticated
    if (req.session.accessToken) {
        res.json({
            authenticated: true
        });
        return;
    }

    res.json(NOT_AUTHENTICATED_RESPONSE);
};

exports.login_reentry = (req, res) => {
    const error = req.query.error;
    const errorDescription = req.query.error_description;
    const accessToken = req.query.access_token;
    const idToken = req.query.id_token;

    // Error while authenticating the user
    if (error && !accessToken) {
        console.error(
            `Error while authenticating the user: ${error}. Description: ${errorDescription}`
        );
        // TODO handle next
    }

    req.session.accessToken = accessToken;
    if (idToken) {
        let user = extractUserFromIDToken(idToken);
        req.session.userToken = user.sub;
    }
    // TODO handle next
    res.send('TODO');
};
exports.logout = (req, res) => {
    // Clear the access token
    req.session.accessToken = undefined;
    // Clear the user token
    req.session.userToken = undefined;

    res.json(NOT_AUTHENTICATED_RESPONSE);
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
