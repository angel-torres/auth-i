const express = require('express');
const helmet = require('helmet');
const cors = require('cors')
const server = express();
const session = require('express-session');
const authRoute = require('./routes/authRoutes.js');
// const KnexSessionStore = require('connect-session-knex')(session);
// const db = require('./data/dbConfig.js');

const sessionConfig = {
    name: 'sess',
    secret: 'dogs are cool',
    cookie: {
        maxAge: 1000*60*60,
        secure: false,
    },
    httpOnly: true,
    resave: false,
    saveUninitialized: false,
    // store: new KnexSessionStore({
    //     knex: db,
    //     tablename: 'sessions',
    //     sidfieldname: 'sid',
    //     createtable: true,
    //     clearInterval: 1000*60*60,
    // })
}

server.use(express.json());
server.use(cors());
server.use(helmet());
server.use(session(sessionConfig));
server.use('/', authRoute);


module.exports = server;