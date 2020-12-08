const io = require('socket.io-client');

const socket = io('http://localhost:5035?userName=tom2');

socket.on('connect', () => {
    console.log(socket.id);
});
socket.on('Online-users', function (data) {
    console.log(data);
});