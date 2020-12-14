const io = require('socket.io-client');

const socket = io('https://caro-user-api-2.herokuapp.com?username=dat4');

socket.on('connect', () => {
  console.log(socket.id);
  socket.emit('join', 'room2', function (error) {
    console.log(error);
  });
  socket.emit('chat', 'hi dat3');
  socket.emit('step', [1, 2]);

});

socket.on('chat', function (data) {
  console.log(data);
});

socket.on('online users', function (data) {
  console.log(data);
});

socket.on('get rooms', function (data) {
  console.log(data);
});

socket.on('step', function (data) {
  console.log(data);
});
