'use strict';

import { get } from 'data/apiService';

const URLS = {
    getSandboxes: '/sandboxes',
    getSandbox: '/sandboxes/'
};

export const getSandboxes = async () => {
    const response = await get(URLS.getSandboxes);
    return response;
};
