import { createClient } from "@libsql/client";

const dbMode = process.env.DB_MODE;

if (!dbMode || dbMode === "remote") {
  const url = process.env.TURSO_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("Please define TURSO_URL in .env.local for remote mode");
  }

  if (!authToken) {
    throw new Error("Please define TURSO_AUTH_TOKEN in .env.local for remote mode");
  }

  var client = createClient({ url, authToken });
} else if (dbMode === "local") {
  var client = createClient({ url: "file:./local.db" });
} else {
  throw new Error(`Unknown DB_MODE: ${dbMode}. Use 'local' or 'remote'`);
}

client.execute(`
  CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT DEFAULT '',
    dietary TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`).catch((err) => {
  console.error("Failed to ensure rsvps table:", err);
});

client.execute(`
  ALTER TABLE rsvps ADD COLUMN message TEXT DEFAULT ''
`).catch(() => {});
client.execute(`
  ALTER TABLE rsvps ADD COLUMN dietary TEXT DEFAULT ''
`).catch(() => {});

export { client };
