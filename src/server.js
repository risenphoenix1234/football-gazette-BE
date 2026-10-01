// src/server.js

require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const articlesRoutes = require("./routes/articles.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" })); // article bodies can be a fair bit of HTML

// Serve uploaded images statically, e.g. GET /uploads/172093...jpg
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/api/articles", articlesRoutes);

// 404 for anything else under /api
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Football Gazette API listening on http://localhost:${PORT}`);
});
