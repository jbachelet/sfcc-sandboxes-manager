import { LightningElement, api, track } from 'lwc';
import { getRealm } from 'data/realmsService';
import { handleResponse } from 'helpers/ui';

export default class RealmPanel extends LightningElement {
    selectors = {
        panel: '[data-js-panel]',
        defaultTTLInput: '[data-js-default-ttl]',
        maximumTTLInput: '[data-js-maximum-ttl]'
    };
    classes = {
        open: 'slds-is-open'
    };
    cache = {};
    @api realmid;
    @track realm;
    @track loading = false;

    renderedCallback() {
        this.cache.panel = this.template.querySelector(this.selectors.panel);
        this.cache.defaultTTLInput = this.template.querySelector(
            this.selectors.defaultTTLInput
        );
        this.cache.maximumTTLInput = this.template.querySelector(
            this.selectors.maximumTTLInput
        );
    }

    handleClose() {
        // As the sandbox Id provided is undefined
        // It is not equals to the one related to this component, to it closes it
        this.toggle(false);
    }

    handleApplyConfiguration(e) {
        e.preventDefault();
        const defaultTTL = parseInt(this.cache.defaultTTLInput.value, 10);
        const maximumTTL = parseInt(this.cache.maximumTTLInput.value, 10);

        // If the values did not changed, then abort
        if (
            defaultTTL ===
                this.realm.configuration.sandbox.sandboxTTL.defaultValue &&
            maximumTTL === this.realm.configuration.sandbox.sandboxTTL.maximum
        ) {
            this.toggle(false);
            return;
        }

        this.dispatchEvent(
            new CustomEvent('applyconfiguration', {
                detail: {
                    id: this.realmid,
                    defaultTTL: defaultTTL,
                    maximumTTL: maximumTTL
                }
            })
        );
    }

    @api
    toggle(isOpened) {
        if (isOpened) {
            // Display the panel, with the loader
            this.cache.panel.classList.add(this.classes.open);
            this.cache.panel.setAttribute('aria-hidden', false);

            if (this.realm) {
                return;
            }

            this.loading = true;
            getRealm(this.realmid, true).then((result) => {
                this.loading = false;

                if (!handleResponse(this, result)) {
                    this.toggle(false);
                    return;
                }

                this.realm = result.data;
            });
        } else {
            this.cache.panel.classList.remove(this.classes.open);
            this.cache.panel.setAttribute('aria-hidden', true);
        }
    }

    get hasRealm() {
        return this.realm !== undefined;
    }

    get isLoadingData() {
        return this.loading === true;
    }

    @api
    setRealmConfiguration(realmConfig) {
        if (!this.realm) {
            return;
        }

        this.realm.configuration = realmConfig;
    }
}
