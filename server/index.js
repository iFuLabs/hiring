require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const assessmentRouter = require("./routes/assessment");

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL || true
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));

// Rate limiting
app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later" }
}));

// Body parsing
app.use(express.json({ limit: "1mb" }));

// API routes
app.use("/api/assessment", assessmentRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Only listen when run directly (not on Vercel)
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5050;
  app.listen(PORT, () => {
    console.log(`\n🚀 iFu Labs Assessment Server running on http://localhost:${PORT}\n`);
  });
}

module.exports = app;
