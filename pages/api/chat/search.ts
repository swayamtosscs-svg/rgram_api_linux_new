import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import { Message, ChatThread } from '../../../lib/models/Chat';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    const { q: query, threadId, page = '1', limit = '20' } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    let searchQuery: any = {
      $text: { $search: query },
      isDeleted: false
    };

    // If threadId is provided, search only in that thread
    if (threadId) {
      // Verify user has access to this thread
      const thread = await ChatThread.findById(threadId);
      if (!thread || !thread.participants.includes(decoded.userId)) {
        return res.status(403).json({ success: false, message: 'Access denied to thread' });
      }
      searchQuery.thread = threadId;
    } else {
      // Search in all threads where user is a participant
      const userThreads = await ChatThread.find({ participants: decoded.userId }).select('_id');
      const threadIds = userThreads.map(t => t._id);
      searchQuery.thread = { $in: threadIds };
    }

    // Perform text search
    const messages = await Message.find(searchQuery)
      .populate('sender', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar')
      .populate('thread', 'participants')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalResults = await Message.countDocuments(searchQuery);

    // Format results
    const formattedMessages = messages.map(msg => ({
      ...msg,
      thread: {
        id: msg.thread._id,
        participants: msg.thread.participants
      }
    }));

    res.json({
      success: true,
      message: 'Search completed successfully',
      data: {
        messages: formattedMessages,
        query,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalResults,
          pages: Math.ceil(totalResults / limitNum),
          hasNext: pageNum * limitNum < totalResults,
          hasPrev: pageNum > 1
        }
      }
    });

  } catch (error: any) {
    console.error('Message search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
