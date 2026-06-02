/**
 * Database index setup / migration script.
 *
 * Creates all MongoDB indexes used by Synapse. Run this once on deploy (and
 * after adding new indexes) instead of creating indexes lazily on every
 * runtime connection.
 *
 * Usage:
 *   pnpm db:indexes              # loads .env.local automatically if present
 *   MONGODB_URI=... node scripts/create-indexes.mjs
 *
 * Index creation is idempotent — re-running is safe.
 */
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "synapse";

if (!uri) {
  console.error(
    "MONGODB_URI is not defined. Set it in .env.local or pass it inline, e.g.\n" +
      "  MONGODB_URI=mongodb://localhost:27017 node scripts/create-indexes.mjs"
  );
  process.exit(1);
}

/**
 * Each entry: collection, index key spec, and options.
 * Keep this list as the single source of truth for indexes.
 */
const INDEXES = [
  { collection: "users", keys: { email: 1 }, options: { unique: true, name: "email_unique" } },
  { collection: "courses", keys: { userId: 1, createdAt: -1 }, options: { name: "userId_createdAt" } },
  {
    collection: "lessons",
    keys: { courseId: 1, userId: 1, sequenceOrder: 1 },
    options: { name: "courseId_userId_sequenceOrder" },
  },
  { collection: "quizzes", keys: { userId: 1, createdAt: -1 }, options: { name: "userId_createdAt" } },
  { collection: "documents", keys: { userId: 1, createdAt: -1 }, options: { name: "userId_createdAt" } },
  { collection: "questions", keys: { userId: 1, createdAt: -1 }, options: { name: "userId_createdAt" } },
  { collection: "videos", keys: { userId: 1, createdAt: -1 }, options: { name: "userId_createdAt" } },
  { collection: "payments", keys: { reference: 1 }, options: { unique: true, name: "reference_unique" } },
];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  console.log(`Connected to database "${dbName}". Creating ${INDEXES.length} indexes...`);

  for (const { collection, keys, options } of INDEXES) {
    try {
      const name = await db.collection(collection).createIndex(keys, options);
      console.log(`  ✓ ${collection}: ${name} -> ${JSON.stringify(keys)}`);
    } catch (error) {
      console.error(`  ✗ ${collection}: failed to create index ${JSON.stringify(keys)} — ${error.message}`);
      throw error;
    }
  }

  await client.close();
  console.log("All indexes created successfully.");
}

main().catch((error) => {
  console.error("Index setup failed:", error);
  process.exit(1);
});
