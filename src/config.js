'use strict';

const config = {
    defaults: {
        host: 'localhost',
        port: 80,
        ttl: 24,
        ocapiSettings: [
            {
                client_id: '<your client id>',
                resources: [
                    {
                        resource_id: '/**',
                        methods: ['get', 'post', 'put', 'patch', 'delete'],
                        read_attributes: '(**)',
                        write_attributes: ''
                    }
                ]
            }
        ],
        webDavSettings: [
            {
                client_id: '<your client id>',
                permissions: [
                    { path: '/cartridges', operations: ['read_write'] },
                    { path: '/impex', operations: ['read_write'] }
                ]
            }
        ]
    },
    distDir: './dist',
    sessionCookie: {
        httpOnly: true,
        secure: true,
        sameSite: true,
        maxAge: 86400 // Time is in miliseconds
    }
};

/**
 * OCAPI URLs, hosts and specific setup
 */
const HOST =
    process.env.OAUTH_REDIRECT_HOST || process.env.HOST || config.defaults.host;
const ACCOUNT_MANAGER_HOST =
    process.env.ACCOUNT_MANAGER_HOST || 'account.demandware.com';
const ACCOUNT_MANAGER_AUTH_PATH = '/dwsso/oauth2/authorize';
const ACCOUNT_MANAGER_URL = `https://${ACCOUNT_MANAGER_HOST}${ACCOUNT_MANAGER_AUTH_PATH}`;
const OAUTH_REDIRECT_PATH = '/auth/login_reentry';
const OAUTH_REDIRECT_URL = `http${
    HOST === 'localhost' ? '' : 's'
}://${HOST}${OAUTH_REDIRECT_PATH}`;
const GRANT = {
    grant: 'authorization_code',
    response_type: 'code',
    redirect_uri: OAUTH_REDIRECT_URL
};
// https://account.demandware.com/dwsso/oauth2/authorize?client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&redirect_uri=https://sfcc-sandboxes-manager.herokuapp.com/auth/login_reentry&response_type=token
const AUTHENTICATION_URL = `${ACCOUNT_MANAGER_URL}?client_id={0}&redirect_uri=${GRANT.redirect_uri}&response_type=${GRANT.response_type}`;

const API_HOST = 'admin.us01.dx.commercecloud.salesforce.com';
const API_BASE = `${API_HOST}/api/${process.env.API_VERSION || 'v1'}`;
const API_SANDBOXES = API_BASE + '/sandboxes';
const SANDBOXES_ENDPOINTS = {
    API_BASE,
    API_SANDBOXES
};

config.ocapi = {
    GRANT,
    ACCOUNT_MANAGER_HOST,
    AUTHENTICATION_URL,
    OAUTH_REDIRECT_URL,
    SANDBOXES_ENDPOINTS
};

module.exports = config;
