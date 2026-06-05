require("dotenv").config();
const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlayapti`);
});

const shutdown = async () => {
  try {
    await pool.end();
  } catch (error) {
    console.error("Pool yopishda xatolik:", error.message);
  } finally {
    server.close(() => process.exit(0));
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);