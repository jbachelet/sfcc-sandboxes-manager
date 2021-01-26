import { LightningElement, api, track } from 'lwc';
import {
    createSandbox,
    getSandbox,
    getSandboxes,
    getOperations,
    runOperation,
    deleteSandbox
} from 'data/sandboxesService';
import { handleResponse, displayToast } from 'helpers/ui';

const PULL_TIMEOUT = 3000;
const MAX_CONCURRENT_PULL = 2;

export default class Sandboxes extends LightningElement {
    selectors = {
        sandboxesCount: '[data-js-sandboxes-count]',
        sandboxesPanels: 'ssm-sandbox-panel',
        sandboxesRows: 'ssm-sandbox-row',
        sandboxesFilterOnlyMine: '[ data-js-sandbox-filter-onlymine]',
        sandboxesFilterIncludeDeleted:
            '[ data-js-sandbox-filter-include-deleted]'
    };
    cache = {};
    @api realmid;
    @api userinfos;
    @track sandboxes = [];
    @track loading = false;
    @track sandboxIdToDelete = undefined;
    sandboxesFetched = false;
    activePull = 0;

    renderedCallback() {
        this.cache.sandboxesCount = this.template.querySelector(
            this.selectors.sandboxesCount
        );

        this.cache.sandboxesFilterOnlyMine = this.template.querySelector(
            this.selectors.sandboxesFilterOnlyMine
        );

        this.cache.sandboxesFilterIncludeDeleted = this.template.querySelector(
            this.selectors.sandboxesFilterIncludeDeleted
        );
    }

    handleOpenPanel(e) {
        const sandboxId = e.detail.id;
        // Apply selection
        Array.from(
            this.template.querySelectorAll(this.selectors.sandboxesPanels)
        ).forEach((elem) => elem.toggle(sandboxId === elem.sandboxid));
    }

    handleRefreshSandbox(e) {
        const sandboxId = e.detail.id;
        const sandboxIdx = this.sandboxes.findIndex(
            (sandbox) => sandbox.id === sandboxId
        );
        // Set the sandbox row as "running operation" state
        this.sandboxes[sandboxIdx].hasPendingOperation = true;

        // Refresh the sandbox
        getSandbox(sandboxId).then((result) => {
            if (!handleResponse(this, result)) {
                // Release the flag
                this.sandboxes[sandboxIdx].hasPendingOperation = false;
                return;
            }

            this.sandboxes[sandboxIdx] = result.data;
        });
    }

    handleRunOperation(e) {
        const sandboxId = e.detail.id;
        const operation = e.detail.operation;

        const sandboxIdx = this.sandboxes.findIndex(
            (sandbox) => sandbox.id === sandboxId
        );
        // Set the sandbox row as "running operation" state
        this.sandboxes[sandboxIdx].hasPendingOperation = true;
        // Set the status as pending by default
        this.sandboxes[sandboxIdx].state = 'pending';

        runOperation(sandboxId, operation).then((result) => {
            if (!handleResponse(this, result)) {
                // Release the flag
                this.sandboxes[sandboxIdx].hasPendingOperation = false;
                return;
            }

            // Display toast for success
            displayToast(
                this,
                `The "${operation}" operation has been started.`
            );

            // Put the sandbox state as pending
            if (result.data.operationState === 'pending') {
                this.sandboxes[sandboxIdx].state = 'pending';
            }
            this.refreshSandboxRow(sandboxId, sandboxIdx, operation);
        });
    }

    handleDeleteSandbox(e) {
        // Set the sandbox ID to delete
        // This opens up the confirmation prompt
        this.sandboxIdToDelete = e.detail.id;
    }

    handleDeleteSandboxConfirm() {
        const sandboxId = this.sandboxIdToDelete;
        const sandboxIdx = this.sandboxes.findIndex(
            (sandbox) => sandbox.id === this.sandboxIdToDelete
        );

        deleteSandbox(this.sandboxIdToDelete).then((result) => {
            // Remove the sandbox ID, meaning the prompt will be hidden
            this.sandboxIdToDelete = undefined;

            if (!handleResponse(this, result)) {
                return;
            }

            // Display toast for success
            displayToast(
                this,
                'The sandbox deletion operation has been started.'
            );

            // Put the sandbox state as pending
            if (result.data.operationState === 'pending') {
                this.sandboxes[sandboxIdx].state = 'pending';
            }
            this.refreshSandboxRow(sandboxId, sandboxIdx);
        });
    }

    handleDeleteSandboxCancel() {
        // Remove the sandbox ID, meaning the prompt will be hidden
        this.sandboxIdToDelete = undefined;
    }

