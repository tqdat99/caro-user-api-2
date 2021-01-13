const checkResult = require("./checkResult");
const { updateUserAfterGame } = require("../controllers/user");
const { getUserBeforeUpdate } = require("../controllers/user");
const { addGame } = require("../controllers/game");
const BOARD_SIZE = 20
const usersMap = new Map()
const roomsMap = new Map()
let randomRoom = []

module.exports = function (io, socket) {
    /*ON CONNECTION*/
    const user = socket.handshake.query.username;
    const admin = socket.handshake.query.admin;
    // console.log(admin);
    console.log(`${user} - ${socket.id} CONNECT`)
    if (admin == 1) {
        console.log('admin');
        io.emit('Online-Users', Array.from(usersMap.keys()))
    } else {
        console.log('user');
        if (usersMap.has(user)) {
            usersMap.get(user).add(socket.id)
        } else {
            usersMap.set(user, new Set([socket.id]));
        }
        io.emit('Online-Users', Array.from(usersMap.keys()))
        io.emit('Active-Rooms', Array.from(roomsMap.values()))

        onDisconnection(io, socket, user)
        onFindRandomRoom(io, socket, user)
        onPlayMove(io, socket, user)
        onChat(io, socket, user)
        onSurrender(io, socket, user)
        onTimeOut(io, socket, user)
        onNewGame(io, socket, user)
        onCreateRoom(io, socket, user)
        onJoinRoom(io, socket, user)
        onInvitePlayer(io, socket, user)
        onReplyInvite(io, socket, user)
    };
}

const updateUserDbService = (winnerName, loserName) => {
    const promiseWinner = getUserBeforeUpdate({
        displayName: winnerName
    })
    const promiseLoser = getUserBeforeUpdate({
        displayName: loserName
    })
    Promise.all([promiseWinner, promiseLoser])
        .then((promiseArray) => {
            const winner = promiseArray[0][0]
            const loser = promiseArray[1][0]
            // const winnerPlus = (winner.cups < loser.cups) ? 2 : 1
            // const loserLost = (loser.cups === 0) ? 0 : (winner.cups < loser.cups) ? 2 : 1
            const winnerCups = (winner.cups < loser.cups) ? winner.cups + 2 : winner.cups + 1
            const loserCups = (loser.cups === 0) ? 0 : (winner.cups < loser.cups) ? loser.cups - 2 : loser.cups - 1
            let newLevel = winner.level
            if (winner.cups >= 20) newLevel = 'silver'
            else if (winner.cups >= 50) newLevel = 'gold'
            else if (winner.cups >= 100) newLevel = 'diamond'
            updateUserAfterGame({
                displayName: winnerName,
                cups: winnerCups,
                wins: winner.wins + 1,
                level: newLevel
            })
            updateUserAfterGame({
                displayName: loserName,
                cups: loserCups,
                wins: loser.wins,
                level: loser.level
            })
        })
}

const onDisconnection = (io, socket, user) => {
    socket.on('disconnect', () => {
        console.log(`${user} - ${socket.id} DISCONNECT`)
        let userSocketIdSet = usersMap.get(user);
        userSocketIdSet.delete(socket.id);
        if (userSocketIdSet.size === 0) {
            usersMap.delete(user);
        }
        io.emit('Online-Users', Array.from(usersMap.keys()))
        let room
        if (socket.type === 'random') {
            room = randomRoom.find(room => room.id === socket.room)
        } else {
            room = roomsMap.get(socket.room)
        }
        if (room) {
            if (room.players.length === 2) {
                if (room.game.turn.move_x) { // dang game ma thoat
                    addGame({
                        room: room.name,
                        playedDate: new Date().toLocaleString(),
                        game: room.game,
                        winner: room.players.find(item => item !== user)
                    })
                    updateUserDbService(room.players.find(item => item !== user), user)
                    room.players = room.players.filter(item => item !== user)
                    room.game = {
                        turn: {},
                        history: [
                            Array(BOARD_SIZE * BOARD_SIZE).fill(null)
                        ],
                        messages: []
                    }
                    io.to(socket.room).emit('Game-Result', {
                        line: [],
                        message: `@${user} has left game!`
                    })

                } else { // het game roi moi quit
                    room.players = room.players.filter(item => item !== user)
                    if (room.type==='buddy') room.type = 'public'
                    io.emit('Active-Rooms', Array.from(roomsMap.values()))
                }
            } else if (room.players.length === 1) {
                if (room.players[0] === user) {
                    roomsMap.delete(room.id)
                    randomRoom = randomRoom.filter(item => item.id !== room.id)
                    io.emit('Active-Rooms', Array.from(roomsMap.values()))
                }
            }
        }
    })
}

