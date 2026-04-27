require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const { createMemoryModels } = require("./models/memoryStore");
const createAssessmentRouter = require("./routes/assessment");

const app = express();
const PORT = process.env.PORT || 5050;

// In-memory store — sessions live as long as the server process
const { Session, Submission } = createMemoryModels();

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
app.use("/api/assessment/submit", rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Too many submissions. Please contact support." }
}));

// Body parsing
app.use(express.json({ limit: "1mb" }));

// API routes
app.use("/api/assessment", createAssessmentRouter(Session, Submission));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`\n🚀 iFu Labs Assessment Server running on http://localhost:${PORT}\n`);
});

module.exports = app;
