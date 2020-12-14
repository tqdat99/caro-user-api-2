// const io = require('socket.io-client');

// const socket = io('http://localhost:5034?userName=tom4');

// socket.on('connect', () => {
//     console.log(socket.id);
// });

// socket.on('Online-users', function (data) {
//     console.log(data);
// });

const io = require('socket.io-client')

  const socket = io.connect('http://localhost:5035')

  socket.on('connect', () => {
    console.log(socket.id);
});

  function registerHandler(onMessageReceived) {
    socket.on('message', onMessageReceived)
  }

  function unregisterHandler() {
    socket.off('message')
  }

  socket.on('error', function (err) {
    console.log('received socket error:')
    console.log(err)
  })

  function register(name, cb) {
    socket.emit('register', name, cb)
  }

  function join(chatroomName, cb) {
    socket.emit('join', chatroomName, cb)
  }

  function leave(chatroomName, cb) {
    socket.emit('leave', chatroomName, cb)
  }

  function message(chatroomName, msg, cb) {
    socket.emit('message', { chatroomName, message: msg }, cb)
  }

  function getChatrooms(cb) {
    socket.emit('chatrooms', null, cb)
  }

  function getAvailableUsers(cb) {
    socket.emit('availableUsers', null, cb)
  }