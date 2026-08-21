const express = require('express');
const { getDB, saveDB } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/store  (marketplace items)
router.get('/', requireAuth, (req, res) => {
  const db = getDB();
  const items = db.storeItems.map(i => ({ ...i, installedByMe: i.installed.includes(req.user.id) }));
  res.json({ items });
});

// POST /api/store/:id/install
router.post('/:id/install', requireAuth, (req, res) => {
  const db = getDB();
  const item = db.storeItems.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Không tìm thấy tiện ích.' });
  if (!item.installed.includes(req.user.id)) item.installed.push(req.user.id);
  saveDB(db);
  res.json({ item: { ...item, installedByMe: true } });
});

// POST /api/store/:id/uninstall
router.post('/:id/uninstall', requireAuth, (req, res) => {
  const db = getDB();
  const item = db.storeItems.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Không tìm thấy tiện ích.' });
  item.installed = item.installed.filter(uid => uid !== req.user.id);
  saveDB(db);
  res.json({ item: { ...item, installedByMe: false } });
});

module.exports = router;
