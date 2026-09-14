
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config as dotenvConfig } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load backend/.env when running locally
dotenvConfig({
  path: join(__dirname, '.env')
});

import express from 'express';
import cors from 'cors';
import multer from 'multer';

import {
  initializeApp,
  getApps,
  cert
} from 'firebase-admin/app';

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import {
  sendOwnerNotification,
  sendVisitorConfirmation
} from './services/brevoEmailService.js';


// ============================================================
// FIREBASE ADMIN
// ============================================================

let adminAuth;
let adminDb;
let adminRoleCheckEnabled = false;


/*
 * Parse Firebase service-account JSON.
 *
 * Render should contain the complete JSON as one line.
 * The function also handles a private_key containing
 * real line breaks.
 */
function getFirebaseServiceAccount() {

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!raw || raw.trim() === '') {
    return null;
  }

  let jsonText = raw.trim();

  // ----------------------------------------------------------
  // First: try normal JSON
  // ----------------------------------------------------------

  try {

    const account = JSON.parse(jsonText);

    // Convert escaped \n into real newlines
    if (account.private_key) {
      account.private_key =
        account.private_key.replace(/\\n/g, '\n');
    }

    return account;

  } catch (error) {

    console.warn(
      '⚠️ Normal Firebase JSON parsing failed.'
    );
  }


  // ----------------------------------------------------------
  // Second: repair actual newlines inside private_key
  // ----------------------------------------------------------

  try {

    const match = jsonText.match(
      /("private_key"\s*:\s*")([\s\S]*?)("\s*,\s*"client_email"\s*:)/m
    );

    if (!match) {
      throw new Error(
        'private_key field could not be located.'
      );
    }


    let privateKey = match[2];

    // Convert actual line breaks into escaped JSON newlines
    privateKey = privateKey
      .replace(/\r/g, '')
      .replace(/\n/g, '\\n');


    jsonText =
      jsonText.substring(0, match.index) +
      match[1] +
      privateKey +
      match[3] +
      jsonText.substring(
        match.index + match[0].length
      );


    const account = JSON.parse(jsonText);


    if (account.private_key) {
      account.private_key =
        account.private_key.replace(/\\n/g, '\n');
    }


    console.log(
      '✅ Firebase service-account JSON formatting repaired.'
    );

    return account;

  } catch (error) {

    console.error(
      '❌ FIREBASE_SERVICE_ACCOUNT_KEY is invalid.'
    );

    console.error(
      'Firebase JSON parsing error:',
      error.message
    );

    process.exit(1);
  }
}


try {

  if (!getApps().length) {

    const serviceAccount =
      getFirebaseServiceAccount();


    // --------------------------------------------------------
    // Service account available
    // --------------------------------------------------------

    if (serviceAccount) {

      initializeApp({
        credential: cert(serviceAccount)
      });

      adminRoleCheckEnabled = true;

      console.log(
        '✅ Firebase Admin initialized with service account.'
      );

      console.log(
        '✅ Firestore admin-role check ENABLED.'
      );

    }

    // --------------------------------------------------------
    // No service account
    // --------------------------------------------------------

    else {

      initializeApp({
        projectId: 'artgallery-69371'
      });

      console.warn(
        '⚠️ FIREBASE_SERVICE_ACCOUNT_KEY is not set.'
      );

      console.warn(
        '⚠️ Firestore admin-role check is DISABLED.'
      );
    }
  }


  adminAuth = getAuth();
  adminDb = getFirestore();


} catch (error) {

  console.error(
    '❌ Firebase Admin initialization failed:',
    error.message
  );

  process.exit(1);
}


// ============================================================
// EXPRESS
// ============================================================

const app = express();


// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174'
];


if (process.env.FRONTEND_URL) {

  allowedOrigins.push(
    process.env.FRONTEND_URL.replace(/\/$/, '')
  );
}


console.log(
  '🌐 Allowed origins:',
  allowedOrigins
);


app.use(
  cors({

    origin: (origin, callback) => {

      // Allow requests without Origin
      if (!origin) {
        return callback(null, true);
      }


      const cleanOrigin =
        origin.replace(/\/$/, '');


      if (
        allowedOrigins.includes(cleanOrigin)
      ) {

        return callback(null, true);
      }


      console.error(
        '❌ CORS blocked:',
        origin
      );


      return callback(
        new Error(
          'The CORS policy for this site does not allow access from the specified Origin.'
        ),
        false
      );
    },

    credentials: true
  })
);


app.use(express.json());


// ============================================================
// CLOUDINARY
// ============================================================

cloudinary.config({

  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET
});


const storage =
  new CloudinaryStorage({

    cloudinary: cloudinary,

    params: {
      folder: 'artgallery',

      allowed_formats: [
        'jpg',
        'jpeg',
        'png',
        'webp'
      ]
    }
  });


