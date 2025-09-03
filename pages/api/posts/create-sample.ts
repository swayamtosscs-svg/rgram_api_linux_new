import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
import User from '../../../lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get userId from query parameter or header
    const userId = req.query.userId as string || req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required. Provide it as query parameter ?userId=123 or header x-user-id: 123' 
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Sample posts to create
    const samplePosts = [
      "Hello everyone! This is my first post on the platform! 🎉",
      "Just had an amazing day at the beach! The sunset was incredible 🌅",
      "Working on a new project. Can't wait to share it with you all! 💻",
      "Coffee and coding - the perfect combination ☕️",
      "Just finished reading an amazing book. Highly recommend it! 📚",
      "Beautiful morning walk in the park today 🌳",
      "Learning new technologies is so exciting! 🚀",
      "Grateful for all the amazing people in my life 🙏",
      "Weekend vibes are the best! Time to relax and recharge 😌",
      "Sharing some thoughts on productivity and work-life balance 💭"
    ];

    const createdPosts = [];

    // Create sample posts
    for (const content of samplePosts) {
      const post = new Post({
        content: content,
        author: userId,
        likes: [],
        comments: [],
        isActive: true
      });

      await post.save();
      await post.populate('author', 'username fullName avatar');
      
      createdPosts.push({
        _id: post._id,
        content: post.content,
        author: post.author,
        likeCount: 0,
        commentCount: 0,
        createdAt: post.createdAt
      });
    }

    res.status(201).json({
      success: true,
      message: `${samplePosts.length} sample posts created successfully`,
      data: {
        posts: createdPosts,
        totalCreated: createdPosts.length
      }
    });

  } catch (error: any) {
    console.error('Create sample posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}


