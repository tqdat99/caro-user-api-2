const io = require('socket.io-client');

const socket = io('https://caro-user-api.herokuapp.com?userName=tom');

socket.on('connect', () => {
    console.log(socket.id);
});
socket.on('Online-users', function (data) {
    console.log(data);
});