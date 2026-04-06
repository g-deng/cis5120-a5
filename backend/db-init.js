const pool = require('./db');

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
