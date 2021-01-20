'use strict';

import { get } from 'data/apiService';

const URLS = {
    getRealms: '/realms?sortBy=id',
    getRealm: '/realms/{0}'
};

export const getRealms = async () => {
    const response = await get(URLS.getRealms);
    return response;
};
