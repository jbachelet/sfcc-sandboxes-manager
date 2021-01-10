'use strict';

const URLS = {
    getDetails: '/auth/details',
    getOAuth: '/auth/get_oauth',
    logout: '/auth/logout'
};

export const getDetails = async () => {
    const response = await fetch(URLS.getDetails);
    const json = await response.json();
    if (!response.ok || response.error === true) {
        console.log(`Error: ${response.status} - ${json}`);
    }

    return json;
};

export const logout = async () => {
    const response = await fetch(URLS.logout);
    const json = await response.json();
    if (!response.ok || response.error === true) {
        console.log(`Error: ${response.status} - ${json}`);
    }

    return json;
};

export const getOAuth = async (clientId, clientSecret) => {
    const response = await fetch(URLS.getOAuth, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret
        })
    });
    const json = await response.json();
    if (!response.ok || response.error === true) {
        console.log(`Error: ${response.status} - ${json}`);
    }

    return json.oauthURL;
};
