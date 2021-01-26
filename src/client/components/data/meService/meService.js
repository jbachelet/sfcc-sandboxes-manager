'use strict';

import { httpGet } from 'data/apiService';

const URLS = {
    getMe: '/me'
};

export const getMe = async () => {
    const response = await httpGet(URLS.getMe);
    return response;
};
