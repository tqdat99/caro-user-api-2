const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const userRoutes = require('./server/routes/user');
const cors = require('cors')
const passport = require('passport');
require('./server/db/db');

// set up dependencies
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));
//app.use(cors());
app.use(passport.initialize());

//app.use(cors({ credentials: false, origin: 'http://172.22.176.1:5500' })); '

app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', '*');
  next();
});

// set up routes
app.use('/users/', userRoutes);


// set up port
const port = process.env.PORT || 5034;
// set up route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Project with Nodejs Express and MongoDB',
  });
});

const server = require('http').createServer(app);
const io = require('socket.io')(server);
const userSocketIdMap = new Map();
const userSocketIdMap = new Map();


io.on('connection', function (socket) {
  console.log("socket.id:", socket.id);
  let userName = socket.handshake.query.userName;
  console.log(userName);
  if (userName) {
    if (!userSocketIdMap.has(userName)) {
      userSocketIdMap.set(userName, new Set([socket.id]));
    } else {
      userSocketIdMap.get(userName).add(socket.id);
    }
    let onlineUsers = Array.from(userSocketIdMap.keys());
    console.log(onlineUsers);
    io.emit('Online-users', { Online: onlineUsers });

    socket.on('create board')

    socket.on('chat', function (data) {
      io.emit('chat', data);
    });

    /* Disconnect socket */
    socket.on('disconnect', function () {
      if (userSocketIdMap.has(userName)) {
        let userSocketIdSet = userSocketIdMap.get(userName);
        userSocketIdSet.delete(socket.id);
        if (userSocketIdSet.size == 0) {
          userSocketIdMap.delete(userName);
        }
        let onlineUsers = Array.from(userSocketIdMap.keys());
        console.log(onlineUsers);
        io.emit('Online-users', { Online: onlineUsers });
      }
    });
  }
  else
    io.emit('Online-users', { Online: Array.from(userSocketIdMap.keys()) });
});

server.listen(port, () => {
  console.log(`Our server is running on port ${port}`);
});

module.exports.app = server;