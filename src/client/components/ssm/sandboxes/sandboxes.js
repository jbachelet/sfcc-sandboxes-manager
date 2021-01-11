import { LightningElement, api, track } from 'lwc';
import { getSandboxes } from 'data/sandboxesService';

export default class Sandboxes extends LightningElement {
    @track sandboxes = [];
    @track error;
    @track authenticated = false;
    @track loading = false;

    handleRefresh() {
        this.refreshView(this.authenticated);
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

        getSandboxes().then((result) => {
            if (result.error) {
                this.error =
                    'Error while fetching sandboxes. Please ensure you are authenticated';
                this.loading = false;
                return;
            }

            this.sandboxes = result.data;
            this.loading = false;
        });
    }

    get hasSandboxes() {
        return this.sandboxes && this.sandboxes.length > 0;
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
