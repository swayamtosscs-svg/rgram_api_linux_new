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
    const skippedUsers = [];

    for (const user of usersWithUndefinedNames) {
      try {
        // Validate user data before processing
        if (!user.email || user.email === 'undefined' || user.email === 'null' || user.email === 'string') {
          // Skip users with invalid email
          skippedUsers.push({
            id: user._id,
            email: user.email,
            reason: 'Invalid email'
          });
          console.log(`Skipped user ${user._id} - invalid email: ${user.email}`);
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
          skippedUsers.push({
            id: user._id,
            email: user.email,
            reason: 'Invalid email format'
          });
          console.log(`Skipped user ${user._id} - invalid email format: ${user.email}`);
          continue;
        }

        // Generate proper name from email
        const emailName = user.email.split('@')[0];
        const generatedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        
        // Update user data
        user.fullName = generatedName;
        
        // Ensure username exists and is valid
        if (!user.username || user.username === 'undefined' || user.username === 'null') {
          user.username = emailName + Math.floor(Math.random() * 1000);
        }
        
        // Validate and save user
        await user.save();
        
        updatedUsers.push({
          id: user._id,
          email: user.email,
          oldName: 'undefined',
          newName: generatedName,
          username: user.username
        });
        
        console.log(`Updated user ${user.email} with name: ${generatedName}`);
      } catch (error: any) {
        console.error(`Error updating user ${user._id}:`, error);
        
        // If it's a validation error, try to fix the user data
        if (error.name === 'ValidationError') {
          try {
            // Try to fix the user data
            if (!user.username || user.username === 'undefined' || user.username === 'null') {
              const emailName = user.email ? user.email.split('@')[0] : 'user';
              user.username = emailName + Math.floor(Math.random() * 1000);
            }
            
            if (!user.email || user.email === 'undefined' || user.email === 'null' || user.email === 'string') {
              // If email is completely invalid, mark for deletion
              deletedUsers.push({
                id: user._id,
                email: user.email,
                reason: 'Invalid email data'
              });
              console.log(`Marked user ${user._id} for deletion - invalid email data`);
              continue;
            }
            
            // Try to save again
            await user.save();
            
            updatedUsers.push({
              id: user._id,
              email: user.email,
              oldName: 'undefined',
              newName: user.fullName,
              username: user.username,
              fixed: true
            });
            
            console.log(`Fixed and updated user ${user.email}`);
          } catch (fixError: any) {
            console.error(`Failed to fix user ${user._id}:`, fixError);
            deletedUsers.push({
              id: user._id,
              email: user.email,
              reason: 'Failed to fix validation errors'
            });
          }
        } else {
          // For other errors, mark for deletion
          deletedUsers.push({
            id: user._id,
            email: user.email,
            reason: error.message || 'Unknown error'
          });
        }
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
        skippedUsers: skippedUsers.length,
        updatedUserDetails: updatedUsers,
        deletedUserDetails: deletedUsers,
        skippedUserDetails: skippedUsers
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
