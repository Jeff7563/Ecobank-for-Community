export const config = {
    runtime: 'edge', // Use Edge Runtime for faster cold boots (optional but recommended)
};

export default async function handler(req) {
    // 1. Handle CORS (Optional but good practice)
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        // 2. Get API Key from Environment Variable
        // IMPORTANT: User must set GEMINI_API_KEY in Vercel Project Settings
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Server configuration error: Missing API Key' }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { imageBase64 } = await req.json();

        if (!imageBase64) {
             return new Response(JSON.stringify({ error: 'Missing image data' }), { status: 400 });
        }

        // 3. Call Gemini API directly (REST)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        
        const promptText = `
            Look at this image. Identify the main trash object.
            Match it to one of these categories if possible: [Plastic Bottle, Aluminum Can, Glass Bottle, Paper, Cardboard].
            Return ONLY a JSON object with this format (no markdown):
            {
                "name": "Short name of item (in Thai language)",
                "category": "One of the categories above",
                "confidence": "Low/Medium/High"
            }
        `;

        const backendResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: promptText },
                        { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                    ]
                }]
            })
        });

        const data = await backendResponse.json();

        // 4. Return result to Frontend
        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
