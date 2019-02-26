const express = require('express');
const bcrypt = require('bcryptjs');
const route = express.Router();
const db = require('../data/dbConfig.js');

const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

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
    store: new KnexSessionStore({
        knex: db,
        tablename: 'sessions',
        sidfieldname: 'sid',
        createtable: true,
        clearInterval: 1000*60*60,
    })
}

route.use(session(sessionConfig));

route.get('/', (req, res) => {
    res.catch(error => res.status(500).json({error, message:"Something went wrong!"}))
});

route.post('/api/register', (req, res) => {
    const user = req.body;
    const hash = bcrypt.hashSync(user.password, 12);

    user.password = hash;

    db('users').insert(req.body)
    .then(saved => {
        res.status(201).json(saved)
    })
    .catch(error => {
        res.status(500).json(error)
    });
});

route.post('/api/login', (req, res) => {
    const {username, password} = req.body;
    if ( username && password) {
        
        db('users').where({username}).first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                req.session.user = user;
                res.status(200).json({message: `Welcome ${username}!, have a cookie!`})
            } else { res.status(400).json({message: "Invalid credentials."}) }
        })
        .catch(error => res.status(500).json(error))
    } else {
        res.status(400).json({message: "Please provide credentials"})
    }
})

function restricted(req, res, next) {
    const {username, password} = req.headers;
    if ( req.session && req.session.user ) {
        next()
    } else {
        res.status(400).json({message: "Please provide credentials"})
    }
}

route.get('/api/users', restricted, (req, res) => {
    db('users')
    .then(users => {
        res.json(users)
    })
    .catch(err => res.send(err))
})

route.get('/api/logout', (req, res) => {
    if (session) {
        req.session.destroy();
        res.send('logged out')
    } else {
        res.end()
    }
})

module.exports = route;