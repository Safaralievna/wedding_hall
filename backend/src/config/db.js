const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required in .env");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("DB xatosi:", err.message);
});

const verifyDatabaseConnection = async () => {
  await pool.query("SELECT 1");
  console.log("PostgreSQL ga ulanish muvaffaqiyatli");
};

verifyDatabaseConnection().catch((err) => {
  console.error("DB ulanishda xatolik:", err.message);
});

module.exports = pool;