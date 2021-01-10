'use strict';

module.exports = {
    defaults: {
        host: 'localhost',
        port: 8080
    },
    distDir: './dist',
    sessionCookie: {
        httpOnly: true,
        secure: true,
        sameSite: true,
        maxAge: 86400 // Time is in miliseconds
    }
};
