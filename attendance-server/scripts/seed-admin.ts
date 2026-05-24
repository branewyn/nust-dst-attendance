/**
 * Seed the first ADMIN user.
 * Usage: deno run --allow-net --allow-env --allow-read scripts/seed-admin.ts \
 *          --email=admin@nust.na --password=AdminPass123! --name="System Admin"
 */
import { Pool } from "@db/postgres";
import bcrypt from "bcryptjs";

const args = Object.fromEntries(
  Deno.args
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, ...v] = a.slice(2).split("=");
      return [k, v.join("=")];
    })
);

const email = args.email;
const password = args.password;
const fullName = args.name ?? "System Admin";

if (!email || !password) {
  console.error("Usage: --email=<email> --password=<password> [--name=<full name>]");
  Deno.exit(1);
}

const databaseUrl = Deno.env.get("DATABASE_URL");
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is required");
  Deno.exit(1);
}

const pool = new Pool(databaseUrl, 1);
const client = await pool.connect();

try {
  const existing = await client.queryObject<{ id: string }>(
    { text: "SELECT id FROM users WHERE email = $1", args: [email] }
  );
  if (existing.rows.length > 0) {
    console.error(`User with email ${email} already exists.`);
    Deno.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  await client.queryObject({
    text: `INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, 'ADMIN')`,
    args: [email, hash, fullName],
  });

  console.log(`✓ Admin user created: ${email}`);
} finally {
  client.release();
  await pool.end();
}
