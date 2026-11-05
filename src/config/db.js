import { MongoClient } from "mongodb";
const client = new MongoClient(process.env.MONGODB_URI);
let db;
// Cached connection: safe for serverless hosting where the file may re-run.
export async function getDb() {
  if (!db) {
    await client.connect();
    db = client.db("communityEvents");
    await db
      .collection("joinedEvents")
      .createIndex({ eventId: 1, userEmail: 1 }, { unique: true });
  }
  return db;
}
