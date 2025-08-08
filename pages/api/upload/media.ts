import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    const { base64, filename } = req.body;
    if (!base64 || !filename) return res.status(400).json({ success: false, message: 'base64 and filename are required' });

    const matches = base64.match(/^data:(.+);base64,(.*)$/);
    const data = matches ? matches[2] : base64;
    const buffer = Buffer.from(data, 'base64');

    const uploadDir = path.join(process.cwd(), 'apirgram', 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const finalName = `${Date.now()}_${safeName}`;
    const filePath = path.join(uploadDir, finalName);
    fs.writeFileSync(filePath, buffer);

    const url = `/uploads/${finalName}`;
    res.status(201).json({ success: true, message: 'Media uploaded', data: { url } });
  } catch (error: any) {
    console.error('Upload media error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
