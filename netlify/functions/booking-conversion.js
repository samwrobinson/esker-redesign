// Fires a server-side Meta "Schedule" conversion when someone books a call.
//
// The calendar is a LeadConnector iframe on another origin, so the booking is
// invisible to /vt-1/. GHL redirects to /vt-1/booked/ after a confirmed
// booking, and that page POSTs here with the _fbp / _fbc cookies it can read
// (same origin as the landing page, so the ad click is still attributable).
//
// Mirrors submission-created.js: same pixel, same hashing, same token.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

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

function sha256(value) {
    if (!value) return undefined;
    return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'method not allowed' };

    const TOKEN = process.env.META_CAPI_TOKEN;
    if (!TOKEN) {
        console.error('[booking] META_CAPI_TOKEN is not set — skipping');
        return { statusCode: 200, body: 'no token' };
    }

    let b;
    try {
        b = JSON.parse(event.body || '{}');
    } catch (e) {
        return { statusCode: 200, body: 'unparseable' };
    }

    const userData = {};
    if (b.fbp) userData.fbp = b.fbp;
    if (b.fbc) userData.fbc = b.fbc;
    if (b.ua) userData.client_user_agent = b.ua;
    const ip = (event.headers['x-nf-client-connection-ip'] ||
                (event.headers['x-forwarded-for'] || '').split(',')[0] || '').trim();
    if (ip) userData.client_ip_address = ip;
    const emailHash = sha256(b.email);
    if (emailHash) {
        userData.em = [emailHash];
        userData.external_id = [emailHash];
    }

    // Same event_id from the browser pixel and from here, so Meta collapses the
    // pair instead of counting the booking twice.
    const body = {
        data: [{
            event_name: 'Schedule',
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            event_id: b.event_id || undefined,
            event_source_url: b.page_url || undefined,
            user_data: userData,
        }],
    };
    if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

    console.log('[booking] Schedule match keys: ' + Object.keys(userData).join(', ') +
                ' | fbc=' + (userData.fbc ? 'yes' : 'NO'));

    try {
        const res = await fetch(
            `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${TOKEN}`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        );
        const text = await res.text();
        if (!res.ok) console.error('[booking] Meta error', res.status, text);
        else console.log('[booking] Schedule sent', text);
    } catch (e) {
        console.error('[booking] request failed', e);
    }

    return { statusCode: 200, body: 'ok' };
};
