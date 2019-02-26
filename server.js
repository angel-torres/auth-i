const express = require('express');
const server = express();
const authRoute = require('./routes/authRoutes.js')

server.use(express.json());
server.use('/', authRoute)


module.exports = server;