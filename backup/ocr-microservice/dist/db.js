import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "synapse";
if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable inside your environment configuration.");
}
let cachedClient = null;
let cachedDb = null;
export async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    cachedClient = client;
    cachedDb = db;
    return { client, db };
}
