// src/controllers/articles.controller.js

const db = require("../db");

const VALID_STATUSES = new Set(["draft", "published"]);

function formatDate(d = new Date()) {
  // Matches the frontend's `toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })`
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Converts a raw DB row (tags stored as a JSON string) into the shape the frontend expects.
function rowToArticle(row) {
  let tags = [];
  try {
    tags = JSON.parse(row.tags);
  } catch {
    tags = [];
  }

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    author: row.author,
    excerpt: row.excerpt,
    body: row.body,
    image: row.image,
    status: row.status,
    tags,
    date: row.date,
  };
}

// GET /api/articles?status=draft|published (status filter optional)
function listArticles(req, res) {
  const { status } = req.query;

  let rows;
  if (status && VALID_STATUSES.has(status)) {
    rows = db
      .prepare("SELECT * FROM articles WHERE status = ? ORDER BY id DESC")
      .all(status);
  } else {
    rows = db.prepare("SELECT * FROM articles ORDER BY id DESC").all();
  }

  res.json(rows.map(rowToArticle));
}

// GET /api/articles/:id
function getArticle(req, res) {
  const row = db.prepare("SELECT * FROM articles WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Article not found" });
  res.json(rowToArticle(row));
}

// POST /api/articles
function createArticle(req, res) {
  const { title, category, author, excerpt, body, image, status, tags } = req.body;

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "Title is required" });
  }
  if (!body || !String(body).trim()) {
    return res.status(400).json({ error: "Body is required" });
  }

  const finalStatus = VALID_STATUSES.has(status) ? status : "draft";
  const finalTags = Array.isArray(tags) ? tags : [];
  const date = formatDate();

  const result = db
    .prepare(
      `INSERT INTO articles (title, category, author, excerpt, body, image, status, tags, date)
       VALUES (@title, @category, @author, @excerpt, @body, @image, @status, @tags, @date)`
    )
    .run({
      title: String(title).trim(),
      category: category || "",
      author: author?.trim() || "Admin",
      excerpt: excerpt?.trim() || "",
      body: String(body).trim(),
      image: image || null,
      status: finalStatus,
      tags: JSON.stringify(finalTags),
      date,
    });

  const created = db.prepare("SELECT * FROM articles WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(rowToArticle(created));
}

// PUT /api/articles/:id
function updateArticle(req, res) {
  const existing = db.prepare("SELECT * FROM articles WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Article not found" });

  const { title, category, author, excerpt, body, image, status, tags } = req.body;

  if (title !== undefined && !String(title).trim()) {
    return res.status(400).json({ error: "Title cannot be empty" });
  }
  if (body !== undefined && !String(body).trim()) {
    return res.status(400).json({ error: "Body cannot be empty" });
  }

  const finalStatus = status !== undefined
    ? (VALID_STATUSES.has(status) ? status : existing.status)
    : existing.status;

  db.prepare(
    `UPDATE articles SET
      title = @title,
      category = @category,
      author = @author,
      excerpt = @excerpt,
      body = @body,
      image = @image,
      status = @status,
      tags = @tags,
      updated_at = datetime('now')
     WHERE id = @id`
  ).run({
    id: existing.id,
    title: title !== undefined ? String(title).trim() : existing.title,
    category: category !== undefined ? category : existing.category,
    author: author !== undefined ? author.trim() || "Admin" : existing.author,
    excerpt: excerpt !== undefined ? excerpt.trim() : existing.excerpt,
    body: body !== undefined ? String(body).trim() : existing.body,
    image: image !== undefined ? image : existing.image,
    status: finalStatus,
    tags: JSON.stringify(Array.isArray(tags) ? tags : JSON.parse(existing.tags)),
  });

  const updated = db.prepare("SELECT * FROM articles WHERE id = ?").get(existing.id);
  res.json(rowToArticle(updated));
}

// DELETE /api/articles/:id
function deleteArticle(req, res) {
  const result = db.prepare("DELETE FROM articles WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Article not found" });
  res.status(204).send();
}

module.exports = {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
};
