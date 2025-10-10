import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import Post from '../../../../lib/models/Post';
import { requireAdmin } from '../../../../lib/middleware/adminAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('1. Starting handler');
    await connectDB();
    console.log('2. DB Connected');

    switch (req.method) {
      case 'GET':
        // Get reported or flagged content
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        console.log('3. GET method');
        // Query for reported content that is still active
        const query = {
          isActive: true,
          reported: true
        };
        console.log('4. Query:', query);

        console.log('5. Fetching posts');
        const posts = await (Post as any)
          .find(query)
          .populate('author', 'username email')
          .select('content images videos type author createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();
        console.log('6. Posts found:', posts?.length);

        const total = await Post.countDocuments({ reported: true });

        return res.json({
          success: true,
          data: {
            posts,
            pagination: {
              total,
              pages: Math.ceil(total / limit),
              current: page
            }
          }
        });

      case 'POST':
        // Take action on reported content
        const { postId, action, reason } = req.body;
        
        if (!postId || !action) {
          return res.status(400).json({
            success: false,
            message: 'Post ID and action are required'
          });
        }

        const post = await (Post as any).findById(postId);
        if (!post) {
          return res.status(404).json({
            success: false,
            message: 'Post not found'
          });
        }

        switch (action) {
          case 'remove':
            await (Post as any).findByIdAndUpdate(postId, {
              isActive: false,
              deletedAt: new Date(),
              removedReason: reason,
              removedBy: req.body.adminUser._id
            });
            break;
          
          case 'approve':
            await (Post as any).findByIdAndUpdate(postId, {
              reported: false,
              reportedAt: null,
              isActive: true,
              deletedAt: null
            });
            break;

          default:
            return res.status(400).json({
              success: false,
              message: 'Invalid action'
            });
        }

        return res.json({
          success: true,
          message: `Post successfully ${action}d`
        });

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error: any) {
    console.error('Content moderation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      stack: error.stack
    });
  }
}

export default async function wrappedHandler(req: NextApiRequest, res: NextApiResponse) {
  await requireAdmin()(req, res, async () => {
    await handler(req, res);
  });
}
