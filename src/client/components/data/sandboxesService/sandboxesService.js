'use strict';

import { httpGet, httpPost, httpDelete } from 'data/apiService';

const URLS = {
    getSandboxes: '/sandboxes?sortBy=instance&realmId={0}',
    getSandbox: '/sandboxes/{0}',
    getUsage: '/sandboxes/{0}/usage',
    getSettings: '/sandboxes/{0}/settings',
    getOperations:
        '/sandboxes/{0}/operations?sortBy=created&sortOrder=desc&operation={1}',
    runOperation: '/sandboxes/{0}/operations',
    deleteSandbox: '/sandboxes/{0}'
};

export const getSandboxes = async (realmId) => {
    const response = await httpGet(
        `${URLS.getSandboxes.replace('{0}', realmId)}`
    );
    return response;
};

export const getSandbox = async (sandboxId, withStorage = false) => {
    let url = `${URLS.getSandbox.replace('{0}', sandboxId)}`;
    if (withStorage) {
        url += '?storage=true';
    }
    const response = await httpGet(url);
    return response;
};

export const getUsage = async (sandboxId, from, to) => {
    let url = `${URLS.getUsage.replace('{0}', sandboxId)}`;
    if (from && to) {
        url += `?from=${from}&to=${to}`;
    }
    const response = await httpGet(url);
    return response;
};

export const getSettings = async (sandboxId) => {
    const response = await httpGet(
        `${URLS.getSettings.replace('{0}', sandboxId)}`
    );
    return response;
};

export const getOperations = async (sandboxId, operation) => {
    operation = operation || '';
    const response = await httpGet(
        `${URLS.getOperations
            .replace('{0}', sandboxId)
            .replace('{1}', operation)}`
    );
    return response;
};

export const runOperation = async (sandboxId, operation) => {
    const response = await httpPost(
        `${URLS.runOperation.replace('{0}', sandboxId)}`,
        {
            operation
        }
    );
    return response;
};

export const deleteSandbox = async (sandboxId) => {
    const response = await httpDelete(
        `${URLS.deleteSandbox.replace('{0}', sandboxId)}`
    );
    return response;
};
