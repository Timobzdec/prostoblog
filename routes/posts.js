const express = require('express');
const router = express.Router();

// Placeholder posts routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all posts' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create new post' });
});

module.exports = router;