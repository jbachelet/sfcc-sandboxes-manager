import { LightningElement, api } from 'lwc';

const TOAST_TIME = 3000;

export default class Toast extends LightningElement {
    selectors = {
        toast: '[data-js-toast]',
        background: '[data-js-background]'
    };
    classes = {
        hide: 'slds-hide'
    };
    cache = {};
    @api title;
    @api type;
    rendered = false;

    renderedCallback() {
        if (this.cache.toast) {
            return;
        }

        this.cache.toast = this.template.querySelector(this.selectors.toast);
    }

    @api
    toggle(isOpened) {
        if (isOpened) {
            this.cache.toast.classList.remove(this.classes.hide);

            setTimeout(() => {
                this.toggle(false);
            }, TOAST_TIME);
            return;
        }

        this.cache.toast.classList.add(this.classes.hide);
    }

    get containerClass() {
        return `slds-notify slds-notify_toast slds-theme_${this.type}`;
    }

    get icon() {
        return `/resources/slds/icons/utility-sprite/svg/symbols.svg#${this.type}`;
    }
}
