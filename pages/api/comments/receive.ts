import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Comment from '@/lib/models/Comment';
import User from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { 
      postId, 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      parentCommentId = null,
      includeReplies = false
    } = req.query;

    // Validate postId
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'postId is required'
      });
    }

    // Parse pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { postId };
    
    if (parentCommentId === 'null' || parentCommentId === null) {
      query.parentCommentId = null;
    } else if (parentCommentId) {
      query.parentCommentId = parentCommentId;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Get comments with pagination
    const comments = await Comment.find(query)
      .populate('author', 'fullName email avatar')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalComments = await Comment.countDocuments(query);

    // Get reply counts for each comment if not including replies
    let commentsWithCounts = comments;
    if (!includeReplies) {
      commentsWithCounts = await Promise.all(
        comments.map(async (comment) => {
          const replyCount = await Comment.countDocuments({ 
            parentCommentId: comment._id 
          });
          return {
            ...comment,
            replies: replyCount,
            likes: comment.likes || 0
          };
        })
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalComments / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      message: 'Comments retrieved successfully',
      data: {
        comments: commentsWithCounts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalComments,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      }
    });

  } catch (error: any) {
    console.error('Receive comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
