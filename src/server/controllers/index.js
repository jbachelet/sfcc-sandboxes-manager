'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const config = require('../../config');

const readFile = util.promisify(fs.readFile);

exports.index = async (req, res) => {
    // Have to parse the index HTML to replace the nonce placeholders with server-side values
    readFile(path.resolve(config.distDir, 'index.html'), 'utf8').then(
        (indexHTML) => {
            indexHTML = indexHTML.replace(/{nonce}/g, res.locals.cspNonce);
            res.set('Content-Type', 'text/html');
            console.log(indexHTML);
            res.send(indexHTML);
        }
    );
};
