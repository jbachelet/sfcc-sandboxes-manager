import { LightningElement, api, track } from 'lwc';
import { getSandbox, getUsage, getSettings } from 'data/sandboxesService';
import { handleResponse } from 'helpers/ui';

export default class SandboxPanel extends LightningElement {
    selectors = {
        panel: '[data-js-panel]',
        tabItems: '[data-js-tab-item]',
        tabContents: '[data-js-tab-content]',
        usageFrom: '[data-js-usage-from]',
        usageTo: '[data-js-usage-to]',
        settingsOcapi: '[data-js-settings-ocapi]',
        settingsWebdav: '[data-js-settings-webdav]'
    };
    classes = {
        active: 'slds-is-active',
        hide: 'slds-hide',
        open: 'slds-is-open',
        show: 'slds-show'
    };
    cache = {};
    @api sandboxid;
    @track sandbox;
    @track loading = false;
    @track loadingUsage = false;
    @track loadingSettings = false;
    @track usageFrom = false;
    @track usageTo = false;

    renderedCallback() {
        this.cache.panel = this.template.querySelector(this.selectors.panel);
        this.cache.tabItems = this.template.querySelectorAll(
            this.selectors.tabItems
        );
        this.cache.tabContents = this.template.querySelectorAll(
            this.selectors.tabContents
        );
        this.cache.usageFrom = this.template.querySelector(
            this.selectors.usageFrom
        );
        this.cache.usageTo = this.template.querySelector(
            this.selectors.usageTo
        );
        this.cache.settingsOcapi = this.template.querySelector(
            this.selectors.settingsOcapi
        );
        this.cache.settingsWebdav = this.template.querySelector(
            this.selectors.settingsWebdav
        );
    }

    handleClose() {
        // As the sandbox Id provided is undefined
        // It is not equals to the one related to this component, to it closes it
        this.toggle(false);
    }

    handleOpenDetailsTab(e) {
        this.applyTabSelection(e.target);
    }

    handleOpenUsageTab(e) {
        this.applyTabSelection(e.target);

        if (this.sandbox.usage) {
            return;
        }

        this.loadingUsage = true;
        getUsage(this.sandboxid, this.thirtyDaysFromToday, this.today).then(
            (result) => {
                this.loadingUsage = false;

                if (!handleResponse(this, result)) {
                    return;
                }

                this.sandbox.usage = result.data;
            }
        );
    }

    handleRefreshUsageData(e) {
        e.preventDefault();

        this.usageFrom = this.cache.usageFrom.value;
        this.usageTo = this.cache.usageTo.value;

        this.loadingUsage = true;
        getUsage(this.sandboxid, this.usageFrom, this.usageTo).then(
            (result) => {
                this.loadingUsage = false;

                if (!handleResponse(this, result)) {
                    return;
                }

                this.sandbox.usage = result.data;
            }
        );
    }

    handleOpenSettingsTab(e) {
        this.applyTabSelection(e.target);

        if (this.sandbox.settings) {
            return;
        }

        this.loadingSettings = true;
        getSettings(this.sandboxid).then((result) => {
            this.loadingSettings = false;

            if (!handleResponse(this, result)) {
                return;
            }

            this.sandbox.settings = result.data;
        });
    }

    applyTabSelection(target) {
        // Deselect all
        Array.from(this.cache.tabItems).forEach((elem) =>
            elem.classList.remove(this.classes.active)
        );
        Array.from(this.cache.tabItems).forEach((elem) =>
            elem.querySelector('a').setAttribute('aria-selected', false)
        );
        Array.from(this.cache.tabContents).forEach((elem) =>
            elem.classList.remove(this.classes.show)
        );
        Array.from(this.cache.tabContents).forEach((elem) =>
            elem.classList.add(this.classes.hide)
        );

        // Set item as selected
        target
            .closest(this.selectors.tabItems)
            .classList.add(this.classes.active);
        target.setAttribute('aria-selected', true);
        // Show content
        const controlContent = target.getAttribute('aria-controls');
        const tabContent = this.template.querySelector(`#${controlContent}`);
        tabContent.classList.add(this.classes.show);
        tabContent.classList.remove(this.classes.hide);
    }