const onFindRandomRoom = (io, socket, user) => {
    socket.on("Find-Random-Room", (callback) => {
        console.log(`${user} - ${socket.id} FIND RANDOM ROOM`)
        // old
        // for (let i = 0; i < randomRoom.length; i++) {
        //     if (randomRoom[i].players.length < 2) {
        //         randomRoom[i].players.push(user)
        //         randomRoom[i].game.turn.move_o = user
        //         randomRoom[i].game.messages.push({
        //             sender: "admin",
        //             message: `${user} has joined room.`
        //         })
        //         socket.room = randomRoom[i].id
        //         socket.type = 'random'
        //         socket.join(randomRoom[i].id)
        //         io.to(randomRoom[i].id).emit('Someone-Join-Room', randomRoom[i])
        //         callback(randomRoom[i])
        //         return
        //     }
        // }
        // const roomId = new Date().getTime()
        // const newRoom = {
        //     id: roomId,
        //     players: [user],
        //     type: 'random',
        //     name: "Random room",
        //     password: "",
        //     time: 2,
        //     game: {
        //         turn: {
        //             move_x: user
        //         },
        //         history: [
        //             Array(BOARD_SIZE * BOARD_SIZE).fill(null)
        //         ],
        //         messages: [
        //             {
        //                 sender: 'admin',
        //                 message: `${user} has joined room.`
        //             }
        //         ]
        //     }
        // }
        // randomRoom.push(newRoom)
        // socket.room = newRoom.id
        // socket.type = 'random'
        // socket.join(roomId)
        // callback(newRoom)

        // update
        getUserBeforeUpdate({displayName: user})
            .then((response) => {
                console.log('RESPONSE.LEVEL: ', response[0].level)
                for (let i = 0; i < randomRoom.length; i++) {
                    if (randomRoom[i].players.length < 2 && randomRoom[i].level === response[0].level) {
                        console.log(`RANDOMROOM[${i}].level: ${randomRoom[i].level}`)
                        randomRoom[i].players.push(user)
                        randomRoom[i].game.turn.move_o = user
                        randomRoom[i].game.messages.push({
                            sender: "admin",
                            message: `@${user} has joined room.`
                        })
                        socket.room = randomRoom[i].id
                        socket.type = 'random'
                        socket.join(randomRoom[i].id)
                        io.to(randomRoom[i].id).emit('Someone-Join-Room', randomRoom[i])
                        callback(randomRoom[i])
                        return
                    }
                }
                const roomId = new Date().getTime()
                const newRoom = {
                    id: roomId,
                    players: [user],
                    type: 'random',
                    name: "Random room",
                    password: "",
                    time: 2,
                    level: response[0].level,
                    game: {
                        turn: {
                            move_x: user
                        },
                        history: [
                            Array(BOARD_SIZE * BOARD_SIZE).fill(null)
                        ],
                        messages: [
                            {
                                sender: 'admin',
                                message: `@${user} has joined room.`
                            }
                        ]
                    }
                }
                randomRoom.push(newRoom)
                socket.room = newRoom.id
                socket.type = 'random'
                socket.join(roomId)
                callback(newRoom)
            })
    })
}

const onPlayMove = (io, socket, user) => {
    socket.on('Play-Move', (data) => {
        console.log(`${user} - ${socket.id} PLAY MOVE`)
        let room
        if (socket.type === 'random') {
            room = randomRoom.find(room => room.id === socket.room)
        } else {
            room = roomsMap.get(socket.room)
        }
        const current = room.game.history[room.game.history.length - 1].slice()
        current[data.move] = data.letter
        room.game.history.push(current)
        io.to(room.id).emit('Move', data)

        const result = checkResult(current, [Math.floor(data.move / BOARD_SIZE), data.move % BOARD_SIZE], BOARD_SIZE, data.letter)
        if (result) {
            addGame({
                room: room.name,
                playedDate: new Date().toUTCString(),
                game: room.game,
                winner: result.status === 'draw' ? 'Draw' : user
            })
            if (result.status !== 'draw')
                updateUserDbService(user, room.players.find(item => item !== user))
            // room.players = []
            room.game = {
                turn: {},
                history: [
                    Array(BOARD_SIZE * BOARD_SIZE).fill(null)
                ],
                messages: []
            }
            if (result.status === 'draw') {
                io.to(socket.room).emit('Game-Result', {
                    line: [],
                    message: `Result is a draw. Congratulations to both!`
                })
            } else {
                io.to(socket.room).emit('Game-Result', {
                    line: result.line,
                    message: `@${user} won the game! Congratulations!`
                })
            }
        }
    })
}

const onChat = (io, socket, user) => {
    socket.on('Send-Message', (message) => {
        console.log(`${user} - ${socket.id} SEND MESSAGE`)
        let room
        if (socket.type === 'random') {
            room = randomRoom.find(room => room.id === socket.room)
        } else {
            room = roomsMap.get(socket.room)
        }
        room.game.messages.push({
            sender: user,
            message: message
        })
        io.to(room.id).emit('Message', {
            sender: user,
            message: message
        })
    })
}

const onSurrender = (io, socket, user) => {
    socket.on('Request-Surrender', () => {
        console.log(`${user} - ${socket.id} REQUEST SURRENDER`)
        let room
        if (socket.type === 'random') {
            room = randomRoom.find(room => room.id === socket.room)
        } else {
            room = roomsMap.get(socket.room)
        }
        addGame({
            room: room.name,
            playedDate: new Date().toUTCString(),
            game: room.game,
            winner: room.players.find(item => item !== user)
        })
        updateUserDbService(room.players.find(item => item !== user), user)
        // room.players = []
        room.game = {
            turn: {},
            history: [
                Array(BOARD_SIZE * BOARD_SIZE).fill(null)
            ],
            messages: []
        }
        io.to(socket.room).emit('Game-Result', {
            line: [],
            message: `@${user} has surrendered!`
        })
    })
}

const onTimeOut = (io, socket, user) => {
    socket.on('Time-Out', () => {
        console.log(`${user} - ${socket.id} TIME OUT`)
        let room
        if (socket.type === 'random') {
            room = randomRoom.find(room => room.id === socket.room)
        } else {
            room = roomsMap.get(socket.room)
        }
        addGame({
            room: room.name,
            playedDate: new Date().toUTCString(),
            game: room.game,
            winner: room.players.find(item => item !== user)
        })
        updateUserDbService(room.players.find(item => item !== user), user)
        // room.players = []
        room.game = {
            turn: {},
            history: [
                Array(BOARD_SIZE * BOARD_SIZE).fill(null)
            ],
            messages: []
        }
        io.to(socket.room).emit('Game-Result', {
            line: [],
            message: `@${user} is time out!`
        })
    })
}

const onNewGame = (io, socket, user) => {
    socket.on('Request-New-Game', () => {
        console.log(`${user} - ${socket.id} REQUEST NEW GAME`)
        let room
        if (socket.type === 'random') {
            room = randomRoom.find(room => room.id === socket.room)
        } else {
            room = roomsMap.get(socket.room)
        }
        if (!room.game.turn.move_x) {
            room.game.turn.move_x = user
            room.players = [user]
        } else {
            room.game.turn.move_o = user
            room.players.push(user)
        }
        room.game.messages.push({
            sender: 'admin',
            message: `@${user} has joined room.`
        })
        io.to(room.id).emit('Someone-Join-Room', room)
    })
}

