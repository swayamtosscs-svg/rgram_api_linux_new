import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import Post from '../../../../lib/models/Post';
import { verifyToken } from '../../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    if (req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
      const decoded = await verifyToken(token);
      if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

      const { id } = req.query; // post id
      if (!id || typeof id !== 'string') return res.status(400).json({ success: false, message: 'Post ID is required' });

      const { content } = req.body;
      if (!content || typeof content !== 'string' || content.trim().length === 0) return res.status(400).json({ success: false, message: 'Comment content is required' });
      if (content.length > 500) return res.status(400).json({ success: false, message: 'Comment must be less than 500 characters' });

      const post = await (Post as any).findById(id);
      if (!post || !post.isActive) return res.status(404).json({ success: false, message: 'Post not found' });

      await post.addComment(decoded.userId, content);
      return res.status(201).json({ success: true, message: 'Comment added', data: { commentsCount: post.commentsCount } });
    }

    if (req.method === 'DELETE') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
      const decoded = await verifyToken(token);
      if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

      const { id } = req.query; // comment id
      if (!id || typeof id !== 'string') return res.status(400).json({ success: false, message: 'Comment ID is required' });

      const post = await (Post as any).findOne({ 'comments._id': id });
      if (!post) return res.status(404).json({ success: false, message: 'Comment not found' });

      const comment = post.comments.find((c: any) => c._id.toString() === id);
      if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
      if (comment.author.toString() !== decoded.userId) return res.status(403).json({ success: false, message: 'You can only delete your own comment' });

      await post.removeComment(id);
      return res.json({ success: true, message: 'Comment deleted', data: { commentsCount: post.commentsCount } });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    console.error('Comment endpoint error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
