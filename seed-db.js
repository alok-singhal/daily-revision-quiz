// Run once to migrate existing config.json users into MongoDB
// Usage: MONGODB_URI=your_uri node seed-db.js

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("Set MONGODB_URI env variable"); process.exit(1); }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("practisetest");

  const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf-8"));

  for (const [name, data] of Object.entries(config)) {
    await db.collection("users").updateOne(
      { name },
      { $set: { name, ...data, active: true, createdAt: new Date() } },
      { upsert: true }
    );
    console.log(`✅ Seeded: ${name}`);
  }

  await client.close();
  console.log("Done!");
}

seed().catch(console.error);
