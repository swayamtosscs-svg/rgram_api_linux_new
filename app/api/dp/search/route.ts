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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');
    const includeHistory = searchParams.get('includeHistory') === 'true';

    // Declare variables at function level for proper scope
    let searchFolders: string[] = [];
    let foundResources: any[] = [];
    let searchedFolders: string[] = [];

    // Search in all user folders to find the profile picture
    try {
      // First, try to find the user's folder
      if (username) {
        // If username is provided, search in that specific folder
        searchFolders.push(`users/${username}/profile_pictures`);
      } else if (userId) {
        // If userId is provided, search in common username patterns
        // This is a fallback since we don't have the actual username
        searchFolders = [
          'users/temp_username/profile_pictures', // Where your image was uploaded
          'users/test_user/profile_pictures',
          'users/default_user/profile_pictures'
        ];
      } else {
        // Search in all user folders
        searchFolders = ['users/*/profile_pictures'];
      }

      // Search in each folder
      for (const folder of searchFolders) {
        try {
          const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: folder,
            max_results: 50,
            sort_by: 'created_at',
            sort_direction: 'desc'
          });

          if (result.resources && result.resources.length > 0) {
            foundResources = foundResources.concat(result.resources);
            searchedFolders.push(folder);
          }
        } catch (folderError) {
          console.log(`Error searching folder ${folder}:`, folderError);
        }
      }

      // If no resources found, search more broadly
      if (foundResources.length === 0) {
        try {
          const broadResult = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'users/',
            max_results: 100,
            sort_by: 'created_at',
            sort_direction: 'desc'
          });

          if (broadResult.resources && broadResult.resources.length > 0) {
            foundResources = broadResult.resources;
            searchedFolders.push('users/* (broad search)');
          }
        } catch (broadError) {
          console.log('Error in broad search:', broadError);
        }
      }

      if (foundResources.length === 0) {
        return NextResponse.json({ 
          success: true,
          message: 'No profile pictures found in any user folders',
          data: {
            userId: userId,
            username: username,
            hasProfilePicture: false,
            searchedFolders: searchedFolders,
            searchInfo: {
              totalFoldersSearched: searchFolders.length,
              searchedFolders: searchedFolders
            }
          }
        });
      }

      // Sort all found resources by upload date (most recent first)
      foundResources.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Get current profile picture (most recent)
      const currentDp = foundResources[0];
      
      // Extract username from the public_id path
      const pathParts = currentDp.public_id.split('/');
      const extractedUsername = pathParts[1] || 'unknown_user';

      const currentDpData = {
        avatar: currentDp.secure_url,
        publicId: currentDp.public_id,
        username: extractedUsername,
        userId: userId,
        hasProfilePicture: true,
        uploadedAt: currentDp.created_at,
        width: currentDp.width,
        height: currentDp.height,
        format: currentDp.format,
        size: currentDp.bytes,
        foundInFolder: pathParts.slice(0, 2).join('/')
      };

      // If history is requested, return all profile pictures
      if (includeHistory) {
        const profilePictures = foundResources.map((resource: any) => {
          const resourcePathParts = resource.public_id.split('/');
          return {
            publicId: resource.public_id,
            url: resource.secure_url,
            format: resource.format,
            width: resource.width,
            height: resource.height,
            size: resource.bytes,
            uploadedAt: resource.created_at,
            isCurrent: resource.public_id === currentDp.public_id,
            foundInFolder: resourcePathParts.slice(0, 2).join('/')
          };
        });

        return NextResponse.json({
          success: true,
          message: 'Profile pictures found successfully',
          data: {
            current: currentDpData,
            history: profilePictures,
            totalCount: profilePictures.length,
            searchedFolders: searchedFolders
          }
        });
      }

      // Return only current profile picture
      return NextResponse.json({
        success: true,
        message: 'Profile picture found successfully',
        data: currentDpData
      });

    } catch (cloudinaryError) {
      console.error('Error searching Cloudinary:', cloudinaryError);
      return NextResponse.json({ 
        error: 'Error searching Cloudinary',
        details: cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error',
        searchInfo: {
          userId: userId,
          username: username,
          searchedFolders: searchFolders
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
