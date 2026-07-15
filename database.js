const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function connectDatabase() {
  let client;

  try {
    client = await pool.connect();

    console.log("✅ PostgreSQL Connected");

    // =====================================
    // USERS
    // =====================================

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
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS college VARCHAR(255);
    `);

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS notifications BOOLEAN DEFAULT TRUE;
    `);

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT TRUE;
    `);

    // =====================================
    // PROJECTS
    // =====================================

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
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS level VARCHAR(50) DEFAULT 'Beginner';
    `);

    await client.query(`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS skills TEXT;
    `);

    // =====================================
    // APPLICATIONS
    // =====================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,

        project_id INTEGER
        REFERENCES projects(id)
        ON DELETE CASCADE,

        applicant_id INTEGER
        REFERENCES users(id)
        ON DELETE CASCADE,

        message TEXT,

        status VARCHAR(30)
        DEFAULT 'Pending',

        created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(project_id, applicant_id)
      );
    `);

    // =====================================
    // NOTIFICATIONS
    // =====================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,

        user_id INTEGER
        REFERENCES users(id)
        ON DELETE CASCADE,

        title VARCHAR(255),

        message TEXT,

        is_read BOOLEAN DEFAULT FALSE,

        created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tables Ready");

  } catch (err) {

    console.error("❌ Database Error:", err);

  } finally {

    if (client) client.release();

  }
}

connectDatabase();

module.exports = pool;