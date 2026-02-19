const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'netflix_secret_key_2024';
const OMDB_API_KEY = '69bc584';
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json());

// Initialize users file
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// Read users
const getUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
const saveUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  const users = getUsers();
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    name,
    history: []
  };
  
  users.push(newUser);
  saveUsers(users);
  
  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);
  res.json({ token, user: { id: newUser.id, email, name } });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// Get movies from OMDb
app.get('/api/movies/search', async (req, res) => {
  const { query } = req.query;
  try {
    const response = await axios.get(`http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${query}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Get movie by ID
app.get('/api/movies/:id', async (req, res) => {
  try {
    const response = await axios.get(`http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// Get category movies
app.get('/api/movies/category/:category', async (req, res) => {
  const { category } = req.params;
  const searchTerms = {
    trending: 'avengers',
    action: 'action',
    scifi: 'star',
    comedy: 'comedy',
    drama: 'drama'
  };
  
  try {
    const response = await axios.get(`http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${searchTerms[category] || 'movie'}&type=movie`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Add to history
app.post('/api/user/history', authMiddleware, (req, res) => {
  const { movieId } = req.body;
  const users = getUsers();
  const user = users.find(u => u.id === req.userId);
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  if (!user.history) user.history = [];
  if (!user.history.includes(movieId)) {
    user.history.unshift(movieId);
    user.history = user.history.slice(0, 20); // Keep last 20
  }
  
  saveUsers(users);
  res.json({ success: true });
});

// Get history
app.get('/api/user/history', authMiddleware, async (req, res) => {
  const users = getUsers();
  const user = users.find(u => u.id === req.userId);
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  try {
    const historyMovies = await Promise.all(
      (user.history || []).map(id => 
        axios.get(`http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${id}`)
          .then(r => r.data)
          .catch(() => null)
      )
    );
    res.json({ Search: historyMovies.filter(m => m) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
