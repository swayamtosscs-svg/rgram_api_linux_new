import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' },
  },
};

async function uploadToCloudinary(base64Data: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      resource_type: 'auto',
      folder: 'rgram_uploads'
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

async function uploadToLocal(buffer: Buffer, filename: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'apirgram', 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const finalName = `${Date.now()}_${safeName}`;
  const filePath = path.join(uploadDir, finalName);
  
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${finalName}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { base64, filename } = req.body;
    if (!base64 || !filename) {
      return res.status(400).json({ success: false, message: 'base64 and filename are required' });
    }

    // Extract base64 data
    const matches = base64.match(/^data:(.+);base64,(.*)$/);
    const data = matches ? matches[2] : base64;
    const buffer = Buffer.from(data, 'base64');
    
    let url;
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // Use Cloudinary in production
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary configuration is missing');
      }
      url = await uploadToCloudinary(base64);
    } else {
      // Use local storage in development
      url = await uploadToLocal(buffer, filename);
    }

    res.status(201).json({
      success: true,
      message: 'Media uploaded',
      data: { url }
    });
  } catch (error: any) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
