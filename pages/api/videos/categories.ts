import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
<<<<<<< HEAD
import '../../../lib/models/User'; // Import User model to register it with Mongoose
=======
>>>>>>> ba5531e9b34f056c52f9ae9afb3f554ffeef1182

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get video categories with counts
    const categories = await (Post as any).aggregate([
      {
        $match: {
          type: 'video',
          isActive: true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get total video count
    const totalVideos = await (Post as any).countDocuments({
      type: 'video',
      isActive: true
    });

    // Format categories
    const formattedCategories = categories.map(cat => ({
      name: cat._id,
      count: cat.count,
      percentage: Math.round((cat.count / totalVideos) * 100)
    }));

    res.json({
      success: true,
      message: 'Video categories fetched successfully',
      data: {
        categories: formattedCategories,
        totalVideos,
        availableCategories: [
          'general',
          'entertainment', 
          'education',
          'news',
          'sports',
          'music',
          'gaming',
          'lifestyle',
          'technology'
        ]
      }
    });

  } catch (error: any) {
    console.error('Fetch video categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
