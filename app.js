const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for bingo game state
const gameState = {
  maxNumber: null,
  drawnNumbers: [],
  isGameStarted: false
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to start a new game
app.post('/api/start-game', (req, res) => {
  const { maxNumber } = req.body;
  
  if (!maxNumber || maxNumber < 1 || maxNumber > 1000) {
    return res.status(400).json({ error: 'Please enter a valid number between 1 and 1000' });
  }
  
  gameState.maxNumber = parseInt(maxNumber);
  gameState.drawnNumbers = [];
  gameState.isGameStarted = true;
  
  res.json({ 
    message: 'Game started successfully',
    maxNumber: gameState.maxNumber,
    drawnNumbers: gameState.drawnNumbers
  });
});

// API endpoint to draw next number
app.post('/api/draw-number', (req, res) => {
  if (!gameState.isGameStarted) {
    return res.status(400).json({ error: 'Please start a game first' });
  }
  
  if (gameState.drawnNumbers.length >= gameState.maxNumber) {
    return res.status(400).json({ error: 'All numbers have been drawn!' });
  }
  
  // Generate available numbers
  const availableNumbers = [];
  for (let i = 1; i <= gameState.maxNumber; i++) {
    if (!gameState.drawnNumbers.includes(i)) {
      availableNumbers.push(i);
    }
  }
  
  // Draw a random number
  const randomIndex = Math.floor(Math.random() * availableNumbers.length);
  const drawnNumber = availableNumbers[randomIndex];
  gameState.drawnNumbers.push(drawnNumber);
  
  res.json({
    drawnNumber,
    drawnNumbers: gameState.drawnNumbers,
    remainingNumbers: gameState.maxNumber - gameState.drawnNumbers.length
  });
});

// API endpoint to get game state
app.get('/api/game-state', (req, res) => {
  res.json({
    isGameStarted: gameState.isGameStarted,
    maxNumber: gameState.maxNumber,
    drawnNumbers: gameState.drawnNumbers,
    remainingNumbers: gameState.isGameStarted ? gameState.maxNumber - gameState.drawnNumbers.length : 0
  });
});

// API endpoint to reset game
app.post('/api/reset-game', (req, res) => {
  gameState.maxNumber = null;
  gameState.drawnNumbers = [];
  gameState.isGameStarted = false;
  
  res.json({ message: 'Game reset successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Bingo game server is running on port ${PORT}`);
});