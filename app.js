const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const userRoutes = require('./server/routes/user');
const cors = require('cors')
const passport = require('passport');
require('./server/db/db');


const ClientManager = require('./server/utils/ClientManager')
const ChatroomManager = require('./server/utils/ChatroomManager')
const makeHandlers = require('./server/utils/handlers');
const { forEach } = require('./server/config/chatrooms');

const clientManager = ClientManager()
const chatroomManager = ChatroomManager()


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
const roomIdMap = new Map();

io.on('connection', function (client) {
  let username = client.handshake.query.username;
  if (username) {
    if (!userSocketIdMap.has(username)) {
      userSocketIdMap.set(username, new Set([client.id]));
    } else {
      userSocketIdMap.get(username).add(client.id);
    }
    let onlineUsers = Array.from(userSocketIdMap.keys());
    io.emit('online users', { Online: onlineUsers });
    let rooms = Array.from(roomIdMap.keys());
    io.emit('get rooms', { Rooms: rooms });
    /* Disconnect socket */
    client.on('disconnect', function () {
      let userSocketIdSet = userSocketIdMap.get(username);
      userSocketIdSet.delete(client.id);
      if (userSocketIdSet.size == 0) {
        userSocketIdMap.delete(username);
      }
      let onlineUsers = Array.from(userSocketIdMap.keys());
      io.emit('online users', { Online: onlineUsers });

      let room;
      for (let [key, value] of roomIdMap.entries()) {
        value.forEach(valueItem => {
          if (valueItem === username)
            room = key;
        });
      }
      let roomUsers = roomIdMap.get(room);
      var index = roomUsers.indexOf(username);
      roomUsers.splice(index, 1);
      if (roomUsers.size == 0) {
        roomIdMap.delete(room);
      }
      console.log(roomIdMap);

    });

    client.on('create', function (room, callback) {
      console.log('create:', roomIdMap);
      if (roomIdMap.has(room)) {
        callback('Room already existed.');
      }
      else {
        client.join(room);
        roomIdMap.set(room, new Array(username));
        let rooms = Array.from(roomIdMap.keys());
        io.emit('get rooms', { Rooms: rooms });
      }
    });

    client.on('join', function (room, callback) {
      if (roomIdMap.has(room)) {
        client.join(room);
        roomIdMap.get(room).push(username);
      }
      else {
        callback('Room does not exist.');
      }
    });

    client.on('chat', function (message) {
      let room;
      for (let [key, value] of roomIdMap.entries()) {
        value.forEach(valueItem => {
          if (valueItem === username)
            room = key;
        });
      }
      //console.log(room);
      let timestamp = (new Date()).toISOString();
      client.to(room).emit('chat', {
        username: username,
        message: message,
        time: timestamp
      });
    });


    client.on('step', function (step) {
      let room;
      for (let [key, value] of roomIdMap.entries()) {
        value.forEach(valueItem => {
          if (valueItem === username)
            room = key;
        });
      }
      console.log(room);
      let timestamp = (new Date()).toISOString();
      client.to(room).emit('step', {
        username: username,
        step: step,
        time: timestamp
      });
    });

  } else
    io.emit('Online-users', { Online: Array.from(userSocketIdMap.keys()) });
})


server.listen(port, () => {
  console.log(`Our server is running on port ${port}`);
});

module.exports.app = server;

