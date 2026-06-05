/**
 * Seed database with districts, venues, and extras.
 * Run: npm run seed
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../src/config/db");
const { hashPassword } = require("../src/utils/password");

const WEDDING_IMAGES = [
  "https://images.unsplash.com/photo-1519167758481-83f29da1b5c5?w=800&q=80",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
  "https://images.unsplash.com/photo-1522673607210-8f3d141e7371?w=800&q=80",
  "https://images.unsplash.com/photo-1469371670804-ccaeda6e9e68?w=800&q=80",
];

const DISTRICTS = [
  "Chilonzor",
  "Yunusobod",
  "Mirzo Ulug'bek",
  "Yakkasaroy",
  "Shayxontohur",
  "Olmazor",
  "Uchtepa",
  "Sergeli",
  "Bektemir",
  "Yashnobod",
  "Mirobod",
  "Yangihayot",
];

const VENUE_NAMES = [
  ["Oltin Ziynat", "Malika Saroyi"],
  ["Shoh Palace", "Navro'z Garden"],
  ["Baxt Saroyi", "Orzu To'yxonasi"],
  ["Diamond Hall", "Lola Garden"],
  ["Sitora Palace", "Gulshan Hall"],
  ["Afsona Saroyi", "Yulduz To'yxonasi"],
  ["Imperial Hall", "Shirin Garden"],
  ["Royal Palace", "Mehrigiyo Hall"],
  ["Zarafshan Palace", "Nilufar Garden"],
  ["Firdavs Saroyi", "Ruhiy To'yxona"],
  ["Grand Wedding", "Sevilla Hall"],
  ["Elite Palace", "Samarkand Garden"],
];

const SINGERS = [
  { name: "Dilnoza Karimova", price: 3500000 },
  { name: "Jahongir Otajonov", price: 5000000 },
  { name: "Shahzoda", price: 4200000 },
  { name: "Rayhon", price: 3800000 },
];

const CARS = [
  { brand: "Mercedes S-Class", price: 2500000 },
  { brand: "BMW 7 Series", price: 2200000 },
  { brand: "Rolls-Royce Phantom", price: 8000000 },
  { brand: "Range Rover", price: 1800000 },
];

const MENUS = [
  { name: "Premium to'y paketi", price: 8500000 },
  { name: "Standart dasturxona", price: 5500000 },
  { name: "VIP milliy taomlar", price: 12000000 },
  { name: "Yengil kechki ovqat", price: 4200000 },
];

async function runSchema() {
  const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(sql);
}

async function ensureUsers() {
  const adminPass = await hashPassword("Admin1234");
  const ownerPass = await hashPassword("Owner1234");
  const userPass = await hashPassword("User12345");

  await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password, role, is_verified)
     VALUES ('Admin', 'User', 'admin@wedding.uz', '+998909999001', $1, 'admin', TRUE)
     ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, is_verified = TRUE`,
    [adminPass]
  );

  await pool.query(
    `INSERT INTO users (first_name, last_name, username, email, phone, password, role, is_verified)
     VALUES ('Jasur', 'Rahimov', 'jasur01', 'jasur@wedding.uz', '+998909999002', $1, 'owner', TRUE)
     ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, is_verified = TRUE`,
    [ownerPass]
  );

  await pool.query(
    `INSERT INTO users (first_name, last_name, phone, password, role, is_verified)
     VALUES ('Aziza', 'Karimova', '+998901234567', $1, 'user', TRUE)
     ON CONFLICT (phone) DO UPDATE SET password = EXCLUDED.password, is_verified = TRUE`,
    [userPass]
  );

  const owner = await pool.query("SELECT id FROM users WHERE username = 'jasur01' LIMIT 1");
  return owner.rows[0]?.id;
}

async function seedDistricts() {
  const ids = [];
  for (const name of DISTRICTS) {
    const result = await pool.query(
      `INSERT INTO districts (name) VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [name]
    );
    ids.push(result.rows[0].id);
  }
  return ids;
}

async function seedVenues(districtIds, ownerId) {
  let imageIndex = 0;
  let venueCount = 0;

  for (let d = 0; d < districtIds.length; d += 1) {
    const districtId = districtIds[d];
    const names = VENUE_NAMES[d];

    for (let v = 0; v < names.length; v += 1) {
      const name = names[v];
      const capacity = 150 + (d * 10) + (v * 25);
      const tablePrice = 450000 + d * 35000 + v * 50000;
      const address = `${DISTRICTS[d]} tumani, ${name} ko'chasi, ${10 + v * 5}-uy`;

      const existing = await pool.query("SELECT id FROM venues WHERE name = $1 LIMIT 1", [name]);
      if (existing.rows[0]) {
        venueCount += 1;
        continue;
      }

      const venueResult = await pool.query(
        `INSERT INTO venues (name, description, district_id, address, capacity, price, phone, status, owner_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', $8)
         RETURNING id`,
        [
          name,
          `${name} — zamonaviy interyer, professional xizmat va unutilmas to'y uchun ideal joy. ${DISTRICTS[d]} tumani markazida joylashgan.`,
          districtId,
          address,
          capacity,
          tablePrice,
          `+99890100${String(d).padStart(2, "0")}${String(v).padStart(2, "0")}`,
          ownerId,
        ]
      );

      const venueId = venueResult.rows[0].id;
      venueCount += 1;

      for (let i = 0; i < 2; i += 1) {
        await pool.query(
          `INSERT INTO venue_images (venue_id, url, is_primary) VALUES ($1, $2, $3)`,
          [venueId, WEDDING_IMAGES[imageIndex % WEDDING_IMAGES.length], i === 0]
        );
        imageIndex += 1;
      }

      const singer = SINGERS[(d + v) % SINGERS.length];
      await pool.query(
        `INSERT INTO singers (venue_id, name, price) VALUES ($1, $2, $3)`,
        [venueId, singer.name, singer.price]
      );

      const car = CARS[(d + v) % CARS.length];
      await pool.query(
        `INSERT INTO cars (venue_id, brand, price) VALUES ($1, $2, $3)`,
        [venueId, car.brand, car.price]
      );

      const menu = MENUS[(d + v) % MENUS.length];
      await pool.query(
        `INSERT INTO menu_items (venue_id, name, price) VALUES ($1, $2, $3)`,
        [venueId, menu.name, menu.price]
      );

      await pool.query(
        `INSERT INTO karnay_surnay (venue_id, available, price)
         VALUES ($1, TRUE, $2)
         ON CONFLICT (venue_id) DO UPDATE SET available = TRUE, price = EXCLUDED.price`,
        [venueId, 1500000 + d * 100000]
      );
    }
  }

  return venueCount;
}

async function main() {
  console.log("Schema yuklanmoqda...");
  await runSchema();

  console.log("Foydalanuvchilar yaratilmoqda...");
  const ownerId = await ensureUsers();

  console.log("Tumanlar yaratilmoqda...");
  const districtIds = await seedDistricts();

  console.log("To'yxonalar yaratilmoqda...");
  const venueCount = await seedVenues(districtIds, ownerId);

  console.log(`\n✓ Seed yakunlandi`);
  console.log(`  Tumanlar: ${districtIds.length}`);
  console.log(`  To'yxonalar: ${venueCount}`);
  console.log(`\nTest hisoblar:`);
  console.log(`  Admin: admin@wedding.uz | Admin1234`);
  console.log(`  Owner: jasur01 | Owner1234`);
  console.log(`  User:  +998901234567 | User12345`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => pool.end());
