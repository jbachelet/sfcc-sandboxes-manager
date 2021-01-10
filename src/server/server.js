'use strict';

const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');

const config = require('../config');
const HOST = process.env.HOST || config.defaults.host;
const PORT = process.env.PORT || config.defaults.port;
const SESSION_SECRET = process.env.SESSION_SECRET || 'sup3rS3cr3T@';
const SESSION_COOKIE = HOST === 'localhost' ? {} : config.sessionCookie;

const app = express();
app.set('trust proxy', 1);
app.use(cookieParser());
app.use(
    session({
        secret: SESSION_SECRET,
        name: 'sfcc_sandboxes_manager.session',
        cookie: SESSION_COOKIE,
        saveUninitialized: false,
        resave: false
    })
);
app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('hex');
    next();
});
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            'script-src': [
                "'self'",
                (req, res) => `'nonce-${res.locals.cspNonce}'`
            ]
        }
    })
);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(config.distDir));

// Routes handling
app.get('/', require('./controllers/index').index);
app.use('/auth', require('./routes/authentication'));
app.use('/sandboxes', require('./routes/sandboxes'));
app.use('/realms', require('./routes/realms'));

app.listen(PORT, () =>
    console.log(
        `✅  Server started: http${
            HOST === 'localhost' ? '' : 's'
        }://${HOST}:${PORT}`
    )
);
