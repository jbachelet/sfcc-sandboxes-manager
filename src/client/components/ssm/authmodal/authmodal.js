import { LightningElement, api } from 'lwc';
import { getOAuth } from 'data/authService';
export default class AuthModal extends LightningElement {
    selectors = {
        modal: '[data-js-modal]',
        background: '[data-js-background]',
        clientIdInput: '[data-js-client-id]',
        clientSecretInput: '[data-js-client-secret]',
        inputCtnr: '.slds-form-element'
    };
    classes = {
        modalOpen: 'slds-fade-in-open',
        backgroundOpen: 'slds-backdrop_open',
        error: 'slds-has-error',
        hide: 'slds-hide'
    };
    cache = {};

    renderedCallback() {
        this.cache.modal = this.template.querySelector(this.selectors.modal);
        this.cache.background = this.template.querySelector(
            this.selectors.background
        );
        this.cache.clientIdInput = this.template.querySelector(
            this.selectors.clientIdInput
        );
        this.cache.clientSecretInput = this.template.querySelector(
            this.selectors.clientSecretInput
        );
    }

    handleClose(e) {
        e.preventDefault();
        this.toggleModal(false);
    }

    handleLogin(e) {
        e.preventDefault();

        let isError = false;
        this.cache.clientIdInput
            .closest(this.selectors.inputCtnr)
            .classList.remove(this.classes.error);
        this.cache.clientSecretInput
            .closest(this.selectors.inputCtnr)
            .classList.remove(this.classes.error);

        if (
            this.cache.clientIdInput.value === undefined ||
            this.cache.clientIdInput.value.length === 0
        ) {
            isError = true;
            this.cache.clientIdInput
                .closest(this.selectors.inputCtnr)
                .classList.add(this.classes.error);
        }

        if (
            this.cache.clientSecretInput.value === undefined ||
            this.cache.clientSecretInput.value.length === 0
        ) {
            isError = true;
            this.cache.clientSecretInput
                .closest(this.selectors.inputCtnr)
                .classList.remove(this.classes.error);
        }

        if (isError) {
            return;
        }

        getOAuth(
            this.cache.clientIdInput.value,
            this.cache.clientSecretInput.value
        ).then((oAuthURL) => {
            const tab = window.open(oAuthURL, '_blank');
            if (tab) {
                tab.focus();
            }
        });
    }

    @api
    toggleModal(isOpened) {
        if (isOpened) {
            this.cache.modal.classList.add(this.classes.modalOpen);
            this.cache.background.classList.add(this.classes.backgroundOpen);
            return;
        }

        this.cache.modal.classList.remove(this.classes.modalOpen);
        this.cache.background.classList.remove(this.classes.backgroundOpen);
    }
}
