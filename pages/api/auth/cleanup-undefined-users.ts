import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    await connectDB();

    // Find all users with undefined names
    const usersWithUndefinedNames = await User.find({
      $or: [
        { fullName: 'undefined' },
        { fullName: null },
        { fullName: '' },
        { fullName: { $exists: false } }
      ]
    });

    console.log(`Found ${usersWithUndefinedNames.length} users with undefined names`);

    const updatedUsers = [];
    const deletedUsers = [];

    for (const user of usersWithUndefinedNames) {
      try {
        // If user has a valid email, try to generate a proper name
        if (user.email && user.email !== 'undefined' && user.email !== 'null') {
          const emailName = user.email.split('@')[0];
          const generatedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          
          user.fullName = generatedName;
          await user.save();
          
          updatedUsers.push({
            id: user._id,
            email: user.email,
            oldName: 'undefined',
            newName: generatedName
          });
          
          console.log(`Updated user ${user.email} with name: ${generatedName}`);
        } else {
          // If user has no valid email, mark for deletion
          deletedUsers.push({
            id: user._id,
            email: user.email,
            reason: 'No valid email'
          });
          
          console.log(`Marked user ${user._id} for deletion (no valid email)`);
        }
      } catch (error) {
        console.error(`Error updating user ${user._id}:`, error);
      }
    }

    // Optionally delete users with no valid email (uncomment if needed)
    // if (deletedUsers.length > 0) {
    //   const userIdsToDelete = deletedUsers.map(u => u.id);
    //   await User.deleteMany({ _id: { $in: userIdsToDelete } });
    //   console.log(`Deleted ${deletedUsers.length} users with no valid email`);
    // }

    res.json({
      success: true,
      message: 'Cleanup completed successfully',
      data: {
        totalUsersFound: usersWithUndefinedNames.length,
        updatedUsers: updatedUsers.length,
        deletedUsers: deletedUsers.length,
        updatedUserDetails: updatedUsers,
        deletedUserDetails: deletedUsers
      }
    });

  } catch (error: any) {
    console.error('Cleanup undefined users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
