import { LightningElement, api, track } from 'lwc';

const LABEL_DEFAULT_STYLE = 'slds-badge';

export default class SetRealmLabelModal extends LightningElement {
    selectors = {
        modal: '[data-js-modal]',
        background: '[data-js-background]',
        realmLabelInput: '[data-js-realm-label]',
        labelStyle: '[name="label-style"]',
        inputCtnr: '.slds-form-element'
    };
    classes = {
        modalOpen: 'slds-fade-in-open',
        backgroundOpen: 'slds-backdrop_open',
        error: 'slds-has-error',
        hide: 'slds-hide'
    };
    cache = {};
    realmId = undefined;
    realmLabel = undefined;
    @track realmLabelStyle = LABEL_DEFAULT_STYLE;
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
        this.cache.realmLabelInput = this.template.querySelector(
            this.selectors.realmLabelInput
        );
        this.cache.labelStyle = this.template.querySelectorAll(
            this.selectors.labelStyle
        );
    }

    handleClose(e) {
        e.preventDefault();
        this.toggleModal(false);
    }

    handleConfirm(e) {
        e.preventDefault();
        const labelStyle = Array.from(this.cache.labelStyle).filter(
            (labelStypeInput) => labelStypeInput.checked
        )[0];

        this.cache.realmLabelInput
            .closest(this.selectors.inputCtnr)
            .classList.remove(this.classes.error);

        if (
            this.realmLabel !== this.cache.realmLabelInput.value ||
            (labelStyle && labelStyle.value) !== this.realmLabelStyle
        ) {
            this.dispatchEvent(
                new CustomEvent('setrealmlabel', {
                    detail: {
                        id: this.realmId,
                        label: this.cache.realmLabelInput.value || '',
                        style:
                            (labelStyle && labelStyle.value) ||
                            LABEL_DEFAULT_STYLE
                    }
                })
            );
        }

        this.toggleModal(false);
        // Clean up the data
        this.realmId = undefined;
        this.realmLabel = undefined;
        this.realmLabelStyle = undefined;
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
    setRealmId(realmId) {
        this.realmId = realmId;
    }

    @api
    setRealmLabel(realmLabel) {
        this.realmLabel = realmLabel;
    }

    @api
    setRealmLabelStyle(realmLabelStyle) {
        this.realmLabelStyle = realmLabelStyle;
    }

    get styleDefaultChecked() {
        return (
            this.realmLabelStyle === LABEL_DEFAULT_STYLE ||
            !this.realmLabelStyle
        );
    }

    get styleDarkChecked() {
        return this.realmLabelStyle === 'slds-badge slds-badge_inverse';
    }

    get styleLightChecked() {
        return this.realmLabelStyle === 'slds-badge slds-badge_lightest';
    }

    get styleSuccessChecked() {
        return this.realmLabelStyle === 'slds-badge slds-theme_success';
    }

    get styleWarningChecked() {
        return this.realmLabelStyle === 'slds-badge slds-theme_warning';
    }

    get styleErrorChecked() {
        return this.realmLabelStyle === 'slds-badge slds-theme_error';
    }
}
