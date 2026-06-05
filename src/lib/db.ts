import { createClient } from "@libsql/client";

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("Please define TURSO_URL in .env.local");
}

if (!authToken) {
  throw new Error("Please define TURSO_AUTH_TOKEN in .env.local");
}

const client = createClient({ url, authToken });

client.execute(`
  CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`).catch((err) => {
  console.error("Failed to ensure rsvps table:", err);
});

export { client };
