import { LightningElement, api, track } from 'lwc';
import { logout } from 'data/authService';
import { getMe } from 'data/meService';
import { handleResponse } from 'helpers/ui';

export default class Header extends LightningElement {
    selectors = {
        notAuthenticatedLink: '[data-js-not-authenticated]',
        authenticatedLinkCtnr: '.slds-dropdown-trigger_click',
        authenticatedLink: '[data-js-authenticated]',
        clientIdTooltip: '[data-js-clientid-tooltip]'
    };
    classes = {
        hide: 'slds-hide',
        dropdownOpen: 'slds-is-open'
    };
    cache = {};
    @track authenticated = false;
    @track userInfos = undefined;

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
        this.cache.clientIdTooltip = this.template.querySelector(
            this.selectors.clientIdTooltip
        );
    }

    onClickOpenWelcomeModal(e) {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent('openwelcomemodal'));
    }

    onClickNotAuthenticatedLink(e) {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent('openauthmodal'));
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

    onClickClientID(e) {
        e.preventDefault();
        navigator.clipboard.writeText(this.clientId);
        this.cache.clientIdTooltip.classList.remove(this.classes.hide);
        setTimeout(() => {
            this.cache.clientIdTooltip.classList.add(this.classes.hide);
        }, 3000);
    }

    onClickPreventDefault(e) {
        e.preventDefault();
    }

    onClickLogoutLink(e) {
        e.preventDefault();
        logout().then((result) => {
            this.authenticated = result.authenticated;
            this.refreshView(this.authenticated);
            this.dispatchEvent(
                new CustomEvent('logout', {
                    detail: {
                        authenticated: this.authenticated
                    }
                })
            );
        });
    }

    refreshUserInfos() {
        getMe().then((result) => {
            if (!handleResponse(this, result)) {
                return;
            }

            this.userInfos = result.data.user;
            this.userInfos.clientId = result.data.client.id;

            this.dispatchEvent(
                new CustomEvent('userinfos', {
                    detail: {
                        userInfos: this.userInfos
                    }
                })
            );
        });
    }

    @api
    refreshView(isAuthenticated) {
        this.authenticated = isAuthenticated;

        if (this.authenticated) {
            this.cache.notAuthenticatedLink.classList.add(this.classes.hide);
            this.cache.authenticatedLink.classList.remove(this.classes.hide);
            this.refreshUserInfos();
            return;
        }

        this.cache.notAuthenticatedLink.classList.remove(this.classes.hide);
        this.cache.authenticatedLink.classList.add(this.classes.hide);
        // Remove the user infos
        this.userInfos = undefined;
    }

    get hasUserInfos() {
        return this.userInfos !== undefined;
    }
}
