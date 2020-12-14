'use strict';

const fs = require('fs');
const path = require('path');

const FOLDER = './dist/resources/slds/styles';
const TO_BE_REPLACED = /\/assets\//g;
const VALUE_TO_APPLY = '/resources/slds/';

function readFiles(dir, processFile) {
    // read directory
    fs.readdir(dir, (error, fileNames) => {
        if (error) {
            throw error;
        }

        fileNames.forEach((filename) => {
            const filepath = path.resolve(dir, filename);

            // get information about the file
            fs.stat(filepath, (err, stat) => {
                if (err) {
                    throw error;
                }

                // check if the current path is a file or a folder
                const isFile = stat.isFile();

                // exclude folders
                if (isFile) {
                    // callback, do something with the file
                    processFile(filepath);
                }
            });
        });
    });
}

const run = () => {
    readFiles(path.resolve(FOLDER), (filepath) => {
        console.info(`Renaming values in file ${filepath}`);
        fs.readFile(filepath, 'utf8', (err, data) => {
            if (err) {
                throw err;
            }

            const result = data.replace(TO_BE_REPLACED, VALUE_TO_APPLY);

            fs.writeFile(filepath, result, 'utf8', (error) => {
                if (err) {
                    throw error;
                }
            });
        });
    });
};

run();
