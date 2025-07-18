import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
console.log('Loaded Gemini API Key:', process.env.NEXT_PUBLIC_GEMINI_API_KEY);
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
    console.log('Extracting text from PDF:', filePath);
    const data = await pdfParse(fs.readFileSync(filePath));
    if (data.text.trim().length > 50) return data.text;

    console.log('PDF parse too short, running OCR...');
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

    console.log('FIELDS:', fields);
    console.log('FILES:', files);

    const uploadedFile = files.file?.[0] || Object.values(files)[0];
    const language = fields.language?.[0] || 'en';
    const countryCode = fields.country?.[0] || 'US';
    const country = countryNames[countryCode] || countryCode;
    const state = countryCode === 'US' ? fields.state?.[0] || '' : '';
    const location = state ? `${state}, ${country}` : country;

    if (!uploadedFile) {
      console.error('No uploaded file found');
      return res.status(400).json({ summary: 'No file was uploaded', rights: '' });
    }

    const filePath = uploadedFile.filepath || uploadedFile.path;
    console.log('Uploaded file path:', filePath);

    if (!filePath) {
      console.error('Uploaded file path is undefined');
      return res.status(400).json({ summary: 'Uploaded file path missing', rights: '' });
    }

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is missing');
      return res.status(500).json({ summary: 'Server configuration error', rights: '' });
    }

    try {
      const fileContent = await extractTextFromPDF(filePath);
      if (!fileContent) {
        console.error('No text extracted from document');
        return res.status(400).json({ summary: 'Could not read document text', rights: '' });
      }

      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      console.log('Generating summary...');
      const summaryPrompt = `You are a legal expert. Summarize the following document in plain language (3-4 sentences) for someone in ${location}. Provide the response in ${languages[language] || 'English'}.

Document:
"""
${fileContent}
"""`;

      const summaryResult = await model.generateContent(summaryPrompt);
      const summaryText = summaryResult?.response?.text()?.trim() || 'No summary generated';
      console.log('Summary generated:', summaryText);

      console.log('Generating rights...');
      const rightsPrompt = `You are a legal expert. List the relevant legal rights for someone in ${location} based on the following document. Provide the response in ${languages[language] || 'English'}, formatted as bullet points.

Document:
"""
${fileContent}
"""`;

      const rightsResult = await model.generateContent(rightsPrompt);
      const rightsText = rightsResult?.response?.text()?.trim()?.replace(/\n/g, '<br>') || 'No rights information';
      console.log('Rights generated:', rightsText);

      fs.unlink(filePath, () => {});

      return res.status(200).json({
        summary: summaryText.replace(/\n/g, ' '),
        rights: rightsText
      });

    } catch (error) {
      console.error('Processing error:', error);
      if (filePath) fs.unlink(filePath, () => {});
      return res.status(500).json({
        summary: 'Error processing document',
        rights: 'Error retrieving rights information'
      });
    }
  });
}
