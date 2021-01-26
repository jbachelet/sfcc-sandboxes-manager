'use strict';

import { httpGet, httpPatch } from 'data/apiService';

const URLS = {
    getRealms: '/realms?sortBy=id',
    getRealm: '/realms/{0}',
    updateRealm: '/realms/{0}'
};

export const getRealms = async () => {
    const response = await httpGet(URLS.getRealms);
    return response;
};

export const getRealm = async (realmId) => {
    const response = await httpGet(`${URLS.getRealm.replace('{0}', realmId)}`);
    return response;
};

export const updateRealmConfiguration = async (
    realmId,
    defaultSandboxTTL,
    maxSandboxTTL
) => {
    const response = await httpPatch(
        `${URLS.updateRealm.replace('{0}', realmId)}`,
        {
            defaultSandboxTTL,
            maxSandboxTTL
        }
    );
    return response;
};
