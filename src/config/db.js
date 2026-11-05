import "dotenv/config";
import { MongoClient } from "mongodb";

let client;
let connectionPromise;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!connectionPromise) {
    const options = {};
    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;

    if (username && password) {
      options.auth = { username, password };
    }

    client = new MongoClient(uri, options);
    connectionPromise = client.connect().catch((error) => {
      client = undefined;
      connectionPromise = undefined;
      throw error;
    });
  }

  const connectedClient = await connectionPromise;
  return connectedClient.db();
}