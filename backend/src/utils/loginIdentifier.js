const { validatePhone, validateEmail } = require("./validators");

const normalizeLogin = (value) => String(value || "").trim();

const findUserByLogin = async (pool, identifier) => {
  const login = normalizeLogin(identifier);

  if (!login) {
    return null;
  }

  if (validatePhone(login)) {
    const byPhone = await pool.query("SELECT * FROM users WHERE phone = $1 LIMIT 1", [login]);
    if (byPhone.rows[0]) return byPhone.rows[0];
  }

  if (validateEmail(login)) {
    const byEmail = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1", [
      login,
    ]);
    if (byEmail.rows[0]) return byEmail.rows[0];
  }

  const byUsername = await pool.query(
    "SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1",
    [login]
  );

  return byUsername.rows[0] || null;
};

module.exports = {
  normalizeLogin,
  findUserByLogin,
};
