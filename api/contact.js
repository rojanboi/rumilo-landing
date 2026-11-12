/* Vercel Function: receives the "Book a call / Umów rozmowę" form and emails the
   team through Resend (https://resend.com/docs/api-reference/emails/send-email).

   Environment variables (Vercel → Project → Settings → Environment Variables):
     RESEND_API_KEY  required. API key created in the Resend dashboard.
     CONTACT_FROM    sender, e.g. "Rumilo <rozmowa@your-domain.pl>". Its domain must be
                     verified in Resend. Without it the Resend test sender is used, and
                     that one only delivers to the address of the Resend account owner.
     CONTACT_TO      optional, comma-separated. Overrides the recipients listed below.

   Until a domain is verified in Resend, Resend refuses every recipient except the
   owner of the Resend account. In that case the request is delivered to the owner
   alone (with a note in the letter), so the form works from day one.

   Check the setup by opening /api/contact in a browser: it answers with JSON that
   says whether the key is visible to the function. After changing a variable on
   Vercel, redeploy; running deployments keep the old values.

   The form posts JSON when JavaScript runs and a regular form body when it does not;
   both are handled here. */
'use strict';

const DEFAULT_TO = [
  'antoni.malocha@startwarsaw.org',
  'artem.hordiienko@startwarsaw.org',
  'weronika.zygis@startwarsaw.org',
  'mikhail.troian@startwarsaw.org'
];
const TEST_SENDER = 'Rumilo <onboarding@resend.dev>';
const LIMITS = { name: 120, hotel: 160, reach: 160, time: 160 };
const EMAIL_RE = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;

const PAGE_TEXT = {
  pl: {
    okTitle: 'Dziękujemy',
    ok: 'Zgłoszenie dotarło. Odezwiemy się wkrótce.',
    failTitle: 'Nie udało się wysłać zgłoszenia',
    fail: 'Prosimy spróbować ponownie za chwilę.',
    invalid: 'Wymagane: imię, nazwa hotelu, sposób kontaktu i zaznaczona zgoda.',
    back: 'Powrót na stronę'
  },
  en: {
    okTitle: 'Thank you',
    ok: 'Your request is with us. We will get back to you shortly.',
    failTitle: 'We could not send your request',
    fail: 'Please try again in a moment.',
    invalid: 'Please fill in your name, hotel and a way to reach you, and tick the consent box.',
    back: 'Back to the site'
  }
};

// One line of plain text: no control characters (keeps headers and the body clean), trimmed, capped.
function clean(value, max) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .trim()
    .slice(0, max);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function recipients() {
  const fromEnv = (process.env.CONTACT_TO || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => EMAIL_RE.test(s));
  return fromEnv.length ? fromEnv : DEFAULT_TO;
}

// Visitors without JavaScript get a small standalone page instead of JSON.
function page(lang, ok, message) {
  const t = PAGE_TEXT[lang];
  const title = ok ? t.okTitle : t.failTitle;
  return '<!DOCTYPE html><html lang="' + lang + '"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="dark">' +
    '<meta name="robots" content="noindex"><title>' + escapeHtml(title) + ' — Rumilo</title>' +
    '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#151515;color:#fff;' +
    'font:1rem/1.55 system-ui,sans-serif}main{max-width:32rem;padding:2rem}h1{margin:0 0 .75rem;font-size:2rem;' +
    'line-height:1.1}p{margin:0 0 1.5rem;color:#a3a3a3}a{color:#fff;text-underline-offset:6px}</style></head>' +
    '<body><main><h1>' + escapeHtml(title) + '</h1><p>' + escapeHtml(message) + '</p>' +
    '<a href="/#contact">' + escapeHtml(t.back) + '</a></main></body></html>';
}

async function sendWithResend(apiKey, email) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(email)
  });
  return { ok: response.ok, status: response.status, text: response.ok ? '' : await response.text() };
}

// Resend's "testing only" refusal names the one address it would deliver to.
function ownerFromRefusal(text) {
  const match = /\(([^()\s]+@[^()\s]+)\)/.exec(text || '');
  return match && EMAIL_RE.test(match[1]) ? match[1] : null;
}

