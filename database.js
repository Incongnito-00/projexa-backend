const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function connectDatabase() {
  try {
    const client = await pool.connect();

    console.log("✅ PostgreSQL Connected");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT,
        google_id VARCHAR(255) UNIQUE,
        role VARCHAR(20) DEFAULT 'student',
        profile_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        requirements TEXT,
        budget VARCHAR(100),
        status VARCHAR(30) DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        applicant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT,
        status VARCHAR(30) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, applicant_id)
      );
    `);

    client.release();
    console.log("✅ Tables Ready");
  } catch (err) {
    console.error("❌ Database Error:", err.message);
  }
}

connectDatabase();

module.exports = pool;