const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();

// ✅ Allow frontend
app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());

// 🔑 MongoDB credentials from .env
const MONGO_URI = process.env.MONGO_URI; // Atlas connection string
const DB_NAME = process.env.DB_NAME || "mydatabase";
const PORT = process.env.PORT || 3000;

// Mongo Client
let db;
async function connectDB() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}
connectDB();

// ✅ API Route
app.post("/optin", async (req, res) => {
  try {
    const leadData = {
      name: req.body.name || "Website Lead",
      email: req.body.email,
      phone: req.body.phone,
      lead_source: "Website Opt-in",
      created_at: new Date(),
    };

    const result = await db.collection("leads").insertOne(leadData);

    console.log("✅ Lead Saved:", result.insertedId);
    res.json({ success: true, message: "✅ Opt-in saved to MongoDB!", id: result.insertedId });
  } catch (err) {
    console.error("❌ Error saving lead:", err.message);
    res.status(500).json({
      success: false,
      message: "❌ Error saving opt-in",
      details: err.message,
    });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
