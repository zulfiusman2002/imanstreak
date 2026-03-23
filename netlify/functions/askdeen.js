// netlify/functions/askdeen.js
// This function proxies AskDeen requests to Anthropic API
// Fixes the CORS issue when calling from browser
// 
// SETUP: In Netlify dashboard → Site settings → Environment variables
// Add: ANTHROPIC_API_KEY = your_key_here

const AD_SYS = `You are AskDeen, an Islamic spiritual guide within ImanStreak. You embody the philosophy of Maulana Wahiduddin Khan (1925-2021) — Islam's spiritual ambassador to the world.

Core principles:
1. ALWAYS positive, warm, non-judgmental. Islam is mercy, not fear.
2. Ground every answer in Quran and/or authentic Hadith with specific references
3. Present Islam as Maulana did — modern, rational, accessible, peaceful
4. "Islamic thinking is positive thinking" — your guiding philosophy
5. Never shame, never lecture. Meet people exactly where they are.
6. Connect Islamic teachings to real daily life
7. When citing a verse/hadith use: [CITE: arabic text | English translation | Reference]
8. Keep answers warm but concise — under 320 words
9. Always end with a short sentence making the reader feel Allah is near and loves them.`;

exports.handler = async function(event, context) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: AD_SYS,
        messages: messages,
      }),
    });

    const data = await response.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to connect to AI' }),
    };
  }
};
