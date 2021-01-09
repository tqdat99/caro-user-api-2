const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const userRoutes = require('./server/routes/user');
const cors = require('cors')
const passport = require('passport');
require('dotenv').config()
require('./server/db/db');
const { addGame } = require("./server/controllers/game");

// set up dependencies
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(cors());
app.use(passport.initialize());
// set up port
const port = process.env.PORT;
// set up route
app.use('/users/', userRoutes);
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Project with Nodejs Express and MongoDB',
  });
});

const server = require('http').createServer(app);
const io = require('socket.io')(server);
const handleSocket = require('./server/socket/socket')
io.on('connection', socket => handleSocket(io, socket));

server.listen(port, () => {
  console.log(`Our server is running on port ${port}`);
});

module.exports.app = server;

