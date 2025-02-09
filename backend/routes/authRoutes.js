const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new user
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { username, name, password } = req.body;

    if (!username || !name || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ username });
    console.log('User exists check:', userExists);
    
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      name,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    console.log('User saved successfully:', savedUser);

    // Create token
    const token = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        name: savedUser.name,
        stats: {
          numOfRides: savedUser.numOfRides,
          totalKm: savedUser.totalKm,
          avgSpeed: savedUser.avgSpeed,
          caloriesBurned: savedUser.caloriesBurned
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering user',
      error: error.message,
      stack: error.stack 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        stats: {
          numOfRides: user.numOfRides,
          totalKm: user.totalKm,
          avgSpeed: user.avgSpeed,
          caloriesBurned: user.caloriesBurned
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      stats: {
        numOfRides: user.numOfRides,
        totalKm: user.totalKm,
        avgSpeed: user.avgSpeed,
        caloriesBurned: user.caloriesBurned
      },
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { name, username } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username && username !== user.username) {
      const userExists = await User.findOne({ username });
      if (userExists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (name) user.name = name;
    
    const updatedUser = await user.save();
    
    res.json({
      id: updatedUser._id,
      username: updatedUser.username,
      name: updatedUser.name,
      stats: {
        numOfRides: updatedUser.numOfRides,
        totalKm: updatedUser.totalKm,
        avgSpeed: updatedUser.avgSpeed,
        caloriesBurned: updatedUser.caloriesBurned
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Get leaderboard data
router.get('/leaderboard', async (req, res) => {
  try {
    console.log('Fetching leaderboard data...');
    const users = await User.find()
      .select('name username totalKm numOfRides')
      .sort({ totalKm: -1 }) // Sort by totalKm in descending order
      .limit(10); // Limit to top 10 users

    console.log('Found users:', users);

    if (!users || users.length === 0) {
      console.log('No users found');
      return res.json([]); // Return empty array instead of error
    }

    const leaderboardData = users.map((user, index) => ({
      id: user._id,
      rank: index + 1,
      name: user.name,
      username: user.username,
      distance: user.totalKm || 0, // Provide default value
      numOfRides: user.numOfRides || 0 // Provide default value
    }));

    console.log('Processed leaderboard data:', leaderboardData);
    res.json(leaderboardData);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ 
      message: 'Error fetching leaderboard data',
      error: error.message,
      stack: error.stack 
    });
  }
});

module.exports = router; 