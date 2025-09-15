import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/middleware/auth';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import { deleteFileByUrl } from '../../../utils/localStorage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    // Connect to database
    await connectDB();

    // Get user info
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const { publicUrl } = req.body;

    if (!publicUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Public URL is required' 
      });
    }

    // Verify the file belongs to the user by checking the URL path
    const expectedPattern = `/uploads/users/${user._id}/`;
    if (!publicUrl.startsWith(expectedPattern)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied - file not in your folder. Expected pattern: ${expectedPattern}` 
      });
    }

    console.log('✅ File validation passed - user can delete this file');

    // Delete from local storage
    const deleteResult = await deleteFileByUrl(publicUrl);
    
    if (!deleteResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete file from local storage',
        error: deleteResult.error
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully from local storage',
      data: {
        deletedFile: {
          publicUrl,
          deletedAt: new Date(),
          deletedBy: {
            userId: user._id,
            username: user.username,
            fullName: user.fullName
          }
        },
        storageType: 'local'
      }
    });

  } catch (error: any) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
