const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB, saveDB } = require('../db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function sanitize(user) {
  const { password, ...rest } = user;
  return rest;
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Thiếu tài khoản hoặc mật khẩu.' });

  const db = getDB();
  const user = db.users.find(u => u.username.toLowerCase() === String(username).toLowerCase());
  if (!user) return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác.' });
  if (user.status === 'locked') return res.status(403).json({ error: 'Tài khoản đã bị khóa. Liên hệ Admin.' });

  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác.' });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: EXPIRES_IN });
  res.json({ token, user: sanitize(user) });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: sanitize(req.user) });
});

// PUT /api/auth/password
router.put('/password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải tối thiểu 6 ký tự.' });
  }
  const db = getDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!bcrypt.compareSync(currentPassword || '', user.password)) {
    return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng.' });
  }
  user.password = bcrypt.hashSync(newPassword, 10);
  saveDB(db);
  res.json({ ok: true });
});

module.exports = router;
