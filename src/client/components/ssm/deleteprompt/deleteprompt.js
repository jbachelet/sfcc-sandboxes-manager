import { LightningElement, api } from 'lwc';
export default class DeletePrompt extends LightningElement {
    selectors = {
        prompt: '[data-js-prompt]',
        background: '[data-js-background]'
    };
    classes = {
        promptOpen: 'slds-fade-in-open',
        backgroundOpen: 'slds-backdrop_open'
    };
    cache = {};
    @api sandboxid;

    renderedCallback() {
        this.cache.prompt = this.template.querySelector(this.selectors.prompt);
        this.cache.background = this.template.querySelector(
            this.selectors.background
        );
    }

    handleConfirm(e) {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent('confirmdeletion'));
    }

    handleClose(e) {
        e.preventDefault();
        this.toggleModal(false);
        this.dispatchEvent(new CustomEvent('closedeleteprompt'));
    }

    @api
    toggleModal(isOpened) {
        if (isOpened) {
            this.cache.prompt.classList.add(this.classes.promptOpen);
            this.cache.background.classList.add(this.classes.backgroundOpen);
            return;
        }

        this.cache.prompt.classList.remove(this.classes.promptOpen);
        this.cache.background.classList.remove(this.classes.backgroundOpen);
    }
}
