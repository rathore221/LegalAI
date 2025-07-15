import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const languages = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German'
};

const countryNames = {
  US: 'United States',
  CA: 'Canada',
  UK: 'United Kingdom',
  DE: 'Germany'
};

async function extractTextFromPDF(filePath) {
  try {
    const data = await pdfParse(fs.readFileSync(filePath));
    if (data.text.trim().length > 50) return data.text;

    const worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(filePath);
    await worker.terminate();
    return text || "Could not extract text";
  } catch (error) {
    console.error('Text extraction error:', error);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    filename: (name, ext, part) => `${Date.now()}-${part.originalFilename}`
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(500).json({ error: 'Form parsing failed' });
    }

    const uploadedFile = files.file?.[0] || Object.values(files)[0];
    const language = fields.language?.[0] || 'en';
    const countryCode = fields.country?.[0] || 'US';
    const country = countryNames[countryCode] || countryCode;
    const state = countryCode === 'US' ? fields.state?.[0] || '' : '';
    const location = state ? `${state}, ${country}` : country;

    if (!uploadedFile?.filepath) {
      return res.status(400).json({ summary: 'No file was uploaded', rights: '' });
    }

    try {
      const fileContent = await extractTextFromPDF(uploadedFile.filepath);
      if (!fileContent) {
        return res.status(400).json({ summary: 'Could not read document text', rights: '' });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a legal expert analyzing this document for someone in ${location}.
Provide the response in ${languages[language] || 'English'}.

1. [Summary] A concise plain language explanation (3-4 sentences)
2. [Your Rights] List relevant rights in bullet points

Document:
"""
${fileContent}
"""`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const summary = text.includes('[Summary]')
        ? text.split('[Summary]')[1]?.split('[Your Rights]')[0]?.trim()
        : text.split('\n')[0]?.trim();

      const rights = text.includes('[Your Rights]')
        ? text.split('[Your Rights]')[1]?.trim()
        : 'General legal protections apply';

      fs.unlink(uploadedFile.filepath, () => {});

      return res.status(200).json({
        summary: summary?.replace(/\n/g, ' ') || 'No summary generated',
        rights: rights?.replace(/\n/g, '<br>') || 'No rights information'
      });

    } catch (error) {
      console.error('Processing error:', error);
      if (uploadedFile?.filepath) fs.unlink(uploadedFile.filepath, () => {});
      return res.status(500).json({
        summary: 'Error processing document',
        rights: 'Error retrieving rights information'
      });
    }
  });
}
