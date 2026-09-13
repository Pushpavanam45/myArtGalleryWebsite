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
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { sendOwnerNotification, sendVisitorConfirmation } from './services/brevoEmailService.js';

// ── Firebase Admin Init ────────────────────────────────────────────────────
let adminAuth;
let adminDb;
let adminRoleCheckEnabled = false;

try {
  if (!getApps().length) {
    const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountRaw && serviceAccountRaw.trim() !== '') {
      let serviceAccount;
      try {
        // Handle both plain JSON and JSON with escaped newlines (common in env vars)
        serviceAccount = JSON.parse(serviceAccountRaw.replace(/\\n/g, '\n'));
      } catch (parseErr) {
        console.error('❌  FIREBASE_SERVICE_ACCOUNT_KEY is set but could not be parsed as JSON.');
        console.error('    Check that the value in backend/.env is valid JSON (no trailing commas, correct quotes).');
        console.error('    Parse error:', parseErr.message);
        process.exit(1);
      }

      initializeApp({ credential: cert(serviceAccount) });
      adminRoleCheckEnabled = true;
      console.log('✅  Firebase Admin initialized with service account. Firestore admin-role check ENABLED.');
    } else {
      initializeApp({ projectId: 'artgallery-69371' });
      console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT_KEY is not set in backend/.env.');
      console.warn('    Firestore admin-role check is DISABLED — only Firebase token signature is verified.');
      console.warn('    To enable full admin-role authorization, add FIREBASE_SERVICE_ACCOUNT_KEY to backend/.env.');
      console.warn('    See backend/.env.example for instructions.');
    }
  }
  adminAuth = getAuth();
  adminDb = getFirestore();
} catch (err) {
  console.error('❌  Firebase Admin initialization failed:', err.message);
  process.exit(1);
}

const app = express();
// ── CORS config ────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(express.json());

// ── Cloudinary & Multer config ─────────────────────────────────────────────
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'artgallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage: storage, limits: { fileSize: 8 * 1024 * 1024 } });

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Admin Verification Middleware ──────────────────────────────────────────
const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check Firestore for admin role if full credentials are provided
    if (adminRoleCheckEnabled && adminDb) {
      const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
      if (!userDoc.exists || userDoc.data().role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to perform this action.' });
      }
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
  }
};

// ── POST /api/upload  (multiple images, field name: "images") ─────────────
app.post('/api/upload', verifyAdmin, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ error: 'No files uploaded' });

  const images = req.files.map((file, idx) => ({
    src: file.path, // Cloudinary URL
    public_id: file.filename, // Cloudinary public_id (needed for deletion)
    label: idx === 0 ? 'Full' : `View ${idx}`,
  }));

  res.json({ images, coverImage: images[0].src });
});

// ── DELETE /api/upload  (body: { paths: ["public_id1", "public_id2"] }) ───────
app.delete('/api/upload', verifyAdmin, async (req, res) => {
  const { paths } = req.body;
  if (!Array.isArray(paths)) return res.status(400).json({ error: 'paths must be an array' });

  const results = [];
  for (const p of paths) {
    try {
      if (p.includes('/')) {
        // If it's a Cloudinary URL or path, try to extract public_id
        // Example: https://res.cloudinary.com/.../image/upload/v1234/artgallery/xyz.jpg -> artgallery/xyz
        const matches = p.match(/upload\/(?:v\d+\/)?([^\.]+)/);
        const public_id = matches ? matches[1] : p;
        await cloudinary.uploader.destroy(public_id);
        results.push({ path: p, deleted: true });
      } else {
        await cloudinary.uploader.destroy(p);
        results.push({ path: p, deleted: true });
      }
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
