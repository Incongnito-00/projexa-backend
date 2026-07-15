const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:
        process.env.NODE_ENV === "production"
            ? {
                  rejectUnauthorized: false,
              }
            : false,
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