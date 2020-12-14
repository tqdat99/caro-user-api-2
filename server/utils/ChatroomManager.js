const Chatroom = require('./Chatroom')
const chatroomTemplates = require('../config/chatrooms')

module.exports = function () {
  const chatrooms = new Map()

  function removeClient(client) {
    chatrooms.forEach(c => c.removeUser(client))
  }

  function getChatroomByName(chatroomName) {
    return chatrooms.get(chatroomName)
  }

  function serializeChatrooms() {
    return Array.from(chatrooms.values()).map(c => c.serialize())
  }

  return {
    removeClient,
    getChatroomByName,
    serializeChatrooms
  }
}   