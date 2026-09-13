#!/usr/bin/env node
/**
 * setup-firebase-admin.js
 *
 * Helper script: converts a Firebase service-account JSON file into the
 * single-line environment variable format expected by backend/.env
 *
 * Usage:
 *   node backend/setup-firebase-admin.js path/to/serviceAccountKey.json
 *
 * The script will print the exact line you need to paste into backend/.env
 * It does NOT write to the file automatically – copy-paste is intentional
 * so you stay in control of your secrets.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = process.argv[2];

if (!inputPath) {
  console.error('Usage: node backend/setup-firebase-admin.js <path-to-serviceAccountKey.json>');
  process.exit(1);
}

let raw;
try {
  raw = readFileSync(resolve(process.cwd(), inputPath), 'utf8');
} catch (err) {
  console.error('❌  Could not read file:', inputPath);
  console.error('    Error:', err.message);
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(raw);
} catch (err) {
  console.error('❌  File does not contain valid JSON:', err.message);
  process.exit(1);
}

// Validate it looks like a Firebase service account
const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
const missing = requiredFields.filter(f => !parsed[f]);
if (missing.length) {
  console.error('❌  JSON is missing expected Firebase service-account fields:', missing.join(', '));
  process.exit(1);
}

if (parsed.type !== 'service_account') {
  console.error('❌  JSON "type" field is not "service_account". Is this the right file?');
  process.exit(1);
}

// Produce a compact single-line JSON (private_key newlines stay as \n escape sequences)
const oneLine = JSON.stringify(parsed);

console.log('\n✅  Service account JSON validated successfully.');
console.log(`    Project: ${parsed.project_id}`);
console.log(`    Client:  ${parsed.client_email}`);
console.log('\n── Copy the line below and paste it into backend/.env ──────────────────────\n');
console.log(`FIREBASE_SERVICE_ACCOUNT_KEY='${oneLine}'`);
console.log('\n────────────────────────────────────────────────────────────────────────────');
console.log('\n⚠️  NEVER commit backend/.env or the original JSON file to Git.');
console.log('    Both are already protected by .gitignore.\n');
