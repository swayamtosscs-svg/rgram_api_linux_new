import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    message: 'DP API Endpoints - No Authentication Required',
    endpoints: {
      'POST /api/dp/upload': {
        description: 'Upload a new display picture (real image file)',
        body: {
          image: 'Image file (multipart/form-data)',
          userId: 'User ID (optional, defaults to "default_user")'
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        response: {
          success: 'boolean',
          message: 'string',
          data: {
            avatar: 'string (Cloudinary URL)',
            publicId: 'string',
            width: 'number',
            height: 'number',
            format: 'string',
            size: 'number',
            userId: 'string'
          }
        }
      },
      'DELETE /api/dp/delete': {
        description: 'Delete display picture by publicId, imageUrl, or userId',
        body: {
          publicId: 'Cloudinary public ID (optional)',
          imageUrl: 'Full image URL (optional)',
          userId: 'User ID to delete their DP (optional)'
        },
        response: {
          success: 'boolean',
          message: 'string',
          data: {
            deletedPublicId: 'string',
            message: 'string'
          }
        }
      },
      'GET /api/dp/retrieve': {
        description: 'Get display picture information by userId, publicId, or imageUrl',
        query: {
          userId: 'User ID to find their DP (optional)',
          publicId: 'Cloudinary public ID (optional)',
          imageUrl: 'Full image URL (optional)'
        },
        response: {
          success: 'boolean',
          data: {
            publicId: 'string',
            url: 'string',
            width: 'number',
            height: 'number',
            format: 'string',
            size: 'number',
            createdAt: 'string',
            folder: 'string',
            resourceType: 'string'
          }
        }
      }
    },
    notes: [
      'No authentication required - open API endpoints',
      'Images are automatically resized to 400x400 with face detection',
      'Supports real image file uploads (JPEG, PNG, WebP, GIF)',
      'Images are stored in Cloudinary under user/{userId}/dp/ folder structure',
      'Maximum file size: 10MB',
      'Multiple ways to identify images: publicId, imageUrl, or userId'
    ]
  });
}
