const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const db = require('./models/db');
// Initialize express app
const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'your_secret_key', 
  resave: false,
  saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Home route, only accessible to authenticated users
app.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  db.query('SELECT * FROM tasks WHERE user_id = ?', [req.session.userId], (err, tasks) => {
    if (err) return res.send('Error fetching tasks');
    res.render('index', { tasks });
  });
});

// Registration page
app.get('/register', (req, res) => {
  res.render('register');
});

// Registration handling
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, users) => {
    if (err) return res.status(500).send('Error checking username');

    // If user exists, send a message
    if (users.length > 0) {
      return res.status(400).send('User already exists');
    }
  

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).send('Error hashing password');

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err) => {
        if (err) {
            console.error('Error registering user:', err.message);
            return res.status(500).send('Error registering user');
          }
      res.redirect('/login');
    });
  });
});
});

// Login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Login handling
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, users) => {
    if (err || users.length === 0) return res.status(400).send('Invalid username or password');
    const user = users[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) return res.status(400).send('Invalid username or password');

      req.session.userId = user.id;
      res.redirect('/');
    });
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
