import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  religion: string;
  category: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Define the external video sources
    const externalVideos: VideoItem[] = [
      {
        id: 'hindu_video_1',
        title: 'Hindu Religious Video 1',
        description: 'A beautiful Hindu religious video showcasing traditions and rituals',
        videoUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedios/',
        embedUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedios/',
        thumbnailUrl: '/images/religious/hinduism/1.jpg',
        religion: 'Hinduism',
        category: 'religious'
      },
      {
        id: 'hindu_video_2',
        title: 'Hindu Religious Video 2',
        description: 'Explore the rich cultural heritage of Hinduism',
        videoUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedio2/',
        embedUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedio2/',
        thumbnailUrl: '/images/religious/hinduism/2.jpg',
        religion: 'Hinduism',
        category: 'religious'
      },
      {
        id: 'hindu_video_3',
        title: 'Hindu Religious Video 3',
        description: 'Sacred Hindu ceremonies and practices',
        videoUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedio3/',
        embedUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedio3/',
        thumbnailUrl: '/images/religious/hinduism/3.jpg',
        religion: 'Hinduism',
        category: 'religious'
      }
    ];

    // Get query parameters
    const { religion, category } = req.query;
    
    // Filter videos based on query parameters
    let filteredVideos = [...externalVideos];
    
    if (religion) {
      filteredVideos = filteredVideos.filter(video => 
        video.religion.toLowerCase() === String(religion).toLowerCase()
      );
    }
    
    if (category) {
      filteredVideos = filteredVideos.filter(video => 
        video.category.toLowerCase() === String(category).toLowerCase()
      );
    }

    // Handle pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Get total before pagination
    const total = filteredVideos.length;
    
    // Apply pagination
    const paginatedVideos = filteredVideos.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      message: 'External religious videos fetched successfully',
      data: {
        videos: paginatedVideos,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalVideos: total,
          hasNextPage: endIndex < total,
          hasPrevPage: page > 1,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching external religious videos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching external religious videos',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}