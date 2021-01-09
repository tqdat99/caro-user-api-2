const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const userRoutes = require('./server/routes/user');
const cors = require('cors')
const passport = require('passport');

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
const handleSocket = require('./server/socket/socket')
io.on('connection', socket => handleSocket(io, socket));

// const BOARD_SIZE = 15
// const usersMap = new Map()
// const roomsMap = new Map()
// io.on('connection', (socket) => {
//   /*ON CONNECTION*/
//   console.log('SOMEONE CONNECTED: ', socket.id)
//   const user = socket.handshake.query.username
//   if (usersMap.has(user)) {
//     usersMap.get(user).add(socket.id)
//   } else {
//     usersMap.set(user, new Set([socket.id]));
//   }
//   io.emit('Online-Users', Array.from(usersMap.keys()))
//   io.emit('Active-Rooms', Array.from(roomsMap.values()))
//
//   /*ON DISCONNECT*/
//   socket.on('disconnect', () => {
//     console.log('SOMEONE DISCONNECTED: ', socket.id)
//     let userSocketIdSet = usersMap.get(user);
//     userSocketIdSet.delete(socket.id);
//     if (userSocketIdSet.size === 0) {
//       usersMap.delete(user);
//     }
//   })
//
//   /*ON FIND RANDOM ROOM*/
//   socket.on('Find-Random-Room', (data, callback) => {
//     console.log('SOMEONE FIND RANDOM ROOM: ', data)
//       const availableRoom = Array.from(roomsMap.values()).find(room => room.roomType === 'random' && room.players.length < 2)
//       if (availableRoom) {
//         //CREATE
//       } else {
//         //JOIN
//       }
//   })
//
//   /*ON CREATE ROOM*/
//   socket.on('Create-Room', (data, callback) => {
//     console.log('SOMEONE CREATED ROOM: ', data)
//
//     // save
//     const roomId = new Date().getTime()
//     const newRoom = {
//       roomInfo: {
//         roomId: roomId,
//         roomType: data.roomType,
//         roomName: data.roomName,
//         roomPassword: data.roomPassword,
//         players: [user],
//         watchers: [],
//       },
//       currentGame: {
//         isXTurn: true,
//         turn: {
//           move_x: user
//         },
//         history: [
//           Array(BOARD_SIZE * BOARD_SIZE).fill(null)
//         ],
//         messages: [
//           {
//             sender: 'admin',
//             message:`${user} has joined room.`
//           }
//         ]
//       }
//     }
//     roomsMap.set(roomId, newRoom)
//
//     // broadcast
//     callback(newRoom)
//     socket.join(roomId)
//     io.emit('Active-Rooms', Array.from(roomsMap.values()))
//   })
//
//   /*ON JOIN ROOM*/
//   socket.on('Join-Room', (data, callback) => {
//     console.log('SOMEONE JOINED ROOM: ', data)
//
//     // save
//     let room = roomsMap.get(data.roomId)
//     room.currentGame.messages.push({
//       sender: 'admin',
//       message:`${user} has joined room.`
//     })
//     if (data.join_as === 'player') {
//       room.roomInfo.players.push(user)
//       room.currentGame.turn.move_o = user
//     } else if (data.join_as === 'watcher') {
//       room.roomInfo.watchers.push(user)
//     }
//
//     // broadcast
//     callback(room)
//     socket.join(data.roomId)
//     io.to(data.roomId).emit('Update-Room', room)
//     io.emit('Active-Rooms', Array.from(roomsMap.values()))
//     if (data.join_as === 'player') io.to(data.roomId).emit('Game-Start')
//   })
//
//   /*ON PLAY MOVE*/
//   socket.on('Play-Move', (data) => {
//     console.log('SOMEONE PLAY MOVE: ', data)
//
//     // save
//     let room = roomsMap.get(data.roomId)
//     room.currentGame.isXTurn = !room.currentGame.isXTurn
//     const current = room.currentGame.history[room.currentGame.history.length - 1].slice()
//     current[data.move] = data.letter
//     room.currentGame.history.push(current)
//
//     //
//     io.to(data.roomId).emit('Move', data)
//     const result = calculateWinner(current, [Math.floor(data.move / BOARD_SIZE), data.move % BOARD_SIZE], BOARD_SIZE, data.letter)
//     if (result) {
//       // save to database: turn, history, messages, roomid, room name
//       addGame({
//         room: room.roomInfo.roomName,
//         playedDate: new Date().toUTCString(),
//         game: room.currentGame
//       })
//
//       // reset
//       room.roomInfo.players = []
//       room.roomInfo.watchers = []
//       room.currentGame.isXTurn = true
//       room.currentGame.turn = {move_x: null, move_o: null}
//       room.currentGame.history = [Array(BOARD_SIZE * BOARD_SIZE).fill(null)]
//       room.currentGame.messages=[]
//
//       // broadcast
//       io.to(data.roomId).emit('Game-State', {
//         line: result.line,
//         status: user,
//         message: `The winner is... ${user}!`
//       })
//     } else if (checkBoardFull(current)) {
//       // save to database: turn, history, messages, roomid, room name
//
//       // reset
//       room.roomInfo.players = []
//       room.roomInfo.watchers = []
//       room.currentGame.isXTurn = true
//       room.currentGame.turn = {move_x: null, move_o: null}
//       room.currentGame.history = [Array(BOARD_SIZE * BOARD_SIZE).fill(null)]
//       room.currentGame.messages=[]
//
//       // broadcast
//       io.to(data.roomId).emit('Game-State', {
//         line: [],
//         status: 'draw',
//         message: `Result is a draw!`
//       })
//     }
//   })
//
//   /*ON NEW GAME REQUEST*/
//   socket.on('New-Game', (data) => {
//     console.log('SOMEONE REQUEST NEW GAME: ', data)
//
//     // save
//     let room = roomsMap.get(data.roomId)
//     console.log('MOVE_O: ', room.currentGame.turn.move_o)
//     if (data.join_as === 'player') {
//       room.roomInfo.players.push(user)
//       if (room.currentGame.turn.move_x === null) {
//         room.currentGame.turn.move_x = user
//       } else if (room.currentGame.turn.move_o === null) {
//         room.currentGame.turn.move_o = user
//       }
//     } else if (data.join_as === 'watcher') {
//       room.roomInfo.watchers.push(user)
//     }
//     room.currentGame.messages.push({
//       sender: 'admin',
//       message:`${user} has joined room.`
//     })
//
//     // broadcast
//     io.to(socket.id).emit('Update-Game', room)
//     io.emit('Active-Rooms', Array.from(roomsMap.values()))
//     if (room.currentGame.turn.move_x && room.currentGame.turn.move_o && data.join_as === 'player') {
//       io.to(data.roomId).emit('Update-Room', room)
//       io.to(data.roomId).emit('Game-Start')
//     }
//   })
//
//   /*ON RECEIVED MESSAGES*/
//   socket.on('Send-Message', (data) => {
//     console.log('SOMEONE SEND MESSAGE: ', data)
//
//     // saved
//     let room = roomsMap.get(data.roomId)
//     room.currentGame.messages.push({
//       sender: user,
//       message: data.message
//     })
//
//     // broadcast
//     io.to(data.roomId).emit('Message',{
//       sender: user,
//       message: data.message
//     })
//   })
//
//   /*ON SURRENDER*/
//   socket.on('Request-Surrender', (data) => {
//     console.log('SOMEONE SURRENDER: ', data)
//
//     let room = roomsMap.get(data.roomId)
//     // save to database: turn, history, messages, roomid, room name
//
//     // reset
//     room.roomInfo.players = []
//     room.roomInfo.watchers = []
//     room.currentGame.isXTurn = true
//     room.currentGame.turn = {move_x: null, move_o: null}
//     room.currentGame.history = [Array(BOARD_SIZE * BOARD_SIZE).fill(null)]
//     room.currentGame.messages=[]
//
//     // broadcast
//     io.to(data.roomId).emit('Game-State', {
//       line: [],
//       status: user,
//       message: `${user} has surrendered!`
//     })
//   })
//
//   /*ON TIME OUT*/
//   socket.on('Time-Out', (data) => {
//     console.log('SOMEONE RAN OUT OF TIME: ', data)
//
//     let room = roomsMap.get(data.roomId)
//     // save to database: turn, history, messages, roomid, room name
//
//     // reset
//     room.roomInfo.players = []
//     room.roomInfo.watchers = []
//     room.currentGame.isXTurn = true
//     room.currentGame.turn = {move_x: null, move_o: null}
//     room.currentGame.history = [Array(BOARD_SIZE * BOARD_SIZE).fill(null)]
//     room.currentGame.messages=[]
//
//     // broadcast
//     io.to(data.roomId).emit('Game-State', {
//       line: [],
//       status: user,
//       message: `${user} has ran out of time!`
//     })
//   })
// })