const upload =
  multer({

    storage: storage,

    limits: {
      fileSize: 8 * 1024 * 1024
    }
  });


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  '/api/health',
  (_req, res) => {

    res.json({
      status: 'ok'
    });
  }
);


// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

const verifyAdmin =
  async (req, res, next) => {

    const authHeader =
      req.headers.authorization;


    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {

      return res.status(401).json({
        error:
          'Unauthorized. No token provided.'
      });
    }


    const token =
      authHeader.substring(7);


    try {

      const decodedToken =
        await adminAuth.verifyIdToken(token);


      // Check Firestore admin role
      if (
        adminRoleCheckEnabled &&
        adminDb
      ) {

        const userDoc =
          await adminDb
            .collection('users')
            .doc(decodedToken.uid)
            .get();


        if (
          !userDoc.exists ||
          userDoc.data().role !== 'admin'
        ) {

          return res.status(403).json({
            error:
              'You are not authorized to perform this action.'
          });
        }
      }


      req.user = decodedToken;

      next();


    } catch (error) {

      console.error(
        '❌ Token verification error:',
        error.message
      );


      return res.status(401).json({
        error:
          'Unauthorized. Invalid or expired token.'
      });
    }
  };


// ============================================================
// UPLOAD ARTWORK IMAGES
// POST /api/upload
// ============================================================

app.post(
  '/api/upload',
  verifyAdmin,
  upload.array('images', 10),

  (req, res) => {

    if (
      !req.files ||
      req.files.length === 0
    ) {

      return res.status(400).json({
        error: 'No files uploaded'
      });
    }


    const images =
      req.files.map(
        (file, index) => ({

          src: file.path,

          public_id: file.filename,

          label:
            index === 0
              ? 'Full'
              : `View ${index}`
        })
      );


    return res.json({

      images,

      coverImage:
        images[0].src
    });
  }
);


// ============================================================
// DELETE ARTWORK IMAGES
// DELETE /api/upload
// ============================================================

app.delete(
  '/api/upload',
  verifyAdmin,

  async (req, res) => {

    const { paths } = req.body;


    if (!Array.isArray(paths)) {

      return res.status(400).json({
        error:
          'paths must be an array'
      });
    }


    const results = [];


    for (const p of paths) {

      try {

        let publicId = p;


        // If a Cloudinary URL was supplied
        if (
          typeof p === 'string' &&
          p.includes('/')
        ) {

          const matches =
            p.match(
              /upload\/(?:v\d+\/)?([^\.]+)/
            );


          if (matches) {
            publicId = matches[1];
          }
        }


        await cloudinary.uploader.destroy(
          publicId
        );


        results.push({

          path: p,

          deleted: true
        });


      } catch (error) {

        results.push({

          path: p,

          deleted: false,

          error:
            error.message
        });
      }
    }


    return res.json({
      results
    });
  }
);


// ============================================================
// CONTACT FORM
// POST /api/contact
// ============================================================

const isValidEmail =
  (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


app.post(
  '/api/contact',

  async (req, res) => {

    const {
      name,
      email,
      phone,
      type,
      message
    } = req.body;


    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (
      !name ||
      typeof name !== 'string' ||
      name.trim().length === 0
    ) {

      return res.status(400).json({
        error:
          'Name is required.'
      });
    }


    if (
      !email ||
      !isValidEmail(email.trim())
    ) {

      return res.status(400).json({
        error:
          'A valid email address is required.'
      });
    }


    if (
      !message ||
      typeof message !== 'string' ||
      message.trim().length === 0
    ) {

      return res.status(400).json({
        error:
          'Message is required.'
      });
    }


    if (
      name.trim().length > 120
    ) {

      return res.status(400).json({
        error:
          'Name is too long.'
      });
    }


    if (
      message.trim().length > 3000
    ) {

      return res.status(400).json({
        error:
          'Message is too long (max 3000 characters).'
      });
    }


    const safe = {

      name:
        name.trim(),

      email:
        email.trim().toLowerCase(),

      phone:
        (phone || '')
          .trim()
          .slice(0, 30),

      type:
        (type || '')
          .trim()
          .slice(0, 100),

      message:
        message.trim()
    };


    // --------------------------------------------------------
    // Send email
    // --------------------------------------------------------

    try {

      await sendOwnerNotification(
        safe
      );


      await sendVisitorConfirmation(
        safe
      );


      return res.status(200).json({

        success: true
      });


    } catch (error) {

      console.error(
        '[/api/contact] Failed to send email:',
        error.message
      );


      return res.status(500).json({

        error:
          'We could not send your message. Please try again later.'
      });
    }
  }
);


// ============================================================
// START SERVER
// ============================================================

const PORT =
  process.env.PORT || 5000;


app.listen(
  PORT,

  () => {

    console.log(
      `🖼️ Art Gallery backend listening on http://localhost:${PORT}`
    );
  }
);

