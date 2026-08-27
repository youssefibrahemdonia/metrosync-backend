const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Register Endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role: 'user' });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login Endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// List Users Endpoint (admin-only, so an admin can find the :id to promote)
router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'email role'); // omit password
    res.json(users);
  } catch (err) {
    console.error('LIST USERS ERROR:', err);
    res.status(500).json({ error: 'Server error fetching users.' });
  }
});

// Promote Endpoint (admin-only — this IS the approval step)
router.patch('/promote/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'User is already an admin.' });
    }
    user.role = 'admin';
    await user.save();
    res.json({ message: `${user.email} promoted to admin.` });
  } catch (err) {
    console.error('PROMOTE ERROR:', err);
    res.status(500).json({ error: 'Server error during promotion.' });
  }
});

module.exports = router;