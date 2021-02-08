'use strict';

const auth = require('../ocapi/auth');
const ocapiHelper = require('../ocapi/helper');
const config = require('../../config');

exports.details = (req, res) => {
    res.json({
        authenticated: req.session.accessToken !== undefined,
        host: process.env.HOST || config.defaults.host
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

    // Save in session the credentials
    req.session.clientCredentials = Buffer.from(
        clientId + ':' + clientSecret
    ).toString('base64');

    res.send({
        error: false,
        oauthURL: config.ocapi.AUTHENTICATION_URL.replace('{0}', clientId)
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
            error: true,
            message:
                'Calling the endpoint without any code in query string, abort...'
        });
        return;
    }

    const responseData = await auth.obtainToken(
        req,
        config.ocapi.ACCOUNT_MANAGER_HOST,
        ocapiHelper.getClientId(req),
        ocapiHelper.getClientSecret(req),
        {
            grant_type: 'authorization_code',
            code,
            redirect_uri: config.ocapi.OAUTH_REDIRECT_URL
        }
    );

    if (!responseData.success) {
        console.error('Failed to retrieve the access token.');
        res.send(responseData.data);
        return;
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
