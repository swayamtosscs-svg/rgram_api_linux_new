import { NextApiRequest, NextApiResponse } from 'next';
import { fetchReligiousVideos, isReligiousContent } from '../../../lib/utils/videoFetcher';
import connectDB from '../../../lib/database';
import ReligiousReel from '../../../lib/models/ReligiousReel';

// List of major religions to fetch videos for
const RELIGIONS = [
  'hinduism',
  'islam',
  'christianity',
  'sikhism',
  'buddhism',
  'jainism'
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get page and limit from query parameters or use defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const religion = (req.query.religion as string)?.toLowerCase() || '';

    // If religion is specified, fetch videos for that religion only
    const religionsToFetch = religion ? [religion] : RELIGIONS;

    // Fetch videos from both YouTube and existing database
    const allVideos = [];
    
    // First, get videos from our database
    const skip = (page - 1) * limit;
    const dbQuery = religion ? { religion: religion } : {};
    
    const existingVideos = await ReligiousReel.find(dbQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    allVideos.push(...existingVideos);

    // If we don't have enough videos, fetch from YouTube
    if (allVideos.length < limit) {
      const remainingCount = limit - allVideos.length;
      
      // Fetch new videos from YouTube for each religion
      for (const rel of religionsToFetch) {
        const youtubeVideos = await fetchReligiousVideos(rel);
        
        // Filter videos to ensure they're religious content
        const validVideos = youtubeVideos.filter(video => 
          isReligiousContent(video.title, video.description || '')
        );

        // Save new videos to database
        for (const video of validVideos) {
          const newVideo = new ReligiousReel({
            title: video.title,
            videoUrl: video.videoUrl,
            description: video.description,
            source: video.source,
            religion: rel,
            tags: video.tags,
            createdAt: new Date()
          });

          try {
            await newVideo.save();
            allVideos.push(newVideo);
          } catch (error) {
            console.error('Error saving video:', error);
            // Continue with next video if one fails
            continue;
          }

          // Break if we have enough videos
          if (allVideos.length >= limit) {
            break;
          }
        }

        if (allVideos.length >= limit) {
          break;
        }
      }
    }

    // Count total documents for pagination
    const totalVideos = await ReligiousReel.countDocuments(dbQuery);
    const totalPages = Math.ceil(totalVideos / limit);

    return res.status(200).json({
      success: true,
      message: 'Religious videos fetched successfully',
      data: {
        videos: allVideos,
        pagination: {
          currentPage: page,
          totalPages,
          totalVideos,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });

  } catch (error: unknown) {
    console.error('Error in auto-religious videos API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
