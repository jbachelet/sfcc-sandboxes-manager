'use strict';

const path = require('path');

const config = require('../../config');

exports.index = (req, res) =>
    res.sendFile(path.resolve(config.distDir, 'index.html'));
