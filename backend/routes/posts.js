const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ time: -1 }) // Sort by newest first
      .select('heading description time'); // Only select needed fields
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Create a new post
router.post('/posts', async (req, res) => {
  try {
    if (!req.body.heading || !req.body.description) {
      return res.status(400).json({ message: 'Heading and description are required' });
    }

    const post = new Post({
      heading: req.body.heading,
      description: req.body.description,
      time: new Date()
    });

    const newPost = await post.save();
    console.log('Post created successfully:', newPost); // Add logging
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Add this test route
router.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

module.exports = router; 