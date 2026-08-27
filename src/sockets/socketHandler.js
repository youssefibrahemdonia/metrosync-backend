const roomViewers = new Map();

const initSockets = (io) => {
  io.on('connection', (socket) => {
    let currentRoom = null;

    socket.on('joinStation', ({ stationId }) => {
      if (currentRoom) {
        socket.leave(currentRoom);
        decrementViewer(io, currentRoom);
      }

      currentRoom = stationId;
      socket.join(stationId);
      incrementViewer(io, stationId);
    });

    socket.on('disconnect', () => {
      if (currentRoom) {
        decrementViewer(io, currentRoom);
      }
    });
  });
};

const incrementViewer = (io, stationId) => {
  const count = (roomViewers.get(stationId) || 0) + 1;
  roomViewers.set(stationId, count);
  io.to(stationId).emit('presenceUpdate', { stationId, viewerCount: count });
};

const decrementViewer = (io, stationId) => {
  const count = Math.max(0, (roomViewers.get(stationId) || 0) - 1);
  roomViewers.set(stationId, count);
  io.to(stationId).emit('presenceUpdate', { stationId, viewerCount: count });
};

module.exports = initSockets;