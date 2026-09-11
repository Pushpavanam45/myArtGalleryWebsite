import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config as dotenvConfig } from 'dotenv';

// Load .env from the backend/ directory regardless of where the process is started
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenvConfig({ path: join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendOwnerNotification, sendVisitorConfirmation } from './services/brevoEmailService.js';


const app = express();
app.use(cors());
app.use(express.json());

// ── Ensure uploads directory exists ────────────────────────────────────────
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Serve uploaded files as public static assets
app.use('/uploads', express.static(uploadDir));

// ── Multer config ──────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|webp)$/i;
  if (allowed.test(file.originalname)) cb(null, true);
  else cb(new Error('Unsupported file type. Only JPG, PNG, WEBP allowed.'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } });

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── POST /api/upload  (multiple images, field name: "images") ─────────────
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ error: 'No files uploaded' });

  const images = req.files.map((file, idx) => ({
    src: `/uploads/${file.filename}`,
    label: idx === 0 ? 'Full' : `View ${idx}`,
  }));

  res.json({ images, coverImage: images[0].src });
});

// ── DELETE /api/upload  (body: { paths: ["/uploads/xxx.jpg", ...] }) ───────
app.delete('/api/upload', async (req, res) => {
  const { paths } = req.body;
  if (!Array.isArray(paths)) return res.status(400).json({ error: 'paths must be an array' });

  const results = [];
  for (const p of paths) {
    // Prevent directory traversal
    const safe = path.normalize(p).replace(/^(\.\.[/\\])+/, '');
    const full = path.join(__dirname, safe);
    try {
      if (fs.existsSync(full)) await fs.promises.unlink(full);
      results.push({ path: p, deleted: true });
    } catch (e) {
      results.push({ path: p, deleted: false, error: e.message });
    }
  }
  res.json({ results });
});

// ── POST /api/contact ──────────────────────────────────────────────────────
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, type, message } = req.body;

  // Server-side validation
  if (!name || typeof name !== 'string' || name.trim().length === 0)
    return res.status(400).json({ error: 'Name is required.' });
  if (!email || !isValidEmail(email.trim()))
    return res.status(400).json({ error: 'A valid email address is required.' });
  if (!message || typeof message !== 'string' || message.trim().length === 0)
    return res.status(400).json({ error: 'Message is required.' });
  if (name.trim().length > 120)
    return res.status(400).json({ error: 'Name is too long.' });
  if (message.trim().length > 3000)
    return res.status(400).json({ error: 'Message is too long (max 3000 characters).' });

  const safe = {
    name:    name.trim(),
    email:   email.trim().toLowerCase(),
    phone:   (phone  || '').trim().slice(0, 30),
    type:    (type   || '').trim().slice(0, 100),
    message: message.trim(),
  };

  try {
    await sendOwnerNotification(safe);
    await sendVisitorConfirmation(safe); // non-critical — errors are swallowed internally
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[/api/contact] Failed to send email:', err.message);
    return res.status(500).json({ error: 'We could not send your message. Please try again later.' });
  }
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🖼️  Art Gallery backend listening on http://localhost:${PORT}`)
);
