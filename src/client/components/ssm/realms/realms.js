import { LightningElement, api, track } from 'lwc';
import { getRealms, updateRealmConfiguration } from 'data/realmsService';
import { handleResponse, displayToast } from 'helpers/ui';

const LOCAL_STORAGE_REALM_LABEL_KEY_PREFIX = 'sfcc.sandboxes.manager.realm';

export default class Realms extends LightningElement {
    selectors = {
        realmsCount: '[data-js-realms-count]',
        realmRows: 'ssm-realm-row',
        realmContents: 'ssm-realm-content',
        realmsPanels: 'ssm-realm-panel',
        setRealmLabelModal: 'ssm-set-realm-label-modal'
    };
    cache = {};
    @track realms = [];
    @track authenticated = false;
    @track loading = false;
    @api userinfos;

    renderedCallback() {
        this.cache.realmsCount = this.template.querySelector(
            this.selectors.realmsCount
        );
        this.cache.setRealmLabelModal = this.template.querySelector(
            this.selectors.setRealmLabelModal
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

    handleOpenRealmPanel(e) {
        const realmId = e.detail.id;
        // Apply selection
        Array.from(
            this.template.querySelectorAll(this.selectors.realmsPanels)
        ).forEach((elem) => elem.toggle(realmId === elem.realmid));
    }

    handleOpenChangeRealmLabelModal(e) {
        const realmId = e.detail.id;

        // Open the modal
        this.cache.setRealmLabelModal.setRealmId(realmId);
        this.cache.setRealmLabelModal.setRealmLabel(
            this.getRealmLabel(realmId)
        );
        this.cache.setRealmLabelModal.setRealmLabelStyle(
            this.getRealmLabelStyle(realmId)
        );
        this.cache.setRealmLabelModal.toggleModal(true);
    }

    handleSetRealmLabel(e) {
        const realmId = e.detail.id;
        const realmLabel = e.detail.label;
        const realmLabelStyle = e.detail.style;

        // Save the label for the given realm
        const isLabelSaved = this.realms.some((realm) => {
            if (realm.id === realmId) {
                // Save the label on the realm object
                realm.label = realmLabel;
                realm.labelStyle = realmLabelStyle;

                // Save the label into the local storage
                localStorage.setItem(
                    `${LOCAL_STORAGE_REALM_LABEL_KEY_PREFIX}.${realmId}.label`,
                    realmLabel
                );
                localStorage.setItem(
                    `${LOCAL_STORAGE_REALM_LABEL_KEY_PREFIX}.${realmId}.style`,
                    realmLabelStyle
                );

                return true;
            }

            return false;
        });

        if (isLabelSaved) {
            // Display toast for success
            displayToast(
                this,
                `The label "${realmLabel}" has been saved on the realm "${realmId}".`
            );
        }
    }

    handleApplyRealmConfiguration(e) {
        const realmId = e.detail.id;
        const defaultTTL = e.detail.defaultTTL;
        const maximumTTL = e.detail.maximumTTL;
        this.loading = true;

        updateRealmConfiguration(realmId, defaultTTL, maximumTTL).then(
            (result) => {
                this.loading = false;

                if (!handleResponse(this, result)) {
                    return;
                }

                // Apply the configuration to the panel
                Array.from(
                    this.template.querySelectorAll(this.selectors.realmsPanels)
                ).some((elem) => {
                    if (realmId === elem.realmid) {
                        elem.setRealmConfiguration(result.data);
                        elem.toggle(false);
                        return true;
                    }

                    return false;
                });

                // Display toast for success
                displayToast(
                    this,
                    `The configuration has been applied to the realm "${realmId}".`
                );
            }
        );
    }

    @api
    refreshView(isAuthenticated) {
        this.authenticated = isAuthenticated;

        if (!this.authenticated) {
            return;
        }

        this.loading = true;

        getRealms()
            .then((result) => {
                this.loading = false;

                if (!handleResponse(this, result)) {
                    return;
                }

                result.data = result.data.map((realm) => {
                    realm.label = this.getRealmLabel(realm.id);
                    realm.labelStyle = this.getRealmLabelStyle(realm.id);

                    return realm;
                });

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

    getRealmLabel(realmId) {
        return localStorage.getItem(
            `${LOCAL_STORAGE_REALM_LABEL_KEY_PREFIX}.${realmId}.label`
        );
    }

    getRealmLabelStyle(realmId) {
        return localStorage.getItem(
            `${LOCAL_STORAGE_REALM_LABEL_KEY_PREFIX}.${realmId}.style`
        );
    }

    get hasRealms() {
        return this.realms && this.realms.length > 0;
    }

    get isAuthenticated() {
        return this.authenticated === true;
    }

    get isLoadingData() {
        return this.loading === true;
    }
}
