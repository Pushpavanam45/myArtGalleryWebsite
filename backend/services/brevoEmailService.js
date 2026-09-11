// backend/services/brevoEmailService.js
// Handles all Brevo transactional email API calls.
// The API key is read exclusively from environment variables — never hardcoded.

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Low-level helper that POSTs a payload to the Brevo API.
 * @param {object} payload - A valid Brevo send-email payload.
 * @returns {Promise<void>}
 */
async function sendViaBrevo(payload) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY environment variable is not set.');

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,         // ← API key only in server-side header, never exposed
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // Log status only — never log the API key or raw auth headers
    const text = await response.text();
    console.error(`[Brevo] API error ${response.status}:`, text);
    throw new Error(`Brevo API returned ${response.status}`);
  }
}

/**
 * Sends the contact enquiry notification to the gallery owner.
 */
export async function sendOwnerNotification({ name, email, phone, type, message }) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName  = process.env.BREVO_SENDER_NAME  || 'GM Art Gallery';
  const receiverEmail = process.env.BREVO_RECEIVER_EMAIL;

  if (!senderEmail || !receiverEmail) {
    throw new Error('BREVO_SENDER_EMAIL or BREVO_RECEIVER_EMAIL environment variables are not set.');
  }

  const phoneInfo = phone ? `\nPhone:   ${phone}` : '';
  const typeInfo  = type  ? `\nArtwork Type: ${type}` : '';

  const payload = {
    sender:  { name: senderName, email: senderEmail },
    to:      [{ email: receiverEmail }],
    replyTo: { email, name },           // ← allows one-click reply to visitor
    subject: `New Contact Request – ${type || 'General Enquiry'}`,
    textContent: [
      '=== New Contact Request from GM Art Gallery website ===',
      '',
      `Name:    ${name}`,
      `Email:   ${email}`,
      phoneInfo,
      typeInfo,
      '',
      'Message:',
      message,
      '',
      '────────────────────────────────',
      'This email was sent from the GM Art Gallery contact form.',
    ].join('\n'),
  };

  await sendViaBrevo(payload);
}

/**
 * Sends an automatic confirmation email to the visitor.
 * Errors here are logged and swallowed so a confirmation failure
 * does not hide the fact that the owner email succeeded.
 */
export async function sendVisitorConfirmation({ name, email, message }) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName  = process.env.BREVO_SENDER_NAME  || 'GM Art Gallery';

  if (!senderEmail) return; // silently skip if not configured

  const payload = {
    sender:  { name: senderName, email: senderEmail },
    to:      [{ email, name }],
    subject: 'Thank you for contacting GM Art Gallery',
    textContent: [
      `Hello ${name},`,
      '',
      'Thank you for contacting GM Art Gallery.',
      'We have received your message and will get back to you as soon as possible.',
      '',
      'Your message:',
      message,
      '',
      'Regards,',
      'GM Art Gallery',
    ].join('\n'),
  };

  try {
    await sendViaBrevo(payload);
  } catch (err) {
    // Log the error but do not rethrow — confirmation failure is non-critical
    console.error('[Brevo] Failed to send visitor confirmation:', err.message);
  }
}
