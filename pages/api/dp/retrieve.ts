import { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from '../../../utils/cloudinary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, publicId, imageUrl } = req.query;
    
    console.log('DP retrieve request:', { userId, publicId, imageUrl });

    // Check if any parameter is provided
    if (!userId && !publicId && !imageUrl) {
      return res.status(400).json({ 
        error: 'Either userId, publicId, or imageUrl query parameter is required' 
      });
    }

    let searchQuery = '';

    if (userId) {
      // For userId, we need to search for resources in the user's folder
      // We'll use Cloudinary's search API to find images in the user's dp folder
      try {
        console.log(`Searching for DP in folder: user/${userId}/dp/*`);
        
        const searchResult = await cloudinary.search
          .expression(`folder:user/${userId}/dp/*`)
          .sort_by('created_at', 'desc')
          .max_results(1)
          .execute();
        
        console.log('Search result:', searchResult);
        
        if (searchResult.resources && searchResult.resources.length > 0) {
          const result = searchResult.resources[0];
          return res.status(200).json({
            success: true,
            data: {
              publicId: result.public_id,
              url: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              size: result.bytes,
              createdAt: result.created_at,
              folder: result.folder,
              resourceType: result.resource_type
            }
          });
        } else {
          return res.status(404).json({
            success: false,
            message: 'No DP found for this user',
            data: {
              userId,
              message: 'User has no display picture uploaded'
            }
          });
        }
      } catch (searchError) {
        console.error('Cloudinary search error:', searchError);
        return res.status(404).json({
          success: false,
          message: 'No DP found for this user',
          data: {
            userId,
            message: 'User has no display picture uploaded'
          }
        });
      }
    } else if (publicId) {
      // Search by specific public ID
      searchQuery = publicId as string;
    } else if (imageUrl) {
      // Extract public ID from image URL
      const url = imageUrl as string;
      const urlParts = url.split('/');
      const dpIndex = urlParts.findIndex(part => part === 'dp');
      if (dpIndex !== -1 && dpIndex + 1 < urlParts.length) {
        searchQuery = urlParts.slice(dpIndex + 1).join('/').split('.')[0];
      }
    }

    // Only proceed with direct resource lookup if we have a specific publicId or extracted publicId from URL
    if (searchQuery) {
      try {
        // Get image information from Cloudinary
        const result = await cloudinary.api.resource(searchQuery);
        
        res.status(200).json({
          success: true,
          data: {
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            size: result.bytes,
            createdAt: result.created_at,
            folder: result.folder,
            resourceType: result.resource_type
          }
        });
      } catch (cloudinaryError) {
        // If image not found, return appropriate response
        const errorMessage = cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError);
        if (errorMessage.includes('not found')) {
          res.status(404).json({
            success: false,
            message: 'Image not found',
            data: {
              searchQuery,
              message: 'No image found with the provided criteria'
            }
          });
        } else {
          throw cloudinaryError;
        }
      }
    } else {
      res.status(400).json({ error: 'Could not determine search query' });
    }

  } catch (error) {
    console.error('DP retrieve error:', error);
    
    // Provide more specific error details
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      errorMessage = JSON.stringify(error);
    }
    
    res.status(500).json({ 
      error: 'Failed to retrieve DP',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}