const onCreateRoom = (io, socket, user) => {
    socket.on('Create-Room', (data, callback) => {
        console.log(`${user} - ${socket.id} CREATE ROOM`)
        const roomId = new Date().getTime()
        const newRoom = {
            id: roomId,
            type: data.type,
            name: data.name,
            password: data.password,
            time: data.time,
            players: [user],
            game: {
                turn: {
                    move_x: user
                },
                history: [
                    Array(BOARD_SIZE * BOARD_SIZE).fill(null)
                ],
                messages: [
                    {
                        sender: 'admin',
                        message: `@${user} has joined room.`
                    }
                ]
            }
        }
        roomsMap.set(roomId, newRoom)
        socket.room = newRoom.id
        socket.type = 'normal'
        socket.join(roomId)
        callback(newRoom)
        io.emit('Active-Rooms', Array.from(roomsMap.values()))
    })
}

const onJoinRoom = (io, socket, user) => {
    socket.on('Join-Room', (data, callback) => {
        console.log(`${user} - ${socket.id} JOIN ROOM`)
        const room = roomsMap.get(data.id)
        room.players.push(user)
        room.game.turn.move_o = user
        room.game.messages.push({
            sender: "admin",
            message: `@${user} has joined room.`
        })
        socket.room = room.id
        socket.type = 'normal'
        socket.join(room.id)
        callback(room)
        io.to(room.id).emit('Someone-Join-Room', room)
        io.emit('Active-Rooms', Array.from(roomsMap.values()))
    })
}

const onInvitePlayer = (io, socket, user) => {
    socket.on('Invite-Player', (player, callback) => {
        console.log(`${user} - ${socket.id} INVITE PLAYER`)
        //
        for (let room of roomsMap.values()) {
            if (room.players.find(item => item === player)) {
                return
            }
        }
        for (let room of randomRoom) {
            if (room.players.find(item => item === player)) {
                return
            }
        }

        const roomId = new Date().getTime()
        const newRoom = {
            id: roomId,
            type: 'buddy',
            name: 'Buddy room',
            password: '',
            time: 2,
            players: [user],
            game: {
                turn: {
                    move_x: user
                },
                history: [
                    Array(BOARD_SIZE * BOARD_SIZE).fill(null)
                ],
                messages: [
                    {
                        sender: 'admin',
                        message: `@${user} has joined room.`
                    }
                ]
            }
        }
        roomsMap.set(roomId, newRoom)
        socket.room = newRoom.id
        socket.type = 'buddy'
        socket.join(roomId)
        callback(newRoom)
        io.emit('Active-Rooms', Array.from(roomsMap.values()))

        const socketArray = usersMap.get(player)
        for (let socketid of socketArray) {
            io.to(socketid).emit('Invitation', {
                id: roomId,
                inviter: user
            })
        }
    })
}

const onReplyInvite = (io, socket, user) => {
    socket.on('Reply-Invitation', (data, callback) => {
        // {accept: true, id: roomId, inviter: ''}
        console.log(`${user} - ${socket.id} REPLY INVITATION`)
        const room = roomsMap.get(data.id)
        if (data.accept) {
            room.players.push(user)
            room.game.turn.move_o = user
            room.game.messages.push({
                sender: "admin",
                message: `@${user} has joined room.`
            })
            socket.room = room.id
            socket.type = 'buddy'
            socket.join(room.id)
            callback(room)
            io.to(room.id).emit('Someone-Join-Room', room)
            io.emit('Active-Rooms', Array.from(roomsMap.values()))
        } else {
            room.type = 'public'
            io.to(data.id).emit('Invitation-Decline', user)
            io.emit('Active-Rooms', Array.from(roomsMap.values()))
        }
    })
}
