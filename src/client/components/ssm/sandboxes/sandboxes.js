import { LightningElement, api, track } from 'lwc';
import {
    getSandbox,
    getSandboxes,
    getOperations,
    runOperation,
    deleteSandbox
} from 'data/sandboxesService';

const PULL_TIMEOUT = 3000;
const MAX_CONCURRENT_PULL = 2;

export default class Sandboxes extends LightningElement {
    selectors = {
        sandboxesCount: '[data-js-sandboxes-count]',
        sandboxesPanels: 'ssm-sandbox-panel'
    };
    cache = {};
    @api realmid;
    @track sandboxes = [];
    @track loading = false;
    @track sandboxIdToDelete = undefined;
    sandboxesFetched = false;
    activePull = 0;

    renderedCallback() {
        if (this.cache.sandboxesCount) {
            return;
        }

        this.cache.sandboxesCount = this.template.querySelector(
            this.selectors.sandboxesCount
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
        getSandbox(sandboxId).then((sandboxResult) => {
            if (sandboxResult.error || !sandboxResult.data) {
                // Release the flag
                this.sandboxes[sandboxIdx].hasPendingOperation = false;
                this.dispatchEvent(
                    new CustomEvent('refreshauth', {
                        bubbles: true,
                        composed: true
                    })
                );
                return;
            }

            this.sandboxes[sandboxIdx] = sandboxResult.data;
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
            if (result.error || !result.data) {
                // Release the flag
                this.sandboxes[sandboxIdx].hasPendingOperation = false;
                this.dispatchEvent(
                    new CustomEvent('refreshauth', {
                        bubbles: true,
                        composed: true
                    })
                );
                return;
            }

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
            if (result.error) {
                // Remove the sandbox ID, meaning the prompt will be hidden
                this.sandboxIdToDelete = undefined;
                this.dispatchEvent(
                    new CustomEvent('refreshauth', {
                        bubbles: true,
                        composed: true
                    })
                );
                return;
            }

            // Remove the sandbox ID, meaning the prompt will be hidden
            this.sandboxIdToDelete = undefined;

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
            if (
                operationsResult.error ||
                !operationsResult.data ||
                operationsResult.data.length === 0
            ) {
                // Release the flag
                this.sandboxes[sandboxIdx].hasPendingOperation = false;
                // TODO
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
                if (sandboxResult.error || !sandboxResult.data) {
                    // Release the flag
                    this.sandboxes[sandboxIdx].hasPendingOperation = false;
                    // TODO
                    return;
                }

                this.sandboxes[sandboxIdx] = sandboxResult.data;
            });
        });
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
                if (result.error) {
                    this.loading = false;
                    this.dispatchEvent(
                        new CustomEvent('refreshauth', {
                            bubbles: true,
                            composed: true
                        })
                    );
                    return;
                }

                result.data = result.data.map((sandbox) => {
                    sandbox.hasPendingOperation =
                        ['starting', 'stopping'].indexOf(sandbox.state) > -1;
                    return sandbox;
                });

                this.loading = false;
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
}
