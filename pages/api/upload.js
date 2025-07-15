// pages/api/upload.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = new IncomingForm({ keepExtensions: true, uploadDir: './' });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'File upload error' });

    const file = files.file[0];
    const buffer = fs.readFileSync(file.filepath);
    const data = await pdfParse(buffer);
    return res.status(200).json({ text: data.text });
  });
}
