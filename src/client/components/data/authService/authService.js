'use strict';

const URLS = {
    getDetails: '/auth/details',
    logout: '/auth/logout'
};

export const getDetails = async () => {
    const response = await fetch(URLS.getDetails);
    const json = await response.json();
    if (!response.ok) {
        console.log(`Error: ${response.status} - ${json}`);
        return json;
    }

    return json;
};

export const logout = async () => {
    const response = await fetch(URLS.logout);
    const json = await response.json();
    if (!response.ok) {
        console.log(`Error: ${response.status} - ${json}`);
        return json;
    }

    return json;
};
