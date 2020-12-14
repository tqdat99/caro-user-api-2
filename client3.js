const io = require('socket.io-client');

const socket = io('http://localhost:5034?username=dat3');

socket.on('connect', () => {
    console.log(socket.id);
    socket.emit('create', 'room2', function (error) {
        console.log(error);
    });
    socket.emit('chat', 'hi dat4');
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
