import { LightningElement, api, track } from 'lwc';

const LOCAL_STORAGE_WELCOME_DONT_SHOW_AGAIN_KEY =
    'sfcc.sandboxes.manager.welcome.dont_show_again';

export default class WelcomeModal extends LightningElement {
    selectors = {
        modal: '[data-js-modal]',
        background: '[data-js-background]',
        dontShowAgain: '[data-js-dont-show-again]'
    };
    classes = {
        modalOpen: 'slds-fade-in-open',
        backgroundOpen: 'slds-backdrop_open'
    };
    cache = {};
    @track host = undefined;
    @track port = undefined;

    renderedCallback() {
        if (this.cache.modal) {
            return;
        }

        this.cache.modal = this.template.querySelector(this.selectors.modal);
        this.cache.background = this.template.querySelector(
            this.selectors.background
        );
        this.cache.dontShowAgain = this.template.querySelector(
            this.selectors.dontShowAgain
        );

        // todo check local storage
        const dontShowWelcomeAgain = localStorage.getItem(
            LOCAL_STORAGE_WELCOME_DONT_SHOW_AGAIN_KEY
        );
        if (dontShowWelcomeAgain === 'true') {
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.get('authenticated')) {
            this.toggleModal(true);
        }
    }

    handleClose(e) {
        e.preventDefault();
        this.toggleModal(false);

        const dontShowAgain = this.cache.dontShowAgain.checked;
        if (dontShowAgain) {
            localStorage.setItem(
                LOCAL_STORAGE_WELCOME_DONT_SHOW_AGAIN_KEY,
                true
            );
        }
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
    refreshView(host, port) {
        this.host = host;
        this.port = port;
    }

    get redirectURI() {
        if (!this.host) {
            return '';
        }

        return `https://${this.host}${
            this.port && this.port !== '80' ? `:${this.port}` : ''
        }/auth/login_reentry`;
    }
}
