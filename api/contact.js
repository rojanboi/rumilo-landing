/* Vercel Function: receives the call-request form and emails the team.

   There are two ways to send. The function picks one by the environment variables
   it finds (Vercel → Project → Settings → Environment Variables).

   1. Gmail. Needs no domain of your own: letters leave from a Gmail or Google
      Workspace mailbox and reach every recipient.
        GMAIL_USER          the mailbox that sends, e.g. rumilo.team@gmail.com
        GMAIL_APP_PASSWORD  an app password for that mailbox, created at
                            https://myaccount.google.com/apppasswords
                            (2-Step Verification must be on). Not the normal password.

   2. Resend (https://resend.com). Used when the Gmail variables are absent, and as
      a second try when Gmail fails.
        RESEND_API_KEY  API key from the Resend dashboard.
        CONTACT_FROM    the sender (not a recipient), e.g. "Rumilo <rozmowa@your-domain.pl>".
                        Its domain must be verified in Resend. Without a verified domain
                        Resend delivers only to the owner of the Resend account, and the
                        request is then sent to that owner alone, with a note in the letter.

   Both ways:
        CONTACT_TO      optional, comma-separated. Overrides the recipients listed below.

   Check the setup by opening /api/contact in a browser. The JSON says which way is
   active and, for Gmail, whether the login works. That check sends no letter.
   After changing a variable on Vercel, redeploy; running deployments keep the old values.

   The form posts JSON when JavaScript runs and a regular form body when it does not;
   both are handled here. */
'use strict';

const nodemailer = require('nodemailer');

const DEFAULT_TO = [
  'antoni.malocha@startwarsaw.org',
  'artem.hordiienko@startwarsaw.org',
  'weronika.zygis@startwarsaw.org',
  'mikhail.troian@startwarsaw.org'
];
const TEST_SENDER = 'Rumilo <onboarding@resend.dev>';
const LIMITS = { name: 120, hotel: 160, reach: 160, time: 160 };
const EMAIL_RE = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;
const LOGIN_CHECK_TTL = 2 * 60 * 1000;

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

/* ---------- Gmail ---------- */

function gmailSettings() {
  const user = (process.env.GMAIL_USER || '').trim();
  // Google shows an app password as four groups; the spaces are not part of it
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  return user && pass ? { user, pass } : null;
}

function gmailTransport(settings) {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: settings.user, pass: settings.pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000
  });
}

// Outcome of a delivery attempt: { ok, delivery } or { ok: false, error }.
async function deliverWithGmail(settings, email) {
  try {
    const info = await gmailTransport(settings).sendMail({
      from: { name: 'Rumilo', address: settings.user },
      to: email.to,
      subject: email.subject,
      text: email.text,
      replyTo: email.reply_to
    });
    const refused = (info.rejected || []).length;
    if (refused) console.warn('contact: Gmail did not accept ' + refused + ' of the recipients');
    return { ok: true, delivery: 'all_recipients' };
  } catch (err) {
    const code = err && err.code;
    console.error('contact: Gmail failed', code, err && err.responseCode, err && err.message);
    return { ok: false, error: code === 'EAUTH' ? 'bad_credentials' : 'send_failed' };
  }
}

// Logs in to Gmail without sending anything. One real attempt every two minutes at most,
// so that reloading the check page does not hammer the mailbox.
let loginCheck = null;
async function gmailLogin(settings) {
  if (loginCheck && Date.now() - loginCheck.at < LOGIN_CHECK_TTL) return loginCheck.result;
  let result = 'ok';
  try {
    await gmailTransport(settings).verify();
  } catch (err) {
    console.error('contact: Gmail login check failed', err && err.code, err && err.responseCode, err && err.message);
    result = err && err.code === 'EAUTH' ? 'refused' : 'unreachable';
  }
  loginCheck = { at: Date.now(), result };
  return result;
}

/* ---------- Resend ---------- */

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

async function deliverWithResend(apiKey, message) {
  const email = Object.assign({ from: process.env.CONTACT_FROM || TEST_SENDER }, message);
  let delivery = 'all_recipients';
  try {
    let result = await sendWithResend(apiKey, email);

    // 403 = the sender's domain is not verified, or the account is still in testing mode;
    // 422 = CONTACT_FROM is not a usable address. Fall back step by step to what Resend allows.
    const refused = (r) => !r.ok && (r.status === 403 || r.status === 422);
    if (refused(result) && email.from !== TEST_SENDER && !ownerFromRefusal(result.text)) {
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
        'To deliver to the whole team, set GMAIL_USER and GMAIL_APP_PASSWORD, ' +
        'or verify a domain at resend.com/domains and set CONTACT_FROM to an address at it.';
      delivery = 'owner_only';
      result = await sendWithResend(apiKey, email);
    }

    if (!result.ok) {
      console.error('contact: Resend answered', result.status, result.text);
      const error = result.status === 401 ? 'bad_api_key' : result.status === 403 ? 'sender_not_allowed' : 'send_failed';
      return { ok: false, error };
    }
    return { ok: true, delivery };
  } catch (err) {
    console.error('contact: request to Resend failed', err);
    return { ok: false, error: 'send_failed' };
  }
}

/* ---------- Setup check (GET) ---------- */

// For the team: no secrets and no addresses, only which way is active and who gets the letters.
async function setupReport() {
  const gmail = gmailSettings();
  const resend = Boolean(process.env.RESEND_API_KEY);
  const report = { ok: true, service: 'rumilo contact form', recipients: recipients().length };
  const say = (transport, delivery, hint) => Object.assign(report, { transport, delivery, hint });

  if (gmail) {
    report.gmailLogin = await gmailLogin(gmail);
    if (report.gmailLogin === 'ok') {
      return say('gmail', 'all_recipients', 'Gmail accepts the login. Letters go to every recipient.');
    }
    const fallback = resend ? ' Until it is fixed, requests go through Resend instead.' : ' Until it is fixed, requests are not delivered.';
    return say('gmail', resend ? 'resend_fallback' : 'none', report.gmailLogin === 'refused'
      ? 'Gmail refused the login. GMAIL_APP_PASSWORD must be an app password from myaccount.google.com/apppasswords ' +
        '(2-Step Verification on), and GMAIL_USER the full address of that mailbox.' + fallback
      : 'Gmail could not be reached for the check. Try again in a couple of minutes.' + fallback);
  }

  const half = process.env.GMAIL_USER || process.env.GMAIL_APP_PASSWORD
    ? ' Gmail is switched off: GMAIL_USER and GMAIL_APP_PASSWORD must both be set.'
    : ' To reach the whole team without a domain, set GMAIL_USER and GMAIL_APP_PASSWORD.';
  if (resend && process.env.CONTACT_FROM) {
    return say('resend', 'unknown', 'Letters reach every recipient only if the domain of CONTACT_FROM is verified at ' +
      'resend.com/domains; otherwise only the owner of the Resend account gets them.' + half);
  }
  if (resend) {
    return say('resend', 'owner_only', 'The Resend test sender delivers only to the owner of the Resend account.' + half);
  }
  return say('none', 'none', 'No mail settings in this deployment.' + half + ' Then redeploy.');
}

/* ---------- Handler ---------- */

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(await setupReport());
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

  const reply = (status, ok, error, message, extra) => {
    res.setHeader('Cache-Control', 'no-store');
    if (wantsJson) return res.status(status).json(ok ? Object.assign({ ok: true }, extra) : { ok: false, error });
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

  const gmail = gmailSettings();
  const apiKey = process.env.RESEND_API_KEY;
  if (!gmail && !apiKey) {
    console.error('contact: no mail settings. Set GMAIL_USER and GMAIL_APP_PASSWORD, or RESEND_API_KEY.');
    return reply(500, false, 'not_configured', t.fail);
  }

  const message = {
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
  if (EMAIL_RE.test(data.reach)) message.reply_to = data.reach;

  let outcome = gmail ? await deliverWithGmail(gmail, message) : await deliverWithResend(apiKey, message);
  // a visitor's request should not be lost to a Gmail problem while Resend is also set up
  if (!outcome.ok && gmail && apiKey) {
    console.warn('contact: falling back to Resend after the Gmail failure.');
    const second = await deliverWithResend(apiKey, message);
    if (second.ok) outcome = second;
  }

  if (!outcome.ok) return reply(502, false, outcome.error, t.fail);
  return reply(200, true, null, t.ok, { delivery: outcome.delivery });
};
