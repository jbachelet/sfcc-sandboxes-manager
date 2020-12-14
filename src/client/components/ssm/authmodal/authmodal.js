import { LightningElement, api, track } from 'lwc';

export default class AuthModal extends LightningElement {
    selectors = {
        modal: '[data-js-modal]',
        background: '[data-js-background]',
        clientIdInput: '[data-js-client-id]'
    };
    classes = {
        modalOpen: 'slds-fade-in-open',
        backgroundOpen: 'slds-backdrop_open'
    };
    cache = {};
    @track _authDetails;

    renderedCallback() {
        this.cache.modal = this.template.querySelector(this.selectors.modal);
        this.cache.background = this.template.querySelector(
            this.selectors.background
        );
        this.cache.clientIdInput = this.template.querySelector(
            this.selectors.clientIdInput
        );
    }

    handleClose(e) {
        e.preventDefault();
        this.toggleModal(false);
    }

    handleLogin(e) {
        e.preventDefault();
        const url = this.authDetails.authenticationURL.replace(
            '{0}',
            this.cache.clientIdInput.value
        );
        const tab = window.open(url, '_blank');
        if (tab) {
            tab.focus();
        }
    }

    @api
    applyAuthDetails(authDetails) {
        this._authDetails = authDetails;
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

    @api
    get authDetails() {
        return this._authDetails
            ? this._authDetails
            : {
                  grant: {}
              };
    }
}
