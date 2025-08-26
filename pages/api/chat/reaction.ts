import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import { Message } from '../../../lib/models/Chat';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
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

    const { messageId, emoji } = req.body;

    if (!messageId || !emoji) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message ID and emoji are required' 
      });
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (req.method === 'POST') {
      // Add or update reaction
      const existingReactionIndex = message.reactions.findIndex(
        (r: any) => r.user.toString() === decoded.userId
      );

      if (existingReactionIndex !== -1) {
        // Update existing reaction
        message.reactions[existingReactionIndex].emoji = emoji;
        message.reactions[existingReactionIndex].createdAt = new Date();
      } else {
        // Add new reaction
        message.reactions.push({
          user: decoded.userId,
          emoji,
          createdAt: new Date()
        });
      }

      await message.save();

      res.json({
        success: true,
        message: 'Reaction added successfully',
        data: {
          messageId,
          reactions: message.reactions
        }
      });

    } else if (req.method === 'DELETE') {
      // Remove reaction
      const reactionIndex = message.reactions.findIndex(
        (r: any) => r.user.toString() === decoded.userId
      );

      if (reactionIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          message: 'Reaction not found' 
        });
      }

      message.reactions.splice(reactionIndex, 1);
      await message.save();

      res.json({
        success: true,
        message: 'Reaction removed successfully',
        data: {
          messageId,
          reactions: message.reactions
        }
      });
    }

  } catch (error: any) {
    console.error('Reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
