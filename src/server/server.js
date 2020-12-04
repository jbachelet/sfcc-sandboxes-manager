'use strict';

const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const bodyParser = require('body-parser');

const config = require('../config');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3001;

const app = express();
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(express.static(config.distDir));

app.use('/', require('./router'));

app.listen(PORT, () =>
    console.log(`✅  Server started: http://${HOST}:${PORT}`)
);
