'use strict';

const sfccci = require('sfcc-ci');

exports.list = (req, res) => {
    sfccci.sandbox
        .list()
        .then((sandboxes) => res.json(sandboxes))
        .catch((e) => {
            console.error(e);
            res.status(500).json({
                error: true,
                message: e
            });
        });
};
exports.create = (req, res) => res.send('TODO');
exports.get = (req, res) => res.send('TODO');
exports.update = (req, res) => res.send('TODO');
exports.delete = (req, res) => res.send('TODO');
exports.listOperations = (req, res) => res.send('TODO');
exports.runOperation = (req, res) => res.send('TODO');
exports.getOperation = (req, res) => res.send('TODO');
