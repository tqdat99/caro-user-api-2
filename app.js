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
app.use(cors());
app.use(passport.initialize());

// set up port
const port = process.env.PORT || 5034;
// set up route
app.use('/users/', userRoutes);
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
  if (username !== 'null') {
    console.log('CONNECT: ', username)
    /* Handshake socket */
    if (!userSocketIdMap.has(username)) {
      userSocketIdMap.set(username, new Set([client.id]));
    } else {
      userSocketIdMap.get(username).add(client.id);
    }
    let onlineUsers = Array.from(userSocketIdMap.keys());
    io.emit('Online-users', { Online: onlineUsers });
    io.emit('Get-rooms', { Rooms: Array.from(roomIdMap) });

    /* Disconnect socket */
    client.on('disconnect', function () {
      console.log('DISCONNECT: ', username)
      let userSocketIdSet = userSocketIdMap.get(username);
      userSocketIdSet.delete(client.id);
      if (userSocketIdSet.size === 0) {
        userSocketIdMap.delete(username);
      }
      let onlineUsers = Array.from(userSocketIdMap.keys());

      let room = null
      for (let [key, value] of roomIdMap.entries()) {
        value.forEach(valueItem => {
          if (valueItem === username)
            room = key;
        });
      }
      if (room) {
        let roomUsers = roomIdMap.get(room);
        const index = roomUsers.indexOf(username);
        roomUsers.splice(index, 1);
        if (roomUsers.size === 0) {
          roomIdMap.delete(room);
        } else if (roomUsers.size > 0) {
          io.to(room).emit('Room-Data', {room: room, players: roomIdMap.get(room)});
        }
      }

      io.emit('Online-users', { Online: onlineUsers });
      io.emit('Get-rooms', { Rooms: Array.from(roomIdMap) });
    });

    /*Create room*/
    client.on('Create-room', function (room, callback) {
      if (roomIdMap.has(room)) {
        callback({
          success: false,
          message: 'Room already existed. Please choose different id.'
        });
      } else {
        client.join(room);
        roomIdMap.set(room, new Array(username));
        io.emit('Get-rooms', {Rooms: Array.from(roomIdMap)});

        callback({
          success: true
        });
      }
    });

    /*Join room*/
    client.on('Join-room', function (room, callback) {
      if (roomIdMap.has(room) &&
          !roomIdMap.get(room).find(user => user === username) &&
          roomIdMap.get(room).length < 2) {
        client.join(room);
        roomIdMap.get(room).push(username);
        io.emit('Get-rooms', {Rooms: Array.from(roomIdMap)});
        callback({
          success: true
        })
      } else {
        if (!roomIdMap.has(room)) {
          callback({
            success: false,
            message: 'Room does not exist'
          });
        } else if (roomIdMap.get(room).find(user => user === username)) {
          callback({
            success: false,
            message: 'You have already in this room.'
          })
        } else if (!(roomIdMap.get(room).length < 2)) {
          callback({
            success: false,
            message: 'Room is full. Please choose different room or create new room.'
          })
        }
      }
    });

    client.on('In-room', function(room) {
      io.to(room).emit('Room-Data', { room: room, players: roomIdMap.get(room)});
    })

     /*Chat*/
    client.on('Send-Message', function (message) {
      let room = null
      for (let [key, value] of roomIdMap.entries()) {
        value.forEach(valueItem => {
          if (valueItem === username)
            room = key;
        });
      }
      let timestamp = (new Date()).toISOString();
      io.to(room).emit('Get-Message', {
        username: username,
        message: message,
        time: timestamp
      });
    });

    /*Play move*/
    client.on('Play-Move', function (data) {
      let room = null
      for (let [key, value] of roomIdMap.entries()) {
        value.forEach(valueItem => {
          if (valueItem === username)
            room = key;
        });
      }

      let timestamp = (new Date()).toISOString();
      io.to(room).emit('Get-Move', {
        username: username,
        move: data.move,
        letter: data.letter,
        time: timestamp
      });
    });

    /*Undo move*/
    client.on('Undo-Move', index => {
      let room = null
      for (let [key, value] of roomIdMap.entries()) {
        value.forEach(valueItem => {
          if (valueItem === username)
            room = key;
        });
      }
      io.to(room).emit('Undo-Move', index)
    })
  } else
    io.emit('Online-users', { Online: Array.from(userSocketIdMap.keys()) });
  })

server.listen(port, () => {
  console.log(`Our server is running on port ${port}`);
});


module.exports.app = server;

