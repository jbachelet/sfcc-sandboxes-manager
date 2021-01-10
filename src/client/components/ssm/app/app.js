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
        });
    }

    handleOpenAuthModal() {
        this.template.querySelector('ssm-authmodal').toggleModal(true);
    }
}
