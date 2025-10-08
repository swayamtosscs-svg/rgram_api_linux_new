import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import User from '../../../../lib/models/User';
import { requireAdmin } from '../../../../lib/middleware/adminAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    switch (req.method) {
      case 'GET':
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;

        let query: any = {};
        if (search) {
          query = {
            $or: [
              { email: { $regex: search, $options: 'i' } },
              { username: { $regex: search, $options: 'i' } },
              { fullName: { $regex: search, $options: 'i' } }
            ]
          };
        }

        const [users, total] = await Promise.all([
          (User as any).find(query)
            .select('email username fullName isAdmin isBanned banReason lastActive createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          User.countDocuments(query)
        ]);

        return res.json({
          success: true,
          data: {
            users,
            pagination: {
              total,
              pages: Math.ceil(total / limit),
              current: page
            }
          }
        });

      case 'PUT':
        const { userId, action, reason } = req.body;

        if (!userId || !action) {
          return res.status(400).json({
            success: false,
            message: 'User ID and action are required'
          });
        }

        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        // Prevent modifying other admins
        if (user.isAdmin && action !== 'remove_admin') {
          return res.status(403).json({
            success: false,
            message: 'Cannot modify other admin users'
          });
        }

        switch (action) {
          case 'ban':
            await User.findByIdAndUpdate(userId, {
              isBanned: true,
              banReason: reason,
              bannedBy: req.body.adminUser._id,
              bannedAt: new Date()
            });
            break;

          case 'unban':
            await User.findByIdAndUpdate(userId, {
              isBanned: false,
              banReason: null,
              bannedBy: null,
              bannedAt: null
            });
            break;

          case 'make_admin':
            await User.findByIdAndUpdate(userId, {
              isAdmin: true,
              adminSince: new Date()
            });
            break;

          case 'remove_admin':
            await User.findByIdAndUpdate(userId, {
              isAdmin: false,
              adminSince: null
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
          message: `User successfully ${action.replace('_', ' ')}ed`
        });

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error: any) {
    console.error('User management error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default async function wrappedHandler(req: NextApiRequest, res: NextApiResponse) {
  await requireAdmin()(req, res, async () => {
    await handler(req, res);
  });
}
