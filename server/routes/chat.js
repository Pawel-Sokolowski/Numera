const express = require('express');
const router = express.Router();

// In-memory storage for demo purposes (should use database in production)
let messages = [
  {
    id: '1',
    userId: '1',
    userName: 'Administrator',
    content: 'Witajcie w czacie zespołowym!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'text'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Jan Kowalski',
    content: 'Dzień dobry! Mam pytanie odnośnie faktury nr FV/2024/001',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    type: 'text'
  }
];

let rooms = [
  {
    id: 'general',
    name: 'Ogólny',
    description: 'Główny kanał komunikacyjny zespołu',
    isActive: true
  },
  {
    id: 'accounting',
    name: 'Księgowość',
    description: 'Dyskusje dotyczące spraw księgowych',
    isActive: true
  }
];

// Get all chat rooms
router.get('/rooms', (req, res) => {
  res.json(rooms);
});

// Get messages for a room
router.get('/rooms/:roomId/messages', (req, res) => {
  const { roomId } = req.params;
  const { limit = 50, offset = 0 } = req.query;
  
  // In a real app, filter by roomId
  const roomMessages = messages
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
    .reverse();
  
  res.json(roomMessages);
});

// Send a message
router.post('/messages', (req, res) => {
  const { userId, userName, content, roomId = 'general', type = 'text' } = req.body;
  
  if (!userId || !userName || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newMessage = {
    id: (messages.length + 1).toString(),
    userId,
    userName,
    content,
    roomId,
    type,
    timestamp: new Date().toISOString()
  };

  messages.push(newMessage);
  res.status(201).json(newMessage);
});

// Get user's chat history
router.get('/users/:userId/messages', (req, res) => {
  const { userId } = req.params;
  const userMessages = messages.filter(m => m.userId === userId);
  res.json(userMessages);
});

// Delete message (admin only in real app)
router.delete('/messages/:messageId', (req, res) => {
  const messageIndex = messages.findIndex(m => m.id === req.params.messageId);
  if (messageIndex === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }
  
  messages.splice(messageIndex, 1);
  res.json({ message: 'Message deleted successfully' });
});

// Create new chat room
router.post('/rooms', (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  const newRoom = {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    description: description || '',
    isActive: true
  };

  rooms.push(newRoom);
  res.status(201).json(newRoom);
});

module.exports = router;