import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import { Message } from '../../../lib/models/Chat';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ success: false, message: 'Message ID is required' });
    }

    // Find the message and verify ownership
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Only the sender can delete their own message
    if (message.sender.toString() !== decoded.userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own messages' });
    }

    // Soft delete the message
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = '[Message deleted]';
    
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully',
      data: {
        messageId,
        deletedAt: message.deletedAt
      }
    });

  } catch (error: any) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
