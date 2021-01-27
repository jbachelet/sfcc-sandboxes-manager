import { LightningElement, track } from 'lwc';
import { getDetails } from 'data/authService';

export default class App extends LightningElement {
    selectors = {
        header: 'ssm-header',
        toast: 'ssm-toast',
        welcome: 'ssm-welcomemodal',
        auth: 'ssm-authmodal',
        realms: 'ssm-realms'
    };
    authDetails = {};
    @track userInfos = undefined;
    toastTitle = undefined;
    toastType = 'success';
    rendered = false;
    authRefreshed = false;

    renderedCallback() {
        if (this.rendered) {
            return;
        }

        this.rendered = true;
        this.handleRefreshAuth();
    }

    handleRefreshAuth() {
        if (this.authRefreshed) {
            this.toastTitle =
                'Failed to authenticate you. Please ensure you properly configured your API Client.';
            this.toastType = 'error';
            this.template.querySelector(this.selectors.toast).toggle(true);
            this.template.querySelector(this.selectors.header).handleLogout();
            return;
        }

        getDetails().then((result) => {
            // Set the refreshed flag to true if the authentication failed, so that next time we refresh we block the loop and display an error
            this.authRefreshed = !result.authenticated;

            this.authDetails = result;
            this.refreshSubComponents();
        });
    }

    handleOpenToast(e) {
        this.toastTitle = e.detail.title;
        this.toastType = e.detail.type;
        this.template.querySelector(this.selectors.toast).toggle(true);
    }

    handleOpenWelcomeModal() {
        this.template.querySelector(this.selectors.welcome).toggleModal(true);
    }

    handleOpenAuthModal() {
        this.template.querySelector(this.selectors.auth).toggleModal(true);
    }

    handleLogout(e) {
        this.authDetails = e.detail;
        this.refreshSubComponents();
    }

    handleUserInfos(e) {
        // Same user infos, abort
        if (this.userInfos && this.userInfos.id === e.detail.userInfos.id) {
            return;
        }

        this.userInfos = e.detail.userInfos;
    }

    refreshSubComponents() {
        // Refresh the header
        this.template
            .querySelector(this.selectors.header)
            .refreshView(this.authDetails.authenticated);
        // Refresh the Welcome modal
        this.template
            .querySelector(this.selectors.welcome)
            .refreshView(this.authDetails.host);
        // Render or not the auth modal automatically
        this.template
            .querySelector(this.selectors.auth)
            .toggleModal(!this.authDetails.authenticated);
        // Display authenticated components
        this.template
            .querySelector(this.selectors.realms)
            .refreshView(this.authDetails.authenticated);
    }
}
