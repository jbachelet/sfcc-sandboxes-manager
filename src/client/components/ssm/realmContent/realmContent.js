import { LightningElement, api, track } from 'lwc';

export default class RealmContent extends LightningElement {
    selectors = {
        sandboxes: 'ssm-sandboxes'
    };
    classes = {
        hide: 'slds-hide',
        show: 'slds-show'
    };
    cache = {};
    @api realm;
    @api index;
    @track active = false;

    renderedCallback() {
        if (this.cache.sandboxes) {
            return;
        }

        this.cache.sandboxes = this.template.querySelector(
            this.selectors.sandboxes
        );
    }

    @api
    setActive(active) {
        this.active = active;

        if (this.active) {
            this.cache.sandboxes.refreshView();
            this.template.host.classList.remove(this.classes.hide);
            this.template.host.classList.add(this.classes.show);
        } else {
            this.template.host.classList.add(this.classes.hide);
            this.template.host.classList.remove(this.classes.show);
        }
    }

    get navid() {
        return `${this.realm.id}__nav`;
    }

    get controlid() {
        return `${this.realm.id}__content`;
    }

    get htmlClass() {
        return `slds-vertical-tabs__content ${
            this.active ? 'slds-show' : 'slds-hide'
        }`;
    }
}
