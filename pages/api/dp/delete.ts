import { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from '../../../utils/cloudinary';
import { deleteFromCloudinary } from '../../../utils/cloudinaryFolders';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { publicId, imageUrl, userId } = req.body;
    
    console.log('DP delete request:', { publicId, imageUrl, userId });

    // Check if either publicId, imageUrl, or userId is provided
    if (!publicId && !imageUrl && !userId) {
      return res.status(400).json({ 
        error: 'Either publicId, imageUrl, or userId is required' 
      });
    }

    let publicIdToDelete = publicId;

    // If imageUrl is provided, extract public ID from it
    if (imageUrl && !publicId) {
      publicIdToDelete = imageUrl.split('/').pop()?.split('.')[0];
    }

    // If userId is provided, try to find and delete their DP
    if (userId && !publicId && !imageUrl) {
      try {
        // Search for the user's DP in Cloudinary
        const searchResult = await cloudinary.search
          .expression(`folder:user/${userId}/dp/*`)
          .sort_by('created_at', 'desc')
          .max_results(1)
          .execute();
        
        if (searchResult.resources && searchResult.resources.length > 0) {
          // Use the actual public ID of the found image
          publicIdToDelete = searchResult.resources[0].public_id;
        } else {
          return res.status(404).json({
            success: false,
            message: 'No DP found for this user',
            data: {
              userId,
              message: 'User has no display picture to delete'
            }
          });
        }
      } catch (searchError) {
        console.error('Cloudinary search error during deletion:', searchError);
        return res.status(500).json({
          success: false,
          message: 'Failed to search for user DP',
          data: {
            userId,
            message: 'Error occurred while searching for user display picture'
          }
        });
      }
    }

    if (!publicIdToDelete) {
      return res.status(400).json({ error: 'Could not determine public ID for deletion' });
    }

    console.log('Attempting to delete with public ID:', publicIdToDelete);

    // Delete from Cloudinary
    const deleted = await deleteFromCloudinary(publicIdToDelete);
    
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'DP deleted successfully',
        data: {
          deletedPublicId: publicIdToDelete,
          message: 'Image removed from Cloudinary'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete DP',
        data: {
          publicId: publicIdToDelete,
          message: 'Image may not exist or deletion failed'
        }
      });
    }

  } catch (error) {
    console.error('DP delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete DP',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
