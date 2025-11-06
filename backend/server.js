const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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