import { LightningElement, api, track } from 'lwc';
import {
    getSandbox,
    getSandboxes,
    getOperations,
    runOperation
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
    @track error;
    @track loading = false;
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

    handleRunOperation(e) {
        const sandboxId = e.detail.id;
        const operation = e.detail.operation;

        // Then the sandbox row as "running operation" state
        const sandboxIdx = this.sandboxes.findIndex(
            (sandbox) => sandbox.id === sandboxId
        );
        this.sandboxes[sandboxIdx].hasPendingOperation = true;
        // Set the status as pending by default
        this.sandboxes[sandboxIdx].state = 'pending';

        runOperation(sandboxId, operation).then((result) => {
            if (result.error || !result.data) {
                // Release the flag
                this.sandboxes[sandboxIdx].hasPendingOperation = false;
                // TODO
                return;
            }

            // Put the sandbox state as pending
            if (result.data.operationState === 'pending') {
                this.sandboxes[sandboxIdx].state = 'pending';
            }
            this.refreshSandboxRow(sandboxId, sandboxIdx, operation);
        });
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
                    this.error =
                        'Error while fetching sandboxes. Please ensure you are authenticated';
                    this.loading = false;
                    return;
                }

                result.data = result.data.map((sandbox) => {
                    sandbox.hasPendingOperation =
                        ['creating', 'starting', 'stopping'].indexOf(
                            sandbox.state
                        ) > -1;
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

    get hasError() {
        return typeof this.error !== 'undefined';
    }

    get isLoadingData() {
        return this.loading === true;
    }
}
