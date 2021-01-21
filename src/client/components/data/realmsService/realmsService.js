'use strict';

import { httpGet } from 'data/apiService';

const URLS = {
    getRealms: '/realms?sortBy=id',
    getRealm: '/realms/{0}'
};

export const getRealms = async () => {
    const response = await httpGet(URLS.getRealms);
    return response;
};
