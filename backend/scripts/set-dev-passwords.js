/**
 * Dev/test uchun admin va owner parollarini o'rnatadi.
 * Ishga tushirish: npm run seed:dev-auth
 */
require("dotenv").config();
const pool = require("../src/config/db");
const { hashPassword } = require("../src/utils/password");

const DEV_ACCOUNTS = [
  {
    match: { email: "admin@wedding.uz" },
    updates: {
      phone: "+998909999001",
      password: "Admin1234",
    },
    label: "Admin",
  },
  {
    match: { username: "jasur01" },
    updates: {
      phone: "+998909999002",
      password: "Owner1234",
    },
    label: "Owner (jasur01)",
  },
];

async function main() {
  for (const account of DEV_ACCOUNTS) {
    const key = Object.keys(account.match)[0];
    const value = account.match[key];
    const hashed = await hashPassword(account.updates.password);

    const result = await pool.query(
      `UPDATE users
       SET phone = $1, password = $2, is_verified = TRUE
       WHERE ${key} = $3
       RETURNING id, first_name, role, phone, email, username`,
      [account.updates.phone, hashed, value]
    );

    if (!result.rows[0]) {
      console.warn(`⚠ ${account.label} topilmadi (${key}=${value})`);
      continue;
    }

    const u = result.rows[0];
    console.log(`✓ ${account.label} yangilandi`);
    console.log(`  Login: ${u.email || u.username || u.phone}`);
    console.log(`  Telefon: ${u.phone}`);
    console.log(`  Parol: ${account.updates.password}`);
    console.log("");
  }

  console.log("--- Kirish (frontend /login) ---");
  console.log("Admin:  admin@wedding.uz  yoki  +998909999001  |  Admin1234");
  console.log("Owner:  jasur01           yoki  +998909999002  |  Owner1234");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => pool.end());
