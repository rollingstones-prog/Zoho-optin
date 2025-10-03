const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Allow frontend
app.use(cors({ origin: "https://rollingstones-itindus.com/" }));
app.use(bodyParser.json());

// 🔑 Credentials from .env
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const AUTH_DOMAIN = process.env.AUTH_DOMAIN;
const API_DOMAIN = process.env.API_DOMAIN;
const PORT = process.env.PORT || 3000;

// ✅ Function to get new Access Token
async function getAccessToken() {
  try {
    const res = await axios.post(`${AUTH_DOMAIN}/oauth/v2/token`, null, {
      params: {
        refresh_token: REFRESH_TOKEN,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
      },
    });

    console.log("✅ New Access Token Generated");
    return res.data.access_token;
  } catch (err) {
    console.error("❌ Error getting access token:", err.response?.data || err.message);
    throw new Error("Failed to get access token");
  }
}

// ✅ API Route
app.post("/optin", async (req, res) => {
  try {
    const accessToken = await getAccessToken();

    const leadData = {
      data: [
        {
          Last_Name: req.body.name || "Website Lead",
          Email: req.body.email,
          Phone: req.body.phone,
          Lead_Source: "Website Opt-in",
        },
      ],
    };

    const response = await axios.post(`${API_DOMAIN}/crm/v2/Leads`, leadData, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Lead Saved:", response.data);
    res.json({ success: true, message: "✅ Opt-in saved to Zoho CRM!" });
  } catch (err) {
    console.error("❌ Error saving lead:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "❌ Error saving opt-in",
      details: err.response?.data || err.message,
    });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
