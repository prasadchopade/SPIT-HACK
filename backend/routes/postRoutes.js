const express = require('express');
const Post = require('../models/Post');

const router = express.Router();

router.post('/posts', async (req, res) => {
  try {
    const { heading, description } = req.body;
    const post = new Post({
      heading,
      description,
      createdAt: new Date() // Set the date on the server side
    });
    
    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(10);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

module.exports = router; 