const express = require('express');
const bcrypt = require('bcryptjs');
const route = express.Router();
const db = require('../data/dbConfig.js')


route.get('/api/users', (req, res) => {
    db('users')
    .then(response => res.status(200).json(response))
    .catch(error => res.status(500).json({error, message:"Something went wrong!"}))
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

// route.get('/api/login', (req, res) => {

// })

function restricted(req, res, next) {
    const {username, password} = req.body;
    if ( username && password) {
        db('users').where({username}).first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                res.status(200).json(user)
            } else { res.status(400).json({message: "Invalid credentials."}) }
        })
        .catch(error => res.status(500).json(error))
    } else {
        res.status(400).json({message: "Please provide credentials"})
    }
}

route.post('/api/login', restricted, (req, res) => {
    db('users').select('id', 'username', 'password')
    .then(users => {
        res.json(users)
    })
    .catch(err => res.send(err))
})

module.exports = route;