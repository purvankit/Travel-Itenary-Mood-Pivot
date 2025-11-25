// optional helper if you add Socket.IO to server
module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('joinSession', (sessionId) => {
      socket.join(sessionId);
    });

    socket.on('leaveSession', (sessionId) => {
      socket.leave(sessionId);
    });
  });
};
