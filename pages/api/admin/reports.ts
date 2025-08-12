import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/middleware/auth';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
<<<<<<< HEAD
import Post from '../../../lib/models/Post';
=======
>>>>>>> ba5531e9b34f056c52f9ae9afb3f554ffeef1182

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });
    const me = await (User as any).findById(decoded.userId).lean();
    if (!me?.isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' });
<<<<<<< HEAD
    // Get flagged posts
    const flaggedPosts = await (Post as any).find({ 
      'flags.0': { $exists: true } // Posts with at least one flag
    })
    .populate('user', 'username fullName profilePicture isVerified')
    .sort({ 'flags.length': -1, createdAt: -1 })
    .lean();
    
    // Get posts with flagged comments
    const postsWithFlaggedComments = await (Post as any).find({
      'comments.flags.0': { $exists: true } // Posts with comments that have at least one flag
    })
    .populate('user', 'username fullName profilePicture isVerified')
    .sort({ createdAt: -1 })
    .lean();
    
    // Extract flagged comments from posts
    const flaggedComments = [];
    for (const post of postsWithFlaggedComments) {
      const comments = post.comments.filter((comment: any) => comment.flags && comment.flags.length > 0);
      for (const comment of comments) {
        flaggedComments.push({
          ...comment,
          postId: post._id,
          postContent: post.content,
          postMedia: post.media
        });
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Reports list', 
      data: { 
        flaggedPosts, 
        flaggedComments 
      } 
    });
=======
    res.json({ success: true, message: 'Reports list', data: { reports: [] } });
>>>>>>> ba5531e9b34f056c52f9ae9afb3f554ffeef1182
  } catch (error: any) {
    console.error('Admin reports error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
