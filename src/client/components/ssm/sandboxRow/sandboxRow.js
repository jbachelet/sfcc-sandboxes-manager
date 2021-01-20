import { LightningElement, api } from 'lwc';

export default class SandboxRow extends LightningElement {
    @api sandbox;

    handleRunOperation(e) {
        this.dispatchEvent(
            new CustomEvent('runoperation', {
                bubbles: true,
                detail: {
                    id: this.sandbox.id,
                    operation: e.target.dataset.operation
                }
            })
        );
    }

    handleOpenPanel() {
        this.dispatchEvent(
            new CustomEvent('opensandboxpanel', {
                bubbles: true,
                detail: {
                    id: this.sandbox.id
                }
            })
        );
    }

    get id() {
        return `${this.sandbox.realm}.${this.sandbox.instance}`;
    }

    get url() {
        return `https://${this.sandbox.realm}-${this.sandbox.instance}.sandbox.us01.dx.commercecloud.salesforce.com/on/demandware.store/Sites-Site`;
    }

    get createdAt() {
        const d = new Date(this.sandbox.createdAt);
        return `${d.toLocaleDateString('en-US')} ${d.toLocaleTimeString(
            'en-US'
        )}`;
    }

    get badgeState() {
        switch (this.sandbox.state) {
            case 'pending':
            case 'creating':
            case 'starting':
                return 'slds-badge slds-badge_lightest';
            case 'started':
                return 'slds-badge slds-theme_success';
            case 'stopped':
                return 'slds-badge slds-theme_warning';
            case 'failed':
                return 'slds-badge slds-theme_error';
            case 'new':
            default:
                return 'slds-badge';
        }
    }

    get canStart() {
        return !this.hasPendingOperation && this.sandbox.state !== 'started';
    }

    get canStop() {
        return !this.hasPendingOperation && this.sandbox.state === 'started';
    }

    get canDelete() {
        return (
            !this.hasPendingOperation &&
            ['started', 'stopped'].indexOf(this.sandbox.state) > -1
        );
    }

    get hasPendingOperation() {
        return this.sandbox.hasPendingOperation === true;
    }
}
