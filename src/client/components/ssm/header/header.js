import { LightningElement, api } from 'lwc';
import { logout } from 'data/authService';

export default class Header extends LightningElement {
    selectors = {
        notAuthenticatedLink: '[data-js-not-authenticated]',
        authenticatedLinkCtnr: '.slds-dropdown-trigger_click',
        authenticatedLink: '[data-js-authenticated]'
    };
    classes = {
        hide: 'slds-hide',
        dropdownOpen: 'slds-is-open'
    };
    cache = {};

    renderedCallback() {
        this.cache.notAuthenticatedLink = this.template.querySelector(
            this.selectors.notAuthenticatedLink
        );
        this.cache.authenticatedLink = this.template.querySelector(
            this.selectors.authenticatedLink
        );
        this.cache.logoutLink = this.template.querySelector(
            this.selectors.logoutLink
        );
    }

    onClickNotAuthenticatedLink(e) {
        e.preventDefault();
        this.dispatchEvent(
            new CustomEvent('openauthmodal', {
                bubbles: true
            })
        );
    }

    onClickAuthenticatedLink(e) {
        e.preventDefault();
        const ctnr = this.cache.authenticatedLink.querySelector(
            this.selectors.authenticatedLinkCtnr
        );

        if (ctnr.classList.contains(this.classes.dropdownOpen)) {
            ctnr.classList.remove(this.classes.dropdownOpen);
            return;
        }

        ctnr.classList.add(this.classes.dropdownOpen);
    }

    onClickLogoutLink(e) {
        e.preventDefault();
        logout().then((result) => {
            const eventDetails = Object.assign(
                {},
                {
                    bubbles: true,
                    detail: result
                }
            );

            this.dispatchEvent(new CustomEvent('userlogout', eventDetails));
            this.refreshView(result.authenticated);
        });
    }

    @api
    refreshView(isAuthenticated) {
        if (isAuthenticated) {
            this.cache.notAuthenticatedLink.classList.add(this.classes.hide);
            this.cache.authenticatedLink.classList.remove(this.classes.hide);
            return;
        }

        this.cache.notAuthenticatedLink.classList.remove(this.classes.hide);
        this.cache.authenticatedLink.classList.add(this.classes.hide);
    }
}