    handleRefresh() {
        this.refreshView(true);
    }

    refreshSandboxRow(sandboxId, sandboxIdx, operation) {
        sandboxIdx =
            sandboxIdx ||
            this.sandboxes.findIndex((sandbox) => sandbox.id === sandboxId);

        if (this.activePull === MAX_CONCURRENT_PULL) {
            // In case we have the maximum active concurrent pulls in progress, abort
            return;
        }

        this.activePull++;
        getOperations(sandboxId, operation).then((operationsResult) => {
            this.activePull--;

            if (!handleResponse(this, operationsResult)) {
                // Release the flag
                this.sandboxes[sandboxIdx].hasPendingOperation = false;
                return;
            }

            const lastOperation = operationsResult.data[0];
            // If the operation is not finished yet, then pull the operations details in 1sec
            if (lastOperation.operationState !== 'finished') {
                setTimeout(
                    () =>
                        this.refreshSandboxRow(
                            sandboxId,
                            sandboxIdx,
                            operation
                        ),
                    PULL_TIMEOUT
                );
                return;
            }

            // The operation is finished, let's retrieve the latest sandbox state
            getSandbox(sandboxId).then((sandboxResult) => {
                if (!handleResponse(this, sandboxResult)) {
                    // Release the flag
                    this.sandboxes[sandboxIdx].hasPendingOperation = false;
                    return;
                }

                this.sandboxes[sandboxIdx] = sandboxResult.data;
            });
        });
    }

    handleCreateSandbox(e) {
        e.preventDefault();
        this.template.querySelector('ssm-newsandboxmodal').toggleModal(true);
    }

    handleSandboxCreation(e) {
        this.loading = true;

        createSandbox(
            e.detail.realmId,
            e.detail.ttl,
            e.detail.ocapiSettings,
            e.detail.webdavSettings
        ).then((result) => {
            this.loading = false;

            if (!handleResponse(this, result)) {
                return;
            }

            // Display toast for success
            displayToast(
                this,
                'The sandbox creation operation has been started.'
            );
            this.refreshView(true);
        });
    }

    handleFilterOnlyMineChange() {
        this.filterSandboxList();
    }

    handleFilterIncludeDeletedChange() {
        this.filterSandboxList();
    }

    filterSandboxList() {
        const isOnlyMineCheked = this.cache.sandboxesFilterOnlyMine.checked;
        const isIncludeDeletedCheked = this.cache.sandboxesFilterIncludeDeleted
            .checked;
        const sandboxRows = Array.from(
            this.template.querySelectorAll(this.selectors.sandboxesRows)
        );

        // Hide all rows by default
        sandboxRows.forEach((sandboxRow) => sandboxRow.toggleRow(false));

        // Then show only the ones that we need to show
        sandboxRows
            .filter((sandboxRow) => {
                let showRow = true;

                if (isOnlyMineCheked) {
                    showRow =
                        sandboxRow.sandbox.createdBy === this.userinfos.id;
                }

                if (!isIncludeDeletedCheked) {
                    showRow = showRow && sandboxRow.sandbox.state !== 'deleted';
                }

                return showRow;
            })
            .forEach((sandboxRow) => sandboxRow.toggleRow(true));
    }

    @api
    refreshView(forceRefresh) {
        // If the sandboxes list has already been fetched, abort
        if (this.sandboxesFetched && !forceRefresh) {
            return;
        }

        this.loading = true;
        getSandboxes(this.realmid)
            .then((result) => {
                this.loading = false;

                if (!handleResponse(this, result)) {
                    return;
                }

                result.data = result.data.map((sandbox) => {
                    sandbox.hasPendingOperation =
                        ['starting', 'stopping'].indexOf(sandbox.state) > -1;
                    return sandbox;
                });

                this.sandboxes = result.data;
                this.cache.sandboxesCount.innerText = this.sandboxes.length;
                this.sandboxesFetched = true;
            })
            .then(() => {
                // In case some sandboxes are in pending operations, start pulling the details
                this.sandboxes.forEach((sandbox) => {
                    if (sandbox.hasPendingOperation) {
                        // Start pulling the details
                        this.refreshSandboxRow(sandbox.id);
                    }
                });

                this.filterSandboxList();
            });
    }

    get hasSandboxes() {
        return this.sandboxes && this.sandboxes.length > 0;
    }

    get isLoadingData() {
        return this.loading === true;
    }

    get showDeletePrompt() {
        return this.sandboxIdToDelete !== undefined;
    }

    get hasUserInfos() {
        return this.userinfos !== undefined;
    }
}
