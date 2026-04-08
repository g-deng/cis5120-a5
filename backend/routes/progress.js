const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/users/:userId/projects — user's own + saved projects with progress
router.get('/:userId/projects', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT p.*,
              COALESCE(pr.rows_completed, 0) AS rows_completed,
              pr.current_row_id,
              pr.updated_at AS progress_updated_at
       FROM projects p
       LEFT JOIN progress pr ON pr.project_id = p.id AND pr.user_id = $1
       WHERE p.user_id = $1
          OR p.id IN (SELECT project_id FROM saved_projects WHERE user_id = $1)
       ORDER BY p.last_worked_at DESC NULLS LAST`,
      [userId]
    );

    // Derive yards_used for each project
    const projects = result.rows.map((p) => {
      const yardsUsed =
        p.total_rows > 0 && p.total_yards
          ? (p.rows_completed / p.total_rows) * Number(p.total_yards)
          : 0;
      return { ...p, yards_used: Math.round(yardsUsed * 100) / 100 };
    });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:userId/saved/:projectId — save a public project
router.post('/:userId/saved/:projectId', async (req, res) => {
  try {
    const { userId, projectId } = req.params;
    await pool.query(
      `INSERT INTO saved_projects (user_id, project_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, project_id) DO NOTHING`,
      [userId, projectId]
    );
    res.status(201).json({ message: 'Project saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:userId/saved/:projectId — unsave a project
router.delete('/:userId/saved/:projectId', async (req, res) => {
  try {
    const { userId, projectId } = req.params;
    await pool.query(
      'DELETE FROM saved_projects WHERE user_id = $1 AND project_id = $2',
      [userId, projectId]
    );
    res.json({ message: 'Project removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:userId/projects/:id/progress — increment progress
router.patch('/:userId/projects/:id/progress', async (req, res) => {
  const client = await pool.connect();

  try {
    const { userId, id: projectId } = req.params;
    const { rows_to_add } = req.body;

    await client.query('BEGIN');

    // Get total row count for upper bound clamp
    const totalResult = await client.query(
      `SELECT COUNT(*) AS cnt FROM rows
       WHERE section_id IN (SELECT id FROM sections WHERE project_id = $1)`,
      [projectId]
    );
    const totalRows = parseInt(totalResult.rows[0].cnt, 10);

    // Upsert progress (clamp between 0 and total rows)
    const progressResult = await client.query(
      `INSERT INTO progress (user_id, project_id, rows_completed, updated_at)
       VALUES ($1, $2, LEAST(GREATEST($3, 0), $4), NOW())
       ON CONFLICT (user_id, project_id)
       DO UPDATE SET rows_completed = LEAST(GREATEST(progress.rows_completed + $3, 0), $4),
                     updated_at = NOW()
       RETURNING *`,
      [userId, projectId, rows_to_add, totalRows]
    );
    const progress = progressResult.rows[0];

    // Update current_row_id to the next row to work on
    const nextRowResult = await client.query(
      `SELECT id FROM rows
       WHERE section_id IN (SELECT id FROM sections WHERE project_id = $1)
       ORDER BY position
       LIMIT 1 OFFSET $2`,
      [projectId, progress.rows_completed]
    );
    const nextRowId = nextRowResult.rows.length > 0 ? nextRowResult.rows[0].id : null;
    await client.query(
      'UPDATE progress SET current_row_id = $1 WHERE id = $2',
      [nextRowId, progress.id]
    );

    // Append to progress log
    await client.query(
      'INSERT INTO progress_log (user_id, project_id, rows_added) VALUES ($1, $2, $3)',
      [userId, projectId, rows_to_add]
    );

    // Update project's last_worked_at
    await client.query(
      'UPDATE projects SET last_worked_at = NOW() WHERE id = $1',
      [projectId]
    );

    await client.query('COMMIT');
    res.json({ ...progress, current_row_id: nextRowId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/users/:userId/stats — aggregated stats
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    // Row stats from progress_log
    const rowStats = await pool.query(
      `SELECT
        COALESCE(SUM(rows_added), 0) AS all_time,
        COALESCE(SUM(CASE WHEN logged_at >= NOW() - INTERVAL '7 days' THEN rows_added ELSE 0 END), 0) AS week,
        COALESCE(SUM(CASE WHEN logged_at >= CURRENT_DATE THEN rows_added ELSE 0 END), 0) AS today
       FROM progress_log
       WHERE user_id = $1`,
      [userId]
    );

    // Yards used from progress + projects
    const yardStats = await pool.query(
      `SELECT COALESCE(SUM(
        CASE WHEN p.total_rows > 0
        THEN (CAST(pr.rows_completed AS numeric) / p.total_rows) * COALESCE(p.total_yards, 0)
        ELSE 0 END
       ), 0) AS used
       FROM progress pr
       JOIN projects p ON p.id = pr.project_id
       WHERE pr.user_id = $1`,
      [userId]
    );

    res.json({
      rows: {
        today: Number(rowStats.rows[0].today),
        week: Number(rowStats.rows[0].week),
        all_time: Number(rowStats.rows[0].all_time),
      },
      yards: {
        used: Math.round(Number(yardStats.rows[0].used) * 100) / 100,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:userId/activity — recent activity entries
router.get('/:userId/activity', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT pl.rows_added, pl.logged_at, p.title AS project_title
       FROM progress_log pl
       JOIN projects p ON p.id = pl.project_id
       WHERE pl.user_id = $1
       ORDER BY pl.logged_at DESC
       LIMIT 5`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
