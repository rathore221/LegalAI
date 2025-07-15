// pages/api/gemini.js
const languages = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, language = 'en' } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Respond in ${languages[language] || 'English'}. ${prompt}`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                data?.candidates?.[0]?.content?.text ||
                'No valid response from Gemini';

    res.status(200).json({ text });
  } catch (error) {
    console.error('Error calling Gemini:', error);
    res.status(500).json({ text: 'Server error contacting Gemini' });
  }
}