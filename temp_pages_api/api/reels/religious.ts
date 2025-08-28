import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchReligiousVideos, isReligiousContent } from '../../../lib/utils/videoFetcher';
import ReligiousReel from '../../../lib/models/ReligiousReel';
import dbConnect from '../../../lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Get query parameters
    const { religion = 'all', page = '1', limit = '10' } = req.query;
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);

    // First check if we have enough approved reels in our database
    const existingReels = await ReligiousReel.find({ 
      isApproved: true,
      ...(religion !== 'all' && { category: religion })
    })
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

    if (existingReels.length >= limitNumber) {
      return res.status(200).json({
        success: true,
        data: existingReels,
        page: pageNumber,
        totalResults: existingReels.length
      });
    }

    // If we don't have enough reels, fetch new ones
    const religions = religion === 'all' 
      ? ['hindu', 'islam', 'christian', 'sikh', 'buddhist']
      : [religion as string];

    let newVideos = [];
    for (const rel of religions) {
      const videos = await fetchReligiousVideos(rel);
      
      // Filter videos to ensure they're religious content
      const validVideos = videos.filter(video => 
        isReligiousContent(video.title, video.description || '')
      );

      // Save new videos to database
      for (const video of validVideos) {
        const existingVideo = await ReligiousReel.findOne({ videoUrl: video.videoUrl });
        if (!existingVideo) {
          const newReel = new ReligiousReel({
            ...video,
            category: rel,
            isApproved: true // You might want to set this to false and implement an approval process
          });
          await newReel.save();
          newVideos.push(newReel);
        }
      }
    }

    // Combine existing and new reels
    const allReels = [...existingReels, ...newVideos].slice(0, limitNumber);

    return res.status(200).json({
      success: true,
      data: allReels,
      page: pageNumber,
      totalResults: allReels.length
    });

  } catch (error) {
    console.error('Error in religious reels API:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching religious reels'
    });
  }
}
