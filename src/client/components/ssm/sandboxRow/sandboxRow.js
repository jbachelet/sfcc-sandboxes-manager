import { LightningElement, api } from 'lwc';

export default class SandboxRow extends LightningElement {
    @api sandbox;

    get id() {
        return `${this.sandbox.realm}.${this.sandbox.instance}`;
    }

    get url() {
        return `https://${this.sandbox.realm}-${this.sandbox.instance}.sandbox.us01.dx.commercecloud.salesforce.com/on/demandware.store/Sites-Site`;
    }

    get createdAt() {
        return new Date(this.sandbox.createdAt).toLocaleDateString('en-US');
    }

    get badgeState() {
        switch (this.sandbox.state) {
            case 'starting':
                return 'slds-badge_lightest';
            case 'started':
                return 'slds-badge slds-theme_success';
            case 'stopped':
                return 'slds-badge slds-theme_warning';
            case 'failed':
                return 'slds-badge slds-theme_error';
            case 'new':
            case 'creating':
            default:
                return 'slds-badge';
        }
    }

    get canStart() {
        return this.sandbox.state !== 'started';
    }

    get canStop() {
        return this.sandbox.state === 'started';
    }

    get canDelete() {
        return ['started', 'stopped'].indexOf(this.sandbox.state) > -1;
    }
}
