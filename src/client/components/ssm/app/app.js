import { LightningElement, track } from 'lwc';
import { getDetails } from 'data/authService';

export default class App extends LightningElement {
    @track authDetails = {};

    connectedCallback() {}

    renderedCallback() {
        this.handleRefreshAuth();
    }

    handleRefreshAuth() {
        getDetails().then((result) => {
            this.authDetails = result;
            this.refreshSubComponents();
        });
    }

    handleOpenWelcomeModal() {
        this.template.querySelector('ssm-welcomemodal').toggleModal(true);
    }

    handleOpenAuthModal() {
        this.template.querySelector('ssm-authmodal').toggleModal(true);
    }

    handleLogout(e) {
        this.authDetails = e.detail;
        this.refreshSubComponents();
    }

    refreshSubComponents() {
        // Refresh the header
        this.template
            .querySelector('ssm-header')
            .refreshView(this.authDetails.authenticated);
        // Render or not the auth modal automatically
        this.template
            .querySelector('ssm-authmodal')
            .toggleModal(!this.authDetails.authenticated);

        // Display authenticated components
        this.template
            .querySelector('ssm-realms')
            .refreshView(this.authDetails.authenticated);
    }
}
