'use strict';

/**
 * Open the application toast
 *
 * @param {LightningElement} component The component instance that triggers the toast
 * @param {String} title The toast title
 * @param {String} type The toast type (success/warning/error)
 */
const renderToast = (component, title, type = 'success') => {
    // Display toast for error
    component.dispatchEvent(
        new CustomEvent('opentoast', {
            bubbles: true,
            composed: true,
            detail: {
                title,
                type
            }
        })
    );
};

/**
 * Handle the server response in case of failure
 *
 * @param {LightningElement} component The component instance that triggers the toast
 * @param {Object} result The API result
 *
 * @returns {Boolean} True if the response can be used, false otherwise
 */
export const handleResponse = (component, result) => {
    if (result.error && result.status === 401) {
        component.dispatchEvent(
            new CustomEvent('refreshauth', {
                bubbles: true,
                composed: true
            })
        );
        return false;
    }

    if (!result.data) {
        renderToast(
            component,
            'The request failed. Please try again or contact the administrator.',
            'error'
        );
        return false;
    }

    return true;
};

export const displayToast = renderToast;
