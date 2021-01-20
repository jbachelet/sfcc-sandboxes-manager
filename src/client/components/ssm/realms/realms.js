import { LightningElement, api, track } from 'lwc';
import { getRealms } from 'data/realmsService';

export default class Realms extends LightningElement {
    selectors = {
        realmsCount: '[data-js-realms-count]',
        realmRows: 'ssm-realm-row',
        realmContents: 'ssm-realm-content'
    };
    cache = {};
    @track realms = [];
    @track error;
    @track authenticated = false;
    @track loading = false;

    renderedCallback() {
        if (this.cache.realmsCount) {
            return;
        }

        this.cache.realmsCount = this.template.querySelector(
            this.selectors.realmsCount
        );
    }

    handleRefresh() {
        this.refreshView(this.authenticated);
    }

    handleRealmSelection(e) {
        const realmIndex = e.detail.index;
        // Apply selection
        Array.from(
            this.template.querySelectorAll(this.selectors.realmRows)
        ).forEach((elem, idx) => elem.setActive(idx === realmIndex));
        Array.from(
            this.template.querySelectorAll(this.selectors.realmContents)
        ).forEach((elem, idx) => elem.setActive(idx === realmIndex));
    }

    @api
    refreshView(isAuthenticated) {
        if (isAuthenticated) {
            this.authenticated = isAuthenticated;
        }

        if (!this.authenticated) {
            return;
        }

        this.loading = true;

        getRealms()
            .then((result) => {
                if (result.error) {
                    this.error =
                        'Error while fetching realms. Please ensure you are authenticated';
                    this.loading = false;
                    return;
                }

                this.loading = false;
                this.realms = result.data;
                this.cache.realmsCount.innerText = this.realms.length;
            })
            .then(() => {
                // Select the first row in the list, if it exists
                this.handleRealmSelection({
                    detail: {
                        index: 0
                    }
                });
            });
    }

    get hasRealms() {
        return this.realms && this.realms.length > 0;
    }

    get hasError() {
        return typeof this.error !== 'undefined';
    }

    get isAuthenticated() {
        return this.authenticated === true;
    }

    get isLoadingData() {
        return this.loading === true;
    }
}
