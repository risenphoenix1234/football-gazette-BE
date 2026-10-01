// src/middleware/requireAdmin.js
//
// Placeholder auth: checks a shared secret sent as `x-admin-key`.
// This is enough to stop the API being wide open on day one, but it is
// NOT real user authentication — anyone who has the key can do anything.
// Before this goes live, replace this with proper login (JWT/session +
// a users table), especially since this API can delete content and
// accept file uploads.
module.exports = function requireAdmin(req, res, next) {
  const provided = req.header("x-admin-key");

  if (!process.env.ADMIN_API_KEY) {
    console.warn(
      "[auth] ADMIN_API_KEY is not set — refusing all admin requests. Set it in .env"
    );
    return res.status(500).json({ error: "Server is missing ADMIN_API_KEY configuration" });
  }

  if (!provided || provided !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};
