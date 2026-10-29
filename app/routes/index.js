const express = require('express');

const router = express.Router();

// GET /api/ping - Health check
router.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Hello World' });
});

// /api/users/... -> routs to users.js
router.use('/users', require('./users'));

module.exports = router;
