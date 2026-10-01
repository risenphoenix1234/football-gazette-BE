// src/middleware/errorHandler.js

const multer = require("multer");

module.exports = function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "Image is too large (max 5MB)" });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }

  next();
};
