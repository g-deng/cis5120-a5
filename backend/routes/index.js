const express = require('express');
const router = express.Router();
const pool = require('../db');

// Health check
router.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Test database connection
router.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', timestamp: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
