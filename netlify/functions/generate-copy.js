const fs = require('fs');
const path = require('path');

// Load .env file manually so Netlify CLI doesn't override it
try {
    const envPath = path.resolve(__dirname, '../../.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(function (line) {
        const [key, ...vals] = line.split('=');
        if (key && vals.length) {
            process.env[key.trim()] = vals.join('=').trim();
        }
    });
} catch (e) {
    // .env not found — fall back to process.env (Netlify production)
}

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!ANTHROPIC_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API key not configured' }),
        };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid request body' }),
        };
    }

    const { trade, city, compliment, problem, experience } = body;

    if (!trade || !city || !compliment || !problem || !experience) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing required fields' }),
        };
    }

    const systemPrompt = `You are an elite SEO expert and conversion-focused copywriter with 15+ years of experience specializing in contractor and trades businesses. You write in a direct, confident, blue-collar voice — no corporate fluff, no buzzwords. Your copy sounds like a real person wrote it, not a marketer.

Your tone: conversational, honest, practical. You lead with what the customer gets, not what the contractor does. You use contractions. You keep sentences punchy. You don't over-promise or use exclamation marks. You sound like someone who's talked to a lot of contractors and actually understands the work.

Your core capabilities:
- Advanced keyword research and semantic SEO optimization for local service businesses
- Conversion-focused copywriting that drives measurable business results
- E-E-A-T optimization and authority building for local contractors
- Content structure that balances search visibility with user engagement

When generating homepage copy, you always:
1. Research and recommend target keywords with search intent analysis
2. Provide full content structure with proper H1-H6 hierarchy
3. Include meta title and description optimized for CTR
4. Mark where social proof, reviews, and trust signals should go
5. Write copy for the full funnel — awareness through conversion
6. Think about what a homeowner searching for this trade in this city actually needs to hear`;

    const userMessage = `Write a complete homepage copy blueprint for a ${trade} based in ${city}.

About this contractor:
- What customers always compliment them on: ${compliment}
- What they do better than anyone: ${problem}
- Years of experience: ${experience}

Return ONLY valid JSON with this exact structure (no markdown, no code fences, just raw JSON):

{
  "keywords": {
    "primary": "the single best target keyword for this business",
    "secondary": ["3-5 secondary keywords"],
    "long_tail": ["3-5 long-tail keyword phrases homeowners actually search"],
    "search_intent": "brief explanation of what homeowners searching these terms actually want"
  },
  "seo": {
    "title_tag": "SEO-optimized page title, under 60 characters, includes primary keyword and city",
    "meta_description": "compelling meta description, under 155 characters, includes a call to action"
  },
  "sections": [
    {
      "tag": "h1",
      "label": "Hero Headline",
      "heading": "bold, specific, outcome-focused headline. Max 10 words. No questions. No 'Welcome to'. Lead with what the customer gets.",
      "copy": "2-3 sentences. Conversational, confident. Mentions the trade and location. Ends with a subtle nudge toward contact. No exclamation marks.",
      "callout": null
    },
    {
      "tag": "h2",
      "label": "Services Overview",
      "heading": "heading for the services section",
      "copy": "3-4 sentences covering their core services. Specific to their trade. Mention the city/region. Focus on outcomes, not just service names.",
      "callout": "List your core services here — 4 to 6 service cards work well (e.g. 'Kitchen Remodels', 'Bathroom Renovations', etc.)"
    },
    {
      "tag": "h2",
      "label": "Why Choose Us",
      "heading": "heading that captures their key differentiator",
      "copy": "3-4 sentences built around what makes them different. Use the compliments and differentiators they shared. Concrete, not generic.",
      "callout": null
    },
    {
      "tag": "h2",
      "label": "Social Proof",
      "heading": "heading for reviews/testimonials section",
      "copy": "1-2 sentences introducing the reviews. Set up the social proof without overselling.",
      "callout": "Showcase 3-5 real customer reviews here. Google reviews with full names and star ratings work best for trust and SEO."
    },
    {
      "tag": "h2",
      "label": "About / Experience",
      "heading": "heading about their experience and story",
      "copy": "3-4 sentences. Weave in years of experience. Make it personal — people hire people, not companies. Mention the region and roots.",
      "callout": "Add a photo of the owner or team here. Real photos convert 2-3x better than stock images."
    },
    {
      "tag": "h2",
      "label": "Service Area",
      "heading": "heading about the areas they serve",
      "copy": "2-3 sentences mentioning their primary city and surrounding areas. Good for local SEO — mention specific towns and neighborhoods.",
      "callout": "Consider adding a simple service area map or list of towns/zip codes served."
    },
    {
      "tag": "h2",
      "label": "Call to Action",
      "heading": "strong closing heading that drives action",
      "copy": "2-3 sentences. Direct, no-pressure. Tell them exactly what happens when they reach out. Remove friction.",
      "callout": "Place your main contact form or booking widget here. Phone number should be click-to-call on mobile."
    }
  ]
}

Guidelines for all copy:
- Write like you're talking to a homeowner, not a search engine
- Be specific to their trade — a roofer's copy should feel different from a plumber's
- Weave in the city/region naturally, don't keyword-stuff
- Every section should earn its place — if it doesn't help the homeowner decide, cut it
- Callouts should be practical, actionable tips — not generic advice`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 4000,
                system: systemPrompt,
                messages: [{ role: 'user', content: userMessage }],
            }),
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error('Anthropic API error:', response.status, errBody);
            return {
                statusCode: 502,
                body: JSON.stringify({ error: 'Failed to generate copy' }),
            };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };
    } catch (e) {
        console.error('Function error:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
