import { LightningElement, track } from 'lwc';
import { getDetails } from 'data/authService';

export default class App extends LightningElement {
    @track authDetails = {};

    connectedCallback() {}

    renderedCallback() {
        getDetails().then((result) => {
            this.authDetails = result;
            this.template
                .querySelector('ssm-header')
                .refreshView(result && result.authenticated);
            this.template
                .querySelector('ssm-authmodal')
                .applyAuthDetails(result);
        });
    }

    handleLogout(e) {
        this.authDetails = e.detail;
        this.template.querySelector('ssm-authmodal').applyAuthDetails(e.detail);
    }

    handleOpenAuthModal() {
        this.template.querySelector('ssm-authmodal').toggleModal(true);
    }
}
