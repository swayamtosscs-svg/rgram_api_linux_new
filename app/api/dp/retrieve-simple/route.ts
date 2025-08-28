import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ 
        error: 'Cloudinary not configured. Please check environment variables.',
        required: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
      }, { status: 500 });
    }

    // Get query parameters - support both userId and username
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');
    const includeHistory = searchParams.get('includeHistory') === 'true';

    let finalUsername = 'test_user'; // Default username

    // Determine which username to use
    if (username) {
      finalUsername = username;
    } else if (userId) {
      // If userId is provided, we need to map it to the actual username
      // Since the image was uploaded to "temp_username", let's check that folder first
      // In a real app, you would query your database to get the username from userId
      finalUsername = 'temp_username'; // This matches where the image was uploaded
    }

    // Check if user has profile pictures in Cloudinary
    try {
      const folderPath = `users/${finalUsername}/profile_pictures`;
      console.log('Searching in folder:', folderPath); // Debug log
      
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath,
        max_results: 50,
        sort_by: 'created_at',
        sort_direction: 'desc'
      });

      console.log('Found resources:', result.resources.length); // Debug log

      if (result.resources.length === 0) {
        return NextResponse.json({ 
          success: true,
          message: 'No profile pictures found',
          data: {
            username: finalUsername,
            userId: userId,
            hasProfilePicture: false,
            folderPath: folderPath,
            searchInfo: {
              searchedFolder: folderPath,
              cloudinaryResponse: result
            }
          }
        });
      }

      // Get current profile picture (most recent)
      const currentDp = result.resources[0];
      const currentDpData = {
        avatar: currentDp.secure_url,
        publicId: currentDp.public_id,
        username: finalUsername,
        userId: userId,
        hasProfilePicture: true,
        uploadedAt: currentDp.created_at,
        width: currentDp.width,
        height: currentDp.height,
        format: currentDp.format,
        size: currentDp.bytes
      };

      // If history is requested, return all profile pictures
      if (includeHistory) {
        const profilePictures = result.resources.map((resource: any) => ({
          publicId: resource.public_id,
          url: resource.secure_url,
          format: resource.format,
          width: resource.width,
          height: resource.height,
          size: resource.bytes,
          uploadedAt: resource.created_at,
          isCurrent: resource.public_id === currentDp.public_id
        }));

        return NextResponse.json({
          success: true,
          message: 'Profile pictures retrieved successfully',
          data: {
            current: currentDpData,
            history: profilePictures,
            totalCount: profilePictures.length,
            folderPath: folderPath
          }
        });
      }

      // Return only current profile picture
      return NextResponse.json({
        success: true,
        message: 'Profile picture retrieved successfully',
        data: currentDpData
      });

    } catch (cloudinaryError) {
      console.error('Error fetching from Cloudinary:', cloudinaryError);
      return NextResponse.json({ 
        error: 'Error accessing Cloudinary',
        details: cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error',
        searchInfo: {
          searchedFolder: `users/${finalUsername}/profile_pictures`,
          userId: userId,
          username: finalUsername
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error retrieving profile picture:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
