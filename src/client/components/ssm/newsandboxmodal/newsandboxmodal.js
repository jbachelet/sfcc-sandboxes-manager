import { LightningElement, api } from 'lwc';

export default class NewSandboxModal extends LightningElement {
    selectors = {
        modal: '[data-js-modal]',
        background: '[data-js-background]',
        realmIdInput: '[data-js-realm-id]',
        ttlInput: '[data-js-ttl]',
        ocapiSettingsInput: '[ data-js-ocapi-settings]',
        webdavSettingsInput: '[ data-js-webdav-settings]',
        inputCtnr: '.slds-form-element'
    };
    classes = {
        modalOpen: 'slds-fade-in-open',
        backgroundOpen: 'slds-backdrop_open',
        error: 'slds-has-error',
        hide: 'slds-hide'
    };
    cache = {};
    @api realmid = undefined;
    defaultTTL = 24;
    defaultOcapiSettings = JSON.stringify(
        [
            {
                client_id: '<your client id>',
                resources: [
                    {
                        resource_id: '/**',
                        methods: ['get', 'post', 'put', 'patch', 'delete'],
                        read_attributes: '(**)',
                        write_attributes: ''
                    }
                ]
            }
        ],
        null,
        4
    );
    defaultWebDavSettings = JSON.stringify(
        [
            {
                client_id: '<your client id>',
                permissions: [
                    { path: '/cartridges', operations: ['read_write'] },
                    { path: '/impex', operations: ['read_write'] }
                ]
            }
        ],
        null,
        4
    );
    rendered = false;

    renderedCallback() {
        if (this.rendered) {
            return;
        }

        this.rendered = true;
        this.cache.modal = this.template.querySelector(this.selectors.modal);
        this.cache.background = this.template.querySelector(
            this.selectors.background
        );
        this.cache.realmIdInput = this.template.querySelector(
            this.selectors.realmIdInput
        );
        this.cache.ttlInput = this.template.querySelector(
            this.selectors.ttlInput
        );
        this.cache.ocapiSettingsInput = this.template.querySelector(
            this.selectors.ocapiSettingsInput
        );
        this.cache.webdavSettingsInput = this.template.querySelector(
            this.selectors.webdavSettingsInput
        );
    }

    handleClose(e) {
        e.preventDefault();
        this.toggleModal(false);
    }

    handleCreate(e) {
        e.preventDefault();

        let isError = false;
        this.cache.realmIdInput
            .closest(this.selectors.inputCtnr)
            .classList.remove(this.classes.error);
        this.cache.ttlInput
            .closest(this.selectors.inputCtnr)
            .classList.remove(this.classes.error);
        this.cache.ocapiSettingsInput
            .closest(this.selectors.inputCtnr)
            .classList.remove(this.classes.error);
        this.cache.webdavSettingsInput
            .closest(this.selectors.inputCtnr)
            .classList.remove(this.classes.error);

        isError = !isError && this.validateInput(this.cache.realmIdInput);
        isError = !isError && this.validateInput(this.cache.ttlInput);
        isError =
            !isError && this.validateInput(this.cache.ocapiSettingsInput, true);
        isError =
            !isError &&
            this.validateInput(this.cache.webdavSettingsInput, true);

        if (isError) {
            return;
        }

        this.dispatchEvent(
            new CustomEvent('createsandbox', {
                detail: {
                    realmId: this.cache.realmIdInput.value,
                    ttl: this.cache.ttlInput.value,
                    ocapiSettings: JSON.parse(
                        this.cache.ocapiSettingsInput.value
                    ),
                    webdavSettings: JSON.parse(
                        this.cache.webdavSettingsInput.value
                    )
                }
            })
        );
        this.toggleModal(false);
    }

    validateInput(input, tryParse = false) {
        if (input.value === undefined || input.value.length === 0) {
            input
                .closest(this.selectors.inputCtnr)
                .classList.remove(this.classes.error);
            return false;
        }

        if (!tryParse) {
            return true;
        }

        try {
            let parsed = JSON.parse(input.value);
            return parsed !== undefined;
        } catch (e) {
            return false;
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
}
