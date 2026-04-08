const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/projects/:id/comments — all comments for a project
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.id, c.body, c.created_at, u.username
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.project_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/comments — create a comment
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, body } = req.body;

    if (!user_id || !body) {
      return res.status(400).json({ error: 'user_id and body are required' });
    }

    const result = await pool.query(
      `INSERT INTO comments (user_id, project_id, body)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, id, body]
    );

    // Return with username
    const user = await pool.query('SELECT username FROM users WHERE id = $1', [user_id]);
    res.status(201).json({
      ...result.rows[0],
      username: user.rows[0]?.username ?? 'Unknown',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