    @api
    toggle(isOpened) {
        if (isOpened) {
            // Display the panel, with the loader
            this.cache.panel.classList.add(this.classes.open);
            this.cache.panel.setAttribute('aria-hidden', false);

            if (this.sandbox) {
                return;
            }

            this.loading = true;
            getSandbox(this.sandboxid, true).then((result) => {
                this.loading = false;

                if (!handleResponse(this, result)) {
                    this.toggle(false);
                    return;
                }

                this.sandbox = result.data;
            });
        } else {
            this.cache.panel.classList.remove(this.classes.open);
            this.cache.panel.setAttribute('aria-hidden', true);
        }
    }

    get hasSandbox() {
        return this.sandbox !== undefined;
    }

    get hasSandboxStorageLoaded() {
        return (
            this.sandbox &&
            this.sandbox.storage &&
            this.sandbox.storage.sharedata &&
            this.sandbox.storage.realmdata
        );
    }

    get hasSandboxUsageLoaded() {
        return this.sandbox.usage !== undefined;
    }

    get hasSandboxSettingsLoaded() {
        return this.sandbox.settings !== undefined;
    }

    get isLoadingData() {
        return this.loading === true;
    }

    get isLoadingUsageData() {
        return this.loadingUsage === true;
    }

    get isLoadingSettingsData() {
        return this.loadingSettings === true;
    }

    get createdAt() {
        const d = new Date(this.sandbox.createdAt);
        return `${d.toLocaleDateString('en-US')} ${d.toLocaleTimeString(
            'en-US'
        )}`;
    }

    get deletedAt() {
        if (!this.sandbox.deletedAt) {
            return '';
        }

        const d = new Date(this.sandbox.deletedAt);
        return `${d.toLocaleDateString('en-US')} ${d.toLocaleTimeString(
            'en-US'
        )}`;
    }

    get endOfLife() {
        if (!this.sandbox.eol) {
            return '';
        }

        const d = new Date(this.sandbox.eol);
        return `${d.toLocaleDateString('en-US')} ${d.toLocaleTimeString(
            'en-US'
        )}`;
    }

    get badgeState() {
        switch (this.sandbox.state) {
            case 'pending':
            case 'creating':
            case 'starting':
                return 'slds-badge slds-badge_lightest';
            case 'started':
                return 'slds-badge slds-theme_success';
            case 'stopped':
                return 'slds-badge slds-theme_warning';
            case 'failed':
                return 'slds-badge slds-theme_error';
            case 'new':
            default:
                return 'slds-badge';
        }
    }

    get settingsOcapi() {
        if (!this.sandbox.settings) {
            return undefined;
        }

        return JSON.stringify(this.sandbox.settings.ocapi, null, 4);
    }

    get settingsWebdav() {
        if (!this.sandbox.settings) {
            return undefined;
        }

        return JSON.stringify(this.sandbox.settings.webdav, null, 4);
    }

    get daysUp() {
        if (!this.sandbox.usage) {
            return 0;
        }

        // Divide the number of minutes per 1440 (nb of minnutes within a day), then round up the number to one decimal
        return Math.round((this.sandbox.usage.minutesUp / 1440) * 10) / 10;
    }

    get daysDown() {
        if (!this.sandbox.usage) {
            return 0;
        }

        // Divide the number of minutes per 1440 (nb of minnutes within a day), then round up the number to one decimal
        return Math.round((this.sandbox.usage.minutesDown / 1440) * 10) / 10;
    }

    get usageFromValue() {
        return this.usageFrom || this.thirtyDaysFromToday;
    }

    get usageToValue() {
        return this.usageTo || this.today;
    }

    get thirtyDaysFromToday() {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return this.formatDate(date);
    }

    get today() {
        return this.formatDate(new Date());
    }

    get hasEOL() {
        return this.sandbox && this.sandbox.eol;
    }

    get hasDeletedDetails() {
        return this.sandbox && this.sandbox.deletedAt && this.sandbox.deletedBy;
    }

    formatDate(date) {
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        return y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    }
}
