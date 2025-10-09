import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import Follow from '@/lib/models/Follow';
import { verifyToken } from '@/lib/middleware/auth';

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

    const { user_id } = req.query;
    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const currentUserId = decoded.userId;
    const targetUserId = user_id;

    // Get the target user
    const targetUser = await User.findById(targetUserId)
      .select('-password -googleId')
      .lean();

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if current user is following the target user
    const followStatus = await Follow.findOne({
      follower: currentUserId,
      following: targetUserId,
      status: 'accepted'
    });

    const isFollowing = !!followStatus;
    const isOwnProfile = currentUserId === targetUserId;

    // Determine what data to show based on privacy settings
    let profileData: any = {
      _id: targetUser._id,
      username: targetUser.username,
      fullName: targetUser.fullName,
      avatar: targetUser.avatar,
      bio: targetUser.bio,
      isPrivate: targetUser.isPrivate,
      isVerified: targetUser.isVerified,
      verificationType: targetUser.verificationType,
      followersCount: targetUser.followersCount,
      followingCount: targetUser.followingCount,
      postsCount: targetUser.postsCount,
      reelsCount: targetUser.reelsCount,
      videosCount: targetUser.videosCount,
      createdAt: targetUser.createdAt,
      isOwnProfile,
      isFollowing
    };

    // If user is private and current user is not following (and not own profile)
    if (targetUser.isPrivate && !isFollowing && !isOwnProfile) {
      // Show limited profile data (like Instagram)
      profileData = {
        _id: targetUser._id,
        username: targetUser.username,
        fullName: targetUser.fullName,
        avatar: targetUser.avatar,
        bio: targetUser.bio,
        isPrivate: targetUser.isPrivate,
        isVerified: targetUser.isVerified,
        verificationType: targetUser.verificationType,
        followersCount: targetUser.followersCount,
        followingCount: targetUser.followingCount,
        postsCount: 0, // Hide actual posts count
        reelsCount: 0, // Hide actual reels count
        videosCount: 0, // Hide actual videos count
        createdAt: targetUser.createdAt,
        isOwnProfile,
        isFollowing,
        isPrivateAccount: true,
        showLimitedProfile: true
      };
    } else {
      // Show full profile data
      profileData = {
        ...profileData,
        website: targetUser.website,
        location: targetUser.location,
        religion: targetUser.religion,
        isPrivateAccount: false,
        showLimitedProfile: false
      };
    }

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: { user: profileData }
    });

  } catch (error: any) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}

