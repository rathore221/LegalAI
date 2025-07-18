import { GoogleGenerativeAI } from '@google/generative-ai';

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

  const { question, language = 'en', country = 'US' } = req.body;

  if (!question) {
    return res.status(400).json({ answer: 'No question provided' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Respond in ${languages[language] || 'English'}. 
You are a legal expert in ${country} answering a question about rights.
Provide a clear, detailed answer to: ${question}

Structure your response:
1. Direct answer
2. Relevant laws
3. Recommended actions
4. Important warnings`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({
      answer: text || 'No response from Gemini'
    });

  } catch (error) {
    console.error('Processing error:', error);

    if (error?.status === 503) {
      return res.status(503).json({
        answer: 'The AI service is temporarily overloaded. Please try again shortly.'
      });
    }

    return res.status(500).json({
      answer: 'Error processing your question'
    });
  }
}
