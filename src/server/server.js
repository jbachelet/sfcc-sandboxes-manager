'use strict';

const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const config = require('../config');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3001;
const SESSION_SECRET = process.env.SESSION_SECRET || 'sup3rS3cr3T@';

const app = express();
app.use(
    session({
        secret: SESSION_SECRET,
        name: 'sfcc_sandboxes_manager.session',
        cookie: {
            httpOnly: true,
            secure: true,
            sameSite: true,
            maxAge: 600000 // Time is in miliseconds
        },
        saveUninitialized: false,
        resave: false
    })
);
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(config.distDir));

// Routes handling
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/authentication'));
app.use('/sandboxes', require('./routes/sandboxes'));
app.use('/realms', require('./routes/realms'));

app.listen(PORT, () =>
    console.log(`✅  Server started: https://${HOST}:${PORT}`)
);