// const userSocketIdMap = new Map();
// const roomIdMap = new Map();
// io.on('connection', function (client) {
//   let username = client.handshake.query.username;
//   if (username !== 'null') {
//     console.log('CONNECT: ', username)
//     /* Handshake socket */
//     if (!userSocketIdMap.has(username)) {
//       userSocketIdMap.set(username, new Set([client.id]));
//     } else {
//       userSocketIdMap.get(username).add(client.id);
//     }
//     let onlineUsers = Array.from(userSocketIdMap.keys());
//     io.emit('Online-users', { Online: onlineUsers });
//     io.emit('Get-rooms', { Rooms: Array.from(roomIdMap) });
//
//     /* Disconnect socket */
//     client.on('disconnect', function () {
//       console.log('DISCONNECT: ', username)
//       let userSocketIdSet = userSocketIdMap.get(username);
//       userSocketIdSet.delete(client.id);
//       if (userSocketIdSet.size === 0) {
//         userSocketIdMap.delete(username);
//       }
//       let onlineUsers = Array.from(userSocketIdMap.keys());
//
//       let room = null
//       for (let [key, value] of roomIdMap.entries()) {
//         value.forEach(valueItem => {
//           if (valueItem === username)
//             room = key;
//         });
//       }
//       if (room) {
//         let roomUsers = roomIdMap.get(room);
//         const index = roomUsers.indexOf(username);
//         roomUsers.splice(index, 1);
//         if (roomUsers.size === 0) {
//           roomIdMap.delete(room);
//         } else if (roomUsers.size > 0) {
//           io.to(room).emit('Room-Data', {room: room, players: roomIdMap.get(room)});
//         }
//       }
//
//       io.emit('Online-users', { Online: onlineUsers });
//       io.emit('Get-rooms', { Rooms: Array.from(roomIdMap) });
//     });
//
//     /*Create room*/
//     client.on('Create-room', function (room, callback) {
//       if (roomIdMap.has(room)) {
//         callback({
//           success: false,
//           message: 'Room already existed. Please choose different id.'
//         });
//       } else {
//         client.join(room);
//         roomIdMap.set(room, new Array(username));
//         io.emit('Get-rooms', {Rooms: Array.from(roomIdMap)});
//
//         callback({
//           success: true
//         });
//       }
//     });
//
//     /*Join room*/
//     client.on('Join-room', function (room, callback) {
//       if (roomIdMap.has(room) &&
//           !roomIdMap.get(room).find(user => user === username) &&
//           roomIdMap.get(room).length < 2) {
//         client.join(room);
//         roomIdMap.get(room).push(username);
//         io.emit('Get-rooms', {Rooms: Array.from(roomIdMap)});
//         callback({
//           success: true
//         })
//       } else {
//         if (!roomIdMap.has(room)) {
//           callback({
//             success: false,
//             message: 'Room does not exist'
//           });
//         } else if (roomIdMap.get(room).find(user => user === username)) {
//           callback({
//             success: false,
//             message: 'You have already in this room.'
//           })
//         } else if (!(roomIdMap.get(room).length < 2)) {
//           callback({
//             success: false,
//             message: 'Room is full. Please choose different room or create new room.'
//           })
//         }
//       }
//     });
//
//     client.on('In-room', function(room) {
//       io.to(room).emit('Room-Data', { room: room, players: roomIdMap.get(room)});
//     })
//
//      /*Chat*/
//     client.on('Send-Message', function (message) {
//       let room = null
//       for (let [key, value] of roomIdMap.entries()) {
//         value.forEach(valueItem => {
//           if (valueItem === username)
//             room = key;
//         });
//       }
//       let timestamp = (new Date()).toISOString();
//       io.to(room).emit('Get-Message', {
//         username: username,
//         message: message,
//         time: timestamp
//       });
//     });
//
//     /*Play move*/
//     client.on('Play-Move', function (data) {
//       let room = null
//       for (let [key, value] of roomIdMap.entries()) {
//         value.forEach(valueItem => {
//           if (valueItem === username)
//             room = key;
//         });
//       }
//
//       let timestamp = (new Date()).toISOString();
//       io.to(room).emit('Get-Move', {
//         username: username,
//         move: data.move,
//         letter: data.letter,
//         time: timestamp
//       });
//     });
//
//     /*Undo move*/
//     client.on('Undo-Move', index => {
//       let room = null
//       for (let [key, value] of roomIdMap.entries()) {
//         value.forEach(valueItem => {
//           if (valueItem === username)
//             room = key;
//         });
//       }
//       io.to(room).emit('Undo-Move', index)
//     })
//   } else
//     io.emit('Online-users', { Online: Array.from(userSocketIdMap.keys()) });
//   })

server.listen(port, () => {
  console.log(`Our server is running on port ${port}`);
});

module.exports.app = server;

