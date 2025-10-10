import { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from '../../../utils/cloudinary';
import { getUserFolderPath } from '../../../utils/cloudinaryFolders';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Parse form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filter: (part) => {
        return part.mimetype ? part.mimetype.includes('image') : false;
      },
    });

    const [fields, files] = await form.parse(req);
    
    // Check if image file is provided
    if (!files.image || !Array.isArray(files.image) || files.image.length === 0) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageFile = files.image[0];
    
    // Validate file type
    if (!imageFile.mimetype || !imageFile.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    // Get user ID from form or use a default
    const userId = fields.userId?.[0] || 'default_user';
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `dp_${userId}_${timestamp}`;
    
    // Get folder path for user's DP
    const folderPath = getUserFolderPath(userId, 'dp', 'user');

    // Read file and upload to Cloudinary
    const fileBuffer = fs.readFileSync(imageFile.filepath);
    
    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload_stream(
      {
        public_id: filename,
        folder: folderPath,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' }
        ],
        overwrite: true
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Failed to upload to Cloudinary' });
        }
        
        if (result) {
          // Clean up temporary file
          fs.unlinkSync(imageFile.filepath);
          
          res.status(200).json({
            success: true,
            message: 'DP uploaded successfully',
            data: {
              avatar: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              size: result.bytes,
              userId: userId
            }
          });
        }
      }
    ).end(fileBuffer);

  } catch (error) {
    console.error('DP upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload DP',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
