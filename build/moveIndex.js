'use strict';

const fs = require('fs');
const path = require('path');

const FOLDER = './dist';

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

                // exclude folders
                if (stat.isFile()) {
                    // callback, do something with the file
                    processFile(filepath);
                }
            });
        });
    });
}

const run = () => {
    readFiles(path.resolve(FOLDER), (filepath) => {
        const filename = filepath.split('/').pop();
        if (filename !== 'index.html') {
            return;
        }

        fs.rename(filepath, path.resolve(FOLDER, 'page.html'), (err) => {
            if (err) {
                throw err;
            }

            console.log('Index file renamed.');
        });
    });
};

run();