module.exports = async function handler(req, res) {
  // Setup check for the team: no secrets, only whether the settings are in place.
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      ok: true,
      service: 'rumilo contact form',
      apiKey: Boolean(process.env.RESEND_API_KEY),
      sender: process.env.CONTACT_FROM ? 'CONTACT_FROM' : 'resend test sender (delivers to the account owner only)',
      recipients: recipients().length
    });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  let body;
  try {
    body = req.body; // parsed by Vercel for JSON and urlencoded bodies; throws on malformed JSON
  } catch (e) {
    body = null;
  }
  if (!body || typeof body !== 'object') body = {};

  const contentType = String(req.headers['content-type'] || '');
  const wantsJson = contentType.includes('application/json') ||
    String(req.headers.accept || '').includes('application/json');
  const lang = body.lang === 'en' ? 'en' : 'pl';
  const t = PAGE_TEXT[lang];

  const reply = (status, ok, error, message) => {
    res.setHeader('Cache-Control', 'no-store');
    if (wantsJson) return res.status(status).json(ok ? { ok: true } : { ok: false, error });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(status).send(page(lang, ok, message));
  };

  // Spam trap: a filled hidden field means a bot. Answer as if it worked and send nothing.
  if (clean(body.company_site, 200)) return reply(200, true, null, t.ok);

  const data = {
    name: clean(body.name, LIMITS.name),
    hotel: clean(body.hotel, LIMITS.hotel),
    reach: clean(body.reach, LIMITS.reach),
    time: clean(body.time, LIMITS.time)
  };
  const consent = body.consent === 'yes' || body.consent === 'on' || body.consent === true;
  if (!data.name || !data.hotel || !data.reach || !consent) {
    return reply(400, false, 'invalid', t.invalid);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('contact: RESEND_API_KEY is not set');
    return reply(500, false, 'not_configured', t.fail);
  }

  const email = {
    from: process.env.CONTACT_FROM || TEST_SENDER,
    to: recipients(),
    subject: 'Rumilo: call request — ' + data.hotel,
    text: [
      'New call request from the Rumilo landing page.',
      '',
      'Name:           ' + data.name,
      'Hotel:          ' + data.hotel,
      'Contact:        ' + data.reach,
      'Preferred time: ' + (data.time || '—'),
      'Page language:  ' + lang,
      'Sent:           ' + new Date().toISOString()
    ].join('\n')
  };
  // lets the team answer the visitor with a plain "Reply" when they left an email address
  if (EMAIL_RE.test(data.reach)) email.reply_to = data.reach;

  try {
    let result = await sendWithResend(apiKey, email);

    // 403 = Resend will not send this: the sender's domain is not verified, or the
    // account is still in testing mode. Fall back step by step to what it does allow.
    if (!result.ok && result.status === 403 && email.from !== TEST_SENDER && !ownerFromRefusal(result.text)) {
      console.warn('contact: CONTACT_FROM was refused, retrying with the Resend test sender.', result.text);
      email.from = TEST_SENDER;
      result = await sendWithResend(apiKey, email);
    }
    const owner = !result.ok && result.status === 403 ? ownerFromRefusal(result.text) : null;
    if (owner) {
      console.warn('contact: no verified sending domain, delivering to the Resend account owner only.');
      email.from = TEST_SENDER;
      email.to = [owner];
      email.text += '\n\nNote: this letter reached only the owner of the Resend account. ' +
        'To deliver to the whole team, verify a domain at resend.com/domains and set CONTACT_FROM.';
      result = await sendWithResend(apiKey, email);
    }

    if (!result.ok) {
      console.error('contact: Resend answered', result.status, result.text);
      const error = result.status === 401 ? 'bad_api_key' : result.status === 403 ? 'sender_not_allowed' : 'send_failed';
      return reply(502, false, error, t.fail);
    }
  } catch (err) {
    console.error('contact: request to Resend failed', err);
    return reply(502, false, 'send_failed', t.fail);
  }

  return reply(200, true, null, t.ok);
};
