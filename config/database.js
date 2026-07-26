const { Pool } = require("pg");
require("dotenv").config();

console.log("DATABASE_URL =", process.env.DATABASE_URL);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test Database Connection
(async () => {
    try {
        const client = await pool.connect();

        console.log("=================================");
        console.log("✅ PostgreSQL Connected");
        console.log(`📦 Database : ${process.env.DB_NAME}`);
        console.log(`🖥️ Host      : ${process.env.DB_HOST}`);
        console.log("=================================");

        client.release();
    } catch (error) {
        console.error("=================================");
        console.error("❌ PostgreSQL Connection Failed");
        console.error(error.message);
        console.error("=================================");
    }
})();

module.exports = pool;