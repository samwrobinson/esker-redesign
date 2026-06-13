// Netlify auto-invokes this function whenever a Netlify form submission is
// verified. It forwards qualifying lead submissions to the Meta Conversions
// API (server-side), so Lead conversions are captured even when the browser
// pixel is blocked. event_id is derived from the email so duplicate submissions
// from the same person collapse into one (Meta dedupes same event_id within 48h).

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Local .env fallback (Netlify production uses real env vars)
try {
    const envFile = fs.readFileSync(path.resolve(__dirname, '../../.env'), 'utf8');
    envFile.split('\n').forEach(function (line) {
        const [key, ...vals] = line.split('=');
        if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
    });
} catch (e) {
    /* no .env — use process.env */
}

const PIXEL_ID = process.env.META_PIXEL_ID || '3889075514559305';
const API_VERSION = 'v21.0';

// Forms that represent a real lead (everything else — newsletter, lead magnets — is ignored)
const LEAD_FORMS = new Set([
    'Contractor Offer Landing',
    'FB Alt Contractor Landing',
    'FB Contractor Landing',
    'FB Contractor Landing - 2',
    'Facebook Landing',
    'About Contact',
    'Contact Form',
]);

function sha256(value) {
    if (!value) return undefined;
    return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

function hashPhone(value) {
    if (!value) return undefined;
    let digits = String(value).replace(/\D/g, '');
    if (!digits) return undefined;
    if (digits.length === 10) digits = '1' + digits; // assume US if no country code
    return crypto.createHash('sha256').update(digits).digest('hex');
}

exports.handler = async function (event) {
    const TOKEN = process.env.META_CAPI_TOKEN;
    if (!TOKEN) {
        console.error('[capi] META_CAPI_TOKEN is not set — skipping');
        return { statusCode: 200, body: 'no token' };
    }

    let payload;
    try {
        payload = JSON.parse(event.body).payload;
    } catch (e) {
        return { statusCode: 200, body: 'unparseable payload' };
    }
    if (!payload) return { statusCode: 200, body: 'no payload' };

    const formName = payload.form_name || '';
    const data = payload.data || {};

    // Honeypot / not a lead form → ignore
    if (data['bot-field']) return { statusCode: 200, body: 'honeypot' };
    if (!LEAD_FORMS.has(formName)) return { statusCode: 200, body: 'not a lead form: ' + formName };

    const email = data.email || payload.email || '';
    const phone = data.phone || '';
    const fullName = data.name || payload.name || '';

    // The shared "Contact Form" name is also used by the newsletter popup —
    // a bare email with no name/phone/message is a newsletter signup, not a lead.
    if (formName === 'Contact Form' && !phone && !fullName && !data.message) {
        return { statusCode: 200, body: 'newsletter signup, skipped' };
    }

    const emailHash = sha256(email);
    const eventId = 'lead_' + (emailHash || hashPhone(phone) || payload.id || Math.random().toString(36).slice(2));

    const userData = {};
    if (emailHash) userData.em = [emailHash];
    const phoneHash = hashPhone(phone);
    if (phoneHash) userData.ph = [phoneHash];
    if (fullName) {
        const parts = String(fullName).trim().split(/\s+/);
        userData.fn = [sha256(parts[0])];
        if (parts.length > 1) userData.ln = [sha256(parts.slice(1).join(' '))];
    }
    if (data.fbp) userData.fbp = data.fbp;
    if (data.fbc) userData.fbc = data.fbc;
    if (data.ua) userData.client_user_agent = data.ua;

    const eventTime = Math.floor(Date.parse(payload.created_at) / 1000) || Math.floor(Date.now() / 1000);

    const body = {
        data: [
            {
                event_name: 'Lead',
                event_time: eventTime,
                action_source: 'website',
                event_id: eventId,
                event_source_url: data.page_url || payload.site_url || undefined,
                user_data: userData,
            },
        ],
    };

    // Set META_TEST_EVENT_CODE temporarily to see events in Events Manager → Test Events
    if (process.env.META_TEST_EVENT_CODE) {
        body.test_event_code = process.env.META_TEST_EVENT_CODE;
    }

    try {
        const res = await fetch(
            `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            }
        );
        const text = await res.text();
        if (!res.ok) {
            console.error('[capi] Meta error', res.status, text);
        } else {
            console.log('[capi] Lead sent for "' + formName + '"', text);
        }
    } catch (e) {
        console.error('[capi] request failed', e);
    }

    return { statusCode: 200, body: 'ok' };
};
