const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();

// ✅ Allow frontend (update this domain as needed)
app.use(
  cors({
    origin: ["https://rollingstones-itindus.com", "http://localhost:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

// 🔑 MongoDB credentials from .env
const MONGO_URI = process.env.MONGO_URI; // Full connection string from Atlas
const DB_NAME = process.env.DB_NAME || "mydatabase";
const PORT = process.env.PORT || 3000;

// ✅ MongoDB Connect Function (with SSL fix)
let db;

async function connectDB() {
  try {
    const client = new MongoClient(MONGO_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      ssl: true,
      tlsAllowInvalidCertificates: true, // ⚡ Avoid SSL handshake error on Render
      connectTimeoutMS: 20000,
      socketTimeoutMS: 20000,
      serverSelectionTimeoutMS: 20000,
    });

    await client.connect();
    db = client.db(DB_NAME);
    console.log("✅ Connected to MongoDB Atlas successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    setTimeout(connectDB, 5000); // 🔁 Retry connection every 5s
  }
}

connectDB();

// ✅ API Route to Save Leads
app.post("/optin", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ success: false, message: "Database not connected" });
    }

    const leadData = {
      name: req.body.name || "Website Lead",
      email: req.body.email,
      phone: req.body.phone || "N/A",
      lead_source: "Website Opt-in",
      created_at: new Date(),
      meta: req.body.meta || {},
    };

    const result = await db.collection("leads").insertOne(leadData);

    console.log("✅ Lead Saved:", result.insertedId);
    res.json({
      success: true,
      message: "✅ Opt-in saved to MongoDB!",
      id: result.insertedId,
    });
  } catch (err) {
    console.error("❌ Error saving lead:", err.message);
    res.status(500).json({
      success: false,
      message: "❌ Error saving opt-in",
      details: err.message,
    });
  }
});

// ✅ Root Route (for quick test)
app.get("/", (req, res) => {
  res.send("🚀 Mongo Opt-in API is running successfully!");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
