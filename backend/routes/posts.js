const express = require('express');
const { getDB, saveDB, uuid } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { makeUploader } = require('../middleware/upload');

const router = express.Router();
const uploadPostImg = makeUploader('posts');

function withAuthor(db, post) {
  const author = db.users.find(u => u.id === post.authorId);
  return {
    ...post,
    author: author ? { id: author.id, username: author.username, fullName: author.fullName, avatar: author.avatar, role: author.role } : null,
    likeCount: post.likes.length,
    commentCount: post.comments.length
  };
}

// GET /api/posts  (news feed, newest first)
router.get('/', requireAuth, (req, res) => {
  const db = getDB();
  const feed = [...db.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(p => withAuthor(db, p));
  res.json({ posts: feed });
});

// POST /api/posts  (create a post, optional image)
router.post('/', requireAuth, uploadPostImg.single('image'), (req, res) => {
  const { content } = req.body || {};
  if (!content && !req.file) return res.status(400).json({ error: 'Bài viết trống.' });
  const db = getDB();
  const post = {
    id: uuid(),
    authorId: req.user.id,
    content: content || '',
    image: req.file ? `/uploads/posts/${req.file.filename}` : '',
    likes: [],
    comments: [],
    createdAt: new Date().toISOString()
  };
  db.posts.push(post);
  saveDB(db);
  res.status(201).json({ post: withAuthor(db, post) });
});

// DELETE /api/posts/:id
router.delete('/:id', requireAuth, (req, res) => {
  const db = getDB();
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
  if (post.authorId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Không đủ quyền.' });
  db.posts = db.posts.filter(p => p.id !== req.params.id);
  saveDB(db);
  res.json({ ok: true });
});

// POST /api/posts/:id/like  (toggle like)
router.post('/:id/like', requireAuth, (req, res) => {
  const db = getDB();
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
  const idx = post.likes.indexOf(req.user.id);
  if (idx >= 0) post.likes.splice(idx, 1);
  else post.likes.push(req.user.id);
  saveDB(db);
  res.json({ post: withAuthor(db, post) });
});

// POST /api/posts/:id/comments
router.post('/:id/comments', requireAuth, (req, res) => {
  const { content } = req.body || {};
  if (!content) return res.status(400).json({ error: 'Bình luận trống.' });
  const db = getDB();
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
  const comment = { id: uuid(), authorId: req.user.id, content, createdAt: new Date().toISOString() };
  post.comments.push(comment);
  saveDB(db);
  res.status(201).json({ post: withAuthor(db, post) });
});

module.exports = router;
