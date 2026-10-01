// src/routes/articles.routes.js

const express = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const upload = require("../middleware/upload");
const controller = require("../controllers/articles.controller");

const router = express.Router();

// Public reads — the site's homepage/news pages can hit these without a key.
// If you want articles fully private until published, add requireAdmin here
// too and have the public site call a separate /api/public/articles route
// that only returns status = 'published'.
router.get("/", controller.listArticles);
router.get("/:id", controller.getArticle);

// Writes require the admin key.
router.post("/", requireAdmin, controller.createArticle);
router.put("/:id", requireAdmin, controller.updateArticle);
router.delete("/:id", requireAdmin, controller.deleteArticle);

// Image upload — used for both the cover image and in-body WYSIWYG images.
// Returns a URL the frontend can drop straight into `image` or insert into
// the article body, instead of storing the raw base64 data URL in the DB.
router.post("/upload-image", requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided (expected field name 'image')" });
  }

  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});

module.exports = router;
