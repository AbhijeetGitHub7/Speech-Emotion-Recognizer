const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Register Route
router.post('/signup', async (req, res) => {  // Changed '/register' to '/signup'
  const { email, password, firstName, lastName } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ email, password, firstName, lastName });
    await user.save();
    req.session.userId = user._id; // Create session
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Login Route
router.post('/signin', async (req, res) => {  // Changed '/login' to '/signin'
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    req.session.userId = user._id; // Create session
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Logout Route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid'); // Clear cookie
    res.status(200).json({ message: 'Logged out successfully' });
  });
});
// Add this middleware in `auth.js`
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    next(); // User is authenticated
  } else {
    res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
};

// Add this route in `auth.js`
router.get('/home', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Welcome to the home route', user });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});


module.exports = router;