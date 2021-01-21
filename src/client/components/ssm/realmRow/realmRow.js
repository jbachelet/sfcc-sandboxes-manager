import { LightningElement, api, track } from 'lwc';

export default class RealmRow extends LightningElement {
    @api realm;
    @api index;
    @track active = false;

    @api
    setActive(active) {
        this.active = active;
    }

    handleClick(e) {
        e.preventDefault();
        this.dispatchEvent(
            new CustomEvent('selectrealm', {
                detail: {
                    index: this.index
                }
            })
        );
    }

    get navid() {
        return `${this.realm.id}__nav`;
    }

    get controlid() {
        return `${this.realm.id}__content`;
    }

    get htmlClass() {
        return `slds-vertical-tabs__nav-item ${
            this.active ? 'slds-is-active' : ''
        }`;
    }
}
