import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '../../../../utils/cloudinary';
import { extractPublicIdFromUrl, deleteFromCloudinary } from '../../../../utils/mediaLibrary';
import User from '../../../../lib/models/User';
import connectDB from '../../../../lib/database';

export async function DELETE(request: NextRequest) {
  try {
    let userId: string | null = null;

    // Try to get userId from different sources
    try {
      // First try to parse as JSON
      const jsonData = await request.json();
      userId = jsonData.userId;
    } catch (jsonError) {
      // If JSON parsing fails, try form data
      try {
        const formData = await request.formData();
        userId = formData.get('userId') as string;
      } catch (formError) {
        console.error('Failed to parse both JSON and form data:', { jsonError, formError });
      }
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required in request body (JSON) or form data' },
        { status: 400 }
      );
    }

    console.log('DP Delete: Processing delete request for userId:', userId);

    // Connect to database
    try {
      await connectDB();
      console.log('DP Delete: Database connected successfully');
    } catch (dbError) {
      console.error('DP Delete: Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get user by ID
    let user;
    try {
      user = await User.findById(userId);
      console.log('DP Delete: User lookup result:', user ? `Found user: ${user.username}` : 'User not found');
    } catch (userError) {
      console.error('DP Delete: User lookup error:', userError);
      return NextResponse.json(
        { error: 'Error looking up user' },
        { status: 500 }
      );
    }

    if (!user) {
      console.log('DP Delete: User not found for ID:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a profile picture
    if (!user.avatar) {
      console.log('DP Delete: No profile picture to delete for user:', user.username);
      return NextResponse.json({
        success: true,
        message: 'No profile picture to delete',
        data: {
          deleted: false,
          reason: 'No profile picture exists'
        }
      });
    }

    console.log('DP Delete: Found avatar URL:', user.avatar);

    // Delete from Cloudinary if it's a Cloudinary URL
    if (user.avatar.includes('cloudinary')) {
      console.log('DP Delete: Found Cloudinary URL:', user.avatar);
      
      let cloudinaryDeleted = false;
      
      // Method 1: Try utility function
      try {
        console.log('DP Delete: Method 1 - Using utility function...');
        const publicId = extractPublicIdFromUrl(user.avatar);
        
        if (publicId) {
          console.log('DP Delete: Utility function extracted public ID:', publicId);
          const deleted = await deleteFromCloudinary(publicId);
          if (deleted) {
            console.log('DP Delete: Utility function deletion successful');
            cloudinaryDeleted = true;
          } else {
            console.warn('DP Delete: Utility function deletion failed');
          }
        } else {
          console.warn('DP Delete: Utility function could not extract public ID');
        }
      } catch (error) {
        console.error('DP Delete: Method 1 error:', error);
      }
      
      // Method 2: Try direct Cloudinary deletion with extracted ID
      if (!cloudinaryDeleted) {
        try {
          console.log('DP Delete: Method 2 - Direct Cloudinary deletion...');
          
          // Extract public ID manually from URL
          let manualPublicId = null;
          
          if (user.avatar.includes('res.cloudinary.com')) {
            // Remove everything before the path
            const urlParts = user.avatar.split('res.cloudinary.com/');
            if (urlParts.length > 1) {
              const path = urlParts[1];
              // Remove file extension and any transformation parameters
              manualPublicId = path.split('.')[0].split('/').slice(1).join('/');
              console.log('DP Delete: Manual extraction result:', manualPublicId);
            }
          }
          
          if (manualPublicId) {
            console.log('DP Delete: Attempting direct deletion with:', manualPublicId);
            const result = await cloudinary.uploader.destroy(manualPublicId);
            console.log('DP Delete: Direct deletion result:', result);
            
            if (result.result === 'ok') {
              console.log('DP Delete: Direct deletion successful');
              cloudinaryDeleted = true;
            } else {
              console.warn('DP Delete: Direct deletion failed:', result);
            }
          }
        } catch (error) {
          console.error('DP Delete: Method 2 error:', error);
        }
      }
      
      // Method 3: Try with full URL path
      if (!cloudinaryDeleted) {
        try {
          console.log('DP Delete: Method 3 - Full path extraction...');
          
          // Get the full path after the domain
          const urlParts = user.avatar.split('res.cloudinary.com/');
          if (urlParts.length > 1) {
            const fullPath = urlParts[1];
            // Remove file extension
            const publicId = fullPath.split('.')[0];
            console.log('DP Delete: Full path public ID:', publicId);
            
            const result = await cloudinary.uploader.destroy(publicId);
            console.log('DP Delete: Full path deletion result:', result);
            
            if (result.result === 'ok') {
              console.log('DP Delete: Full path deletion successful');
              cloudinaryDeleted = true;
            } else {
              console.warn('DP Delete: Full path deletion failed:', result);
            }
          }
        } catch (error) {
          console.error('DP Delete: Method 3 error:', error);
        }
      }
      
      // Method 4: Try with just the filename
      if (!cloudinaryDeleted) {
        try {
          console.log('DP Delete: Method 4 - Filename extraction...');
          
          const filename = user.avatar.split('/').pop();
          if (filename) {
            const publicId = filename.split('.')[0];
            console.log('DP Delete: Filename public ID:', publicId);
            
            const result = await cloudinary.uploader.destroy(publicId);
            console.log('DP Delete: Filename deletion result:', result);
            
            if (result.result === 'ok') {
              console.log('DP Delete: Filename deletion successful');
              cloudinaryDeleted = true;
            } else {
              console.warn('DP Delete: Filename deletion failed:', result);
            }
          }
        } catch (error) {
          console.error('DP Delete: Method 4 error:', error);
        }
      }
      
      if (cloudinaryDeleted) {
        console.log('DP Delete: ✅ Cloudinary file deleted successfully');
      } else {
        console.warn('DP Delete: ❌ All Cloudinary deletion methods failed');
        console.warn('DP Delete: This might be due to:');
        console.warn('DP Delete: 1. Incorrect Cloudinary credentials');
        console.warn('DP Delete: 2. File already deleted');
        console.warn('DP Delete: 3. Insufficient permissions');
        console.warn('DP Delete: 4. Invalid public ID format');
      }
      
    } else {
      console.log('DP Delete: Avatar is not a Cloudinary URL, skipping Cloudinary deletion');
    }

    // Remove avatar from user profile
    try {
      user.avatar = '';
      await user.save();
      console.log('DP Delete: Successfully removed avatar from user profile');
    } catch (saveError) {
      console.error('DP Delete: Error saving user profile:', saveError);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    console.log('DP Delete: Success! Profile picture deleted for user:', user.username);

    return NextResponse.json({
      success: true,
      message: 'Profile picture deleted successfully',
      data: {
        deleted: true,
        avatar: null,
        username: user.username
      }
    });

  } catch (error) {
    console.error('DP Delete: Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}
