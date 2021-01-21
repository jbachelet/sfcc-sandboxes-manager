import { LightningElement } from 'lwc';
import { getDetails } from 'data/authService';

export default class App extends LightningElement {
    authDetails = {};
    toastTitle = undefined;
    toastType = 'success';

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

    handleOpenToast(e) {
        this.toastTitle = e.detail.title;
        this.toastType = e.detail.type;
        this.template.querySelector('ssm-toast').toggle(true);
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
            .setClientId(this.authDetails.clientId);
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
