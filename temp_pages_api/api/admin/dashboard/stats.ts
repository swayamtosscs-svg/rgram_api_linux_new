import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import User from '../../../../lib/models/User';
import Post from '../../../../lib/models/Post';
import Story from '../../../../lib/models/Story';
import { adminMiddleware } from '../../../../lib/middleware/adminAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get counts for various entities
    const [
      totalUsers,
      activeUsers,
      totalPosts,
      totalStories,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }), // Active in last 30 days
      Post.countDocuments(),
      Story.countDocuments(),
    ]);

    // Get user growth (new users in last 7 days)
    const lastWeekUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newLastWeek: lastWeekUsers
        },
        content: {
          posts: totalPosts,
          stories: totalStories
        }
      }
    });
  } catch (error: any) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default async function wrappedHandler(req: NextApiRequest, res: NextApiResponse) {
  await adminMiddleware(req, res, async () => {
    await handler(req, res);
  });
}
