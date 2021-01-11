'use strict';

export const get = async (url) => {
    const response = await fetch(url);
    const json = await response.json();
    if (!response.ok || response.error === true) {
        console.log(`Error: ${response.status} - ${json}`);
    }

    return json;
};

export const post = async (url, data) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const json = await response.json();
    if (!response.ok || response.error === true) {
        console.log(`Error: ${response.status} - ${json}`);
    }

    return json;
};