const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Simple Server-Sent Events (SSE) clients registry
const sseClients = new Set();

function sendSseEvent(eventName, data) {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch (err) {
      // ignore write errors; connection will be closed and cleaned up elsewhere
    }
  }
}

// Middleware
app.use(cors({
  origin: [
    'https://heal3r-admin.netlify.app',
    'https://heal3r.netlify.app',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// SSE endpoint for real-time updates
app.get('/api/stream', (req, res) => {
  // Headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  // Send a comment to keep connection alive immediately
  res.write(': connected\n\n');

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://bwubca23791_db_user:vdIYK3HkB0nbbcAk@anno.j0ydbb4.mongodb.net/?appName=anno', {
      dbName: 'messageDB', // specify the database name
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Adding 0.0.0.0/0 to IP whitelist (in progress)');
    console.log('2. Using exact connection string format from Atlas');
    console.log('3. Confirmed cluster is active (green)');
    process.exit(1);
  }
};

connectDB();

// Message Schema
const messageSchema = new mongoose.Schema({
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Routes
app.post('/api/messages', async (req, res) => {
  try {
    const newMessage = new Message({ message: req.body.message });
  await newMessage.save();
  res.json(newMessage);

  // Notify SSE clients about the new message
  try {
    sendSseEvent('new-message', newMessage);
  } catch (err) {
    console.error('SSE notify error:', err.message);
  }
    } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
    // Notify SSE clients about the deletion
    try {
      sendSseEvent('delete-message', { id: req.params.id });
    } catch (err) {
      console.error('SSE notify error:', err.message);
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});