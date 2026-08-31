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
    'Contractor Reviews Offer Landing',
    'FB Alt Contractor Landing',
    'FB Contractor Landing',
    'FB Contractor Landing - 2',
    'Facebook Landing',
    'VT-1 Contractor Landing',
    'About Contact',
    'Contact Form',
]);

function sha256(value) {
    if (!value) return undefined;
    return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

// ---- Junk-lead screen -------------------------------------------------------
// Gated landing pages attract people who type "lol" / "b b" / "1555555534" to
// get past the form. Those are real humans on real ad clicks, so the honeypot
// never catches them. Sending them to the CAPI as Leads teaches Meta's
// optimizer to buy more of exactly that traffic, so they are screened here and
// the Lead event is skipped. Netlify still stores and emails the submission.
const JUNK_WORDS = /^(lol|lmao|lmfao|idk|idc|test|testing|tester|asd|asdf|asdfg|asdfgh|sdf|dsa|fdsa|qwe|qwer|qwert|qwerty|jkl|hjkl|abc|abcd|abcde|xyz|na|n\/a|none|nothing|blah|bleh|meh|fake|anon|anonymous|guest|user|username|firstname|lastname|first|last|company|business|mycompany|nombre|whatever|nunya)$/i;

function isFillerWord(word) {
    const w = String(word).replace(/[^a-z0-9'-]/gi, '');
    if (!w) return true;
    if (JUNK_WORDS.test(w)) return true;
    if (/^(.)\1*$/i.test(w)) return true;
    if (w.length > 3 && !/[aeiouy]/i.test(w)) return true;
    if (w.length > 3 && /^(..)\1+.?$/i.test(w)) return true;
    return false;
}

// North American Numbering Plan rules — no assignable number breaks these.
function isDialableUsNumber(value) {
    let d = String(value).replace(/\D/g, '');
    if (d.length === 11 && d[0] === '1') d = d.slice(1);
    if (d.length !== 10) return false;
    const npa = d.slice(0, 3), nxx = d.slice(3, 6), line = d.slice(6);
    if (!/^[2-9]/.test(npa)) return false;
    if (/^\d11$/.test(npa)) return false;
    if (npa === '555') return false;
    if (!/^[2-9]/.test(nxx)) return false;
    if (nxx === '555' && line.slice(0, 2) === '01') return false;
    if (/^(\d)\1{9}$/.test(d)) return false;
    if ('0123456789'.includes(d) || '9876543210'.includes(d)) return false;
    return true;
}

// Returns a reason string when the lead looks like gate-crashing, else null.
function junkReason(data) {
    const name = String(data.name || '').replace(/\s+/g, ' ').trim();
    const company = String(data.company || '').replace(/\s+/g, ' ').trim();
    const phone = String(data.phone || '').trim();

    if (phone && !isDialableUsNumber(phone)) return 'undialable phone: ' + phone;

    if (name) {
        const parts = name.split(' ').filter(Boolean);
        const namedOk = parts.length >= 2 && parts.every(
            (p) => p.replace(/[^a-z'-]/gi, '').length >= 2 && !isFillerWord(p)
        );
        if (!namedOk) return 'filler name: ' + name;
        if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
            return 'repeated-word name: ' + name;
        }
    }

    if (company) {
        const real = company.split(' ').filter(
            (w) => !isFillerWord(w) && w.replace(/[^a-z]/gi, '').length >= 2
        );
        if (!real.length) return 'filler company: ' + company;
    }

    return null;
}

// Signals too weak to reject a lead on their own. "red" is a plausible company,
// "lloln llk" is as pronounceable as "Lloyd", and a fast typist is not a liar —
// so no single one of these blocks anything. They only add up. A real lead
// almost never trips three at once; a gate-crasher usually trips four.
function suspicionScore(data) {
    const name = String(data.name || '').replace(/\s+/g, ' ').trim();
    const company = String(data.company || '').replace(/\s+/g, ' ').trim();
    const seconds = parseInt(data.fill_seconds, 10);
    const hits = [];
    let score = 0;
    const flag = (points, why) => { score += points; hits.push(why + ' +' + points); };

    // The quiz is three taps and three typed fields. Under 15s means nobody
    // read anything; under 8s means they were racing the gate.
    if (Number.isFinite(seconds)) {
        if (seconds < 8) flag(40, 'filled in ' + seconds + 's');
        else if (seconds < 15) flag(25, 'filled in ' + seconds + 's');
    }

    // iOS autocapitalises name fields, so an all-lowercase name means they
    // fought the keyboard to type it.
    if (name && name === name.toLowerCase()) flag(15, 'name never capitalised');
    if (company && company === company.toLowerCase()) flag(10, 'company never capitalised');

    // "red" — legitimate on its own, weak in combination
    if (company && company.split(' ').length === 1 && company.length <= 4) {
        flag(20, 'company is one short word');
    }
    if (name && company && name.toLowerCase() === company.toLowerCase()) {
        flag(25, 'name and company identical');
    }

    // Vowel-starved words: "lloln", "llk". Real surnames do this (Schmidt),
    // so it is worth points, never a rejection.
    const vowelStarved = (name + ' ' + company).split(' ').filter(Boolean).some((w) => {
        const letters = w.replace(/[^a-z]/gi, '');
        if (letters.length < 4) return false;
        const vowels = (letters.match(/[aeiouy]/gi) || []).length;
        return vowels / letters.length < 0.26;
    });
    if (vowelStarved) flag(15, 'vowel-starved word');

    return { score, hits };
}

const SUSPICION_LIMIT = 45;

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

    // Gate-crashers: keep the submission, but do not send it to Meta as a Lead.
    const junk = junkReason(data);
    if (junk) {
        console.log('[capi] skipping junk lead (' + formName + '): ' + junk);
        return { statusCode: 200, body: 'junk lead skipped: ' + junk };
    }

    const suspicion = suspicionScore(data);
    if (suspicion.score >= SUSPICION_LIMIT) {
        console.log(
            '[capi] skipping suspicious lead (' + formName + ') score ' + suspicion.score +
            ': ' + suspicion.hits.join(', ') + ' | ' + (data.name || '') + ' / ' + (data.company || '')
        );
        return { statusCode: 200, body: 'suspicious lead skipped, score ' + suspicion.score };
    }
    if (suspicion.score > 0) {
        console.log('[capi] lead passed with suspicion ' + suspicion.score + ': ' + suspicion.hits.join(', '));
    }

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

    // Meta values external_id at ~9% more attributed conversions. The hashed
    // email (or phone) is already a stable per-person id, so this costs nothing.
    const externalId = emailHash || phoneHash;
    if (externalId) userData.external_id = [externalId];

    // Visitor IP is worth ~31% more attributed conversions. Netlify does not
    // put it in payload.data; it has turned up on the submission envelope under
    // different names depending on form type, so try the known ones. The log
    // below prints the envelope's keys so we can confirm what is actually there.
    const clientIp = payload.ip || payload.remote_ip || payload.client_ip || data.ip;
    if (clientIp) userData.client_ip_address = clientIp;

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

    // Events Manager reports coverage per parameter but not per lead. This makes
    // it checkable: for any given lead, the Netlify log shows exactly which match
    // keys went to Meta, so "0% fbc" can be confirmed or disproved from our side.
    console.log(
        '[capi] match keys for "' + formName + '": ' + Object.keys(userData).join(', ') +
        ' | fbc=' + (userData.fbc ? 'yes' : 'NO') +
        ' | envelope keys: ' + Object.keys(payload).join(',')
    );

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
