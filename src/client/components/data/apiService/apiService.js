'use strict';

const performCall = async (url, method, data) => {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    const response = await fetch(url, options);
    const json = await response.json();
    if (!response.ok || response.error === true) {
        console.log(`Error: ${response.status} - ${json}`);
    }

    return json;
};

export const httpGet = async (url) => {
    const json = await performCall(url, 'GET');
    return json;
};

export const httpPost = async (url, data) => {
    const json = await performCall(url, 'POST', data);
    return json;
};

export const httpDelete = async (url) => {
    const json = await performCall(url, 'DELETE');
    return json;
};
