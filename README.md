# NUST Attendance System

A three-part student attendance capture system built as a Design Thinking project.

| Project | Stack | Purpose |
|---|---|---|
| `attendance-server` | Deno 2, Oak, PostgreSQL | REST API backend |
| `attendance-web` | React 18, Vite, TypeScript | Lecturer & admin web portal |
| `attendance-mobile` | React Native, Expo SDK 51 | Student QR scan app |

---

## Prerequisites

| Tool | Needed for | Install |
|---|---|---|
| Docker + Docker Compose | Server & web (recommended) | https://docs.docker.com/get-docker |
| Deno 2.x | Server (manual only) | https://deno.land/manual/getting_started/installation |
| Node.js 20 LTS | Web (manual) + Mobile | https://nodejs.org |
| PostgreSQL 15+ | Server (manual only) | https://www.postgresql.org/download |
| Expo CLI | Mobile | `npm install -g expo-cli` |
| Expo Go app | Mobile | iOS App Store / Google Play Store |

---

## Quick Start (Docker)

Docker handles PostgreSQL, the API server, and the web portal together. Only the mobile app needs separate manual setup.

### 1. Create the environment file

```bash
cp .env.example .env
```

Edit `.env` and replace every placeholder value:

```dotenv
POSTGRES_PASSWORD=choose-a-strong-password

JWT_ACCESS_SECRET=<openssl rand -base64 48>
JWT_REFRESH_SECRET=<openssl rand -base64 48>
QR_HMAC_SECRET=<openssl rand -base64 48>

# Generate with: openssl rand -hex 32
DEVICE_ENCRYPTION_KEY=<64-hex-char-key>
```

> **Copy the `DEVICE_ENCRYPTION_KEY`** — you will need the same value in the mobile app (see step 3 below).

### 2. Start everything

```bash
docker compose up --build
```

Docker will:
- Create the PostgreSQL database and user (from the env vars in `.env`)
- Wait until PostgreSQL is healthy before proceeding
- Run the database migration (`001_initial_schema.sql`) automatically
- Build and start the API server on port **3000**
- Build and start the web portal on port **80** (nginx, with API proxied to the server)

Open **http://localhost** in a browser.

### 3. Seed the first admin account

Run this once after the containers are up:

```bash
docker compose exec server deno run --allow-net --allow-env --allow-read scripts/seed-admin.ts \
  --email=admin@nust.na --password=AdminPass123! --name="System Admin"
```

### Stopping

```bash
docker compose down        # stop and remove containers (data volume kept)
docker compose down -v     # also delete the database volume
```

---

## 1. Database Setup (manual — skip if using Docker)

```sql
-- Run as a Postgres superuser (e.g. psql -U postgres)
CREATE DATABASE attendance_db;
CREATE USER attendance_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE attendance_db TO attendance_user;
```

Then apply the schema:

```bash
psql -U attendance_user -d attendance_db -f attendance-server/migrations/001_initial_schema.sql
```

---

## 2. attendance-server (manual — skip if using Docker)

### Configure environment

```bash
cd attendance-server
cp .env.example .env
```

Edit `.env` and fill in all values:

```dotenv
PORT=3000
DATABASE_URL=postgres://attendance_user:your_password@localhost:5432/attendance_db

# Secrets — generate random strings of at least 32 characters each
JWT_ACCESS_SECRET=<random-32+-char-string>
JWT_REFRESH_SECRET=<random-32+-char-string>
JWT_ACCESS_TTL_MINUTES=15
JWT_REFRESH_TTL_DAYS=7
QR_HMAC_SECRET=<random-32+-char-string>

# Device encryption key — must be exactly 64 hex characters (32 bytes)
# Generate with: openssl rand -hex 32
DEVICE_ENCRYPTION_KEY=<64-hex-char-key>

# Admin push (leave defaults if not using external store)
ADMIN_STORE_URL=https://admin.institution.na/api/attendance
ADMIN_STORE_API_KEY=<api-key>

CORS_ORIGIN=http://localhost:5173
```

> **Important:** Copy the `DEVICE_ENCRYPTION_KEY` value — you will need it in step 4.

### Seed the first admin account

```bash
deno task seed-admin --email=admin@nust.na --password=AdminPass123! --name="System Admin"
```

### Start the server

```bash
# Development (file watcher)
deno task dev

# Production
deno task start
```

The API will be available at `http://localhost:3000`.

---

## 3. attendance-web (manual — skip if using Docker)

```bash
cd attendance-web
npm install
```

### Configure environment (optional)

By default the web app proxies `/api` to `http://localhost:3000` via Vite's dev server — no `.env` file is required for local development.

To point at a remote server, create `.env.local`:

```dotenv
VITE_API_URL=https://your-server.example.com/api/v1
```

### Start the dev server

```bash
npm run dev
```

Open `http://localhost:5173` in a browser.

**Lecturer workflow:**
1. Register a lecturer account at `/register`
2. Create a class at `/classes/new`
3. Open the class detail page to display the QR code and track attendance

**Admin workflow:**
1. Sign in with the seeded admin credentials
2. Navigate via the Admin panel (header links) to manage users, view all classes, attendance records, and push logs

---

## 4. attendance-mobile

### Set the device encryption key

Open `attendance-mobile/src/utils/device.ts` and replace the placeholder with the **same 64-char hex key** from the server's `DEVICE_ENCRYPTION_KEY`:

```typescript
// Line ~16 in src/utils/device.ts
const DEVICE_ENCRYPTION_KEY_HEX = "<paste-your-64-hex-char-key-here>";
```

### Configure the API URL

Open `attendance-mobile/app.json` and set the `extra.apiUrl` to your server address:

```json
"extra": {
  "apiUrl": "http://<your-machine-ip>:3000/api/v1"
}
```

> Use your machine's local network IP (e.g. `192.168.1.x`), not `localhost`, when testing on a physical device.

### Install dependencies and start

```bash
cd attendance-mobile
npm install
npx expo start
```

Scan the QR code displayed in the terminal with the **Expo Go** app on your phone.

**Student workflow:**
1. Register a student account (Register screen)
2. Sign in
3. Tap **Scan QR Code** and point the camera at the QR displayed in the web portal
4. If a challenge code is required, enter it when prompted
5. Attendance is recorded — view history on the History screen

---

## Running all three together

### With Docker (recommended)

```bash
# Terminal 1 — Server + web + database
docker compose up --build

# Terminal 2 — Mobile (Expo)
cd attendance-mobile && npx expo start
```

### Manual (all three)

```bash
# Terminal 1 — API server
cd attendance-server && deno task dev

# Terminal 2 — Web portal
cd attendance-web && npm run dev

# Terminal 3 — Mobile (Expo)
cd attendance-mobile && npx expo start
```

---

## Generating a secure DEVICE_ENCRYPTION_KEY

```bash
# macOS / Linux
openssl rand -hex 32

# Windows PowerShell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
```

Paste the output (64 hex characters) into both `.env` (server) and `src/utils/device.ts` (mobile).
