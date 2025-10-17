const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

function initializeWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URL?.split(',') || []
          : ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join role-specific room
    socket.join(`role:${socket.userRole}`);

    // Chat message event
    socket.on('chat:message', (data) => {
      // Broadcast to all users or specific room
      io.emit('chat:message', {
        ...data,
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Calendar event
    socket.on('calendar:update', (data) => {
      // Broadcast calendar updates to all connected users
      io.emit('calendar:update', {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    // Typing indicator
    socket.on('chat:typing', (data) => {
      socket.broadcast.emit('chat:typing', {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

// Send notification to specific user
function sendToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

// Broadcast to all users with specific role
function sendToRole(role, event, data) {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
}

// Broadcast to all connected users
function broadcast(event, data) {
  if (io) {
    io.emit(event, data);
  }
}

module.exports = {
  initializeWebSocket,
  getIO,
  sendToUser,
  sendToRole,
  broadcast,
};
