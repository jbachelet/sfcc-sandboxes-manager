'use strict';

import { httpGet, httpPost } from 'data/apiService';

const URLS = {
    getDetails: '/auth/details',
    getOAuth: '/auth/get_oauth',
    logout: '/auth/logout'
};

export const getDetails = async () => {
    const response = await httpGet(URLS.getDetails);
    return response;
};

export const logout = async () => {
    const response = await httpPost(URLS.logout);
    return response;
};

export const getOAuth = async (clientId, clientSecret) => {
    const response = await httpPost(URLS.getOAuth, {
        client_id: clientId,
        client_secret: clientSecret
    });
    return response.oauthURL;
};
