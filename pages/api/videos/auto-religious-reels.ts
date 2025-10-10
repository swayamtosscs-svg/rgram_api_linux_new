import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

// Predefined religious video sources (you can expand this)
const RELIGIOUS_VIDEO_SOURCES = {
  christianity: {
    videos: [
      {
        url: "https://example.com/christian-worship-1.mp4",
        thumbnail: "https://example.com/christian-thumb-1.jpg",
        title: "Christian Worship Service",
        category: "worship"
      },
      {
        url: "https://example.com/bible-study-1.mp4",
        thumbnail: "https://example.com/bible-thumb-1.jpg",
        title: "Bible Study Session",
        category: "education"
      },
      {
        url: "https://example.com/prayer-1.mp4",
        thumbnail: "https://example.com/prayer-thumb-1.jpg",
        title: "Prayer Time",
        category: "prayer"
      }
    ]
  },
  islam: {
    videos: [
      {
        url: "https://example.com/islamic-prayer-1.mp4",
        thumbnail: "https://example.com/islamic-thumb-1.jpg",
        title: "Islamic Prayer",
        category: "prayer"
      },
      {
        url: "https://example.com/quran-recitation-1.mp4",
        thumbnail: "https://example.com/quran-thumb-1.jpg",
        title: "Quran Recitation",
        category: "recitation"
      },
      {
        url: "https://example.com/islamic-lecture-1.mp4",
        thumbnail: "https://example.com/lecture-thumb-1.jpg",
        title: "Islamic Lecture",
        category: "education"
      }
    ]
  },
  hinduism: {
    videos: [
      {
        url: "https://example.com/hindu-puja-1.mp4",
        thumbnail: "https://example.com/hindu-thumb-1.jpg",
        title: "Hindu Puja Ceremony",
        category: "ceremony"
      },
      {
        url: "https://example.com/bhajan-1.mp4",
        thumbnail: "https://example.com/bhajan-thumb-1.jpg",
        title: "Bhajan Singing",
        category: "devotional"
      },
      {
        url: "https://example.com/vedic-chanting-1.mp4",
        thumbnail: "https://example.com/vedic-thumb-1.jpg",
        title: "Vedic Chanting",
        category: "chanting"
      }
    ]
  },
  buddhism: {
    videos: [
      {
        url: "https://example.com/meditation-1.mp4",
        thumbnail: "https://example.com/meditation-thumb-1.jpg",
        title: "Buddhist Meditation",
        category: "meditation"
      },
      {
        url: "https://example.com/dharma-talk-1.mp4",
        thumbnail: "https://example.com/dharma-thumb-1.jpg",
        title: "Dharma Talk",
        category: "teaching"
      },
      {
        url: "https://example.com/mantra-chanting-1.mp4",
        thumbnail: "https://example.com/mantra-thumb-1.jpg",
        title: "Mantra Chanting",
        category: "chanting"
      }
    ]
  },
  judaism: {
    videos: [
      {
        url: "https://example.com/jewish-prayer-1.mp4",
        thumbnail: "https://example.com/jewish-thumb-1.jpg",
        title: "Jewish Prayer Service",
        category: "prayer"
      },
      {
        url: "https://example.com/torah-study-1.mp4",
        thumbnail: "https://example.com/torah-thumb-1.jpg",
        title: "Torah Study",
        category: "study"
      },
      {
        url: "https://example.com/shabbat-1.mp4",
        thumbnail: "https://example.com/shabbat-thumb-1.jpg",
        title: "Shabbat Celebration",
        category: "celebration"
      }
    ]
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    if (req.method === 'GET') {
      // Get available religious video sources
      const { religion, category } = req.query;

      let availableVideos: any[] = [];

      if (religion && religion !== 'all') {
        const religionData = RELIGIOUS_VIDEO_SOURCES[religion as keyof typeof RELIGIOUS_VIDEO_SOURCES];
        if (religionData) {
          availableVideos = category && category !== 'all' 
            ? religionData.videos.filter(video => video.category === category)
            : religionData.videos;
        }
      } else {
        // Return all religions
        Object.values(RELIGIOUS_VIDEO_SOURCES).forEach(religionData => {
          availableVideos.push(...religionData.videos);
        });
      }

      res.json({
        success: true,
        message: 'Available religious video sources fetched successfully',
        data: {
          availableVideos,
          religion: religion || 'all',
          category: category || 'all',
          totalVideos: availableVideos.length
        }
      });

    } else if (req.method === 'POST') {
      // Auto-generate religious reel
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const decoded = await verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      const { 
        content, 
        religion, 
        category = 'all',
        autoGenerate = true,
        useRandom = true,
        specificVideoIndex = null
      } = req.body;

      // Validation
      if (!religion) {
        return res.status(400).json({
          success: false,
          message: 'Religion is required for religious reels'
        });
      }

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Content is required for religious reels'
        });
      }

      // Get religious video sources
      const religionData = RELIGIOUS_VIDEO_SOURCES[religion as keyof typeof RELIGIOUS_VIDEO_SOURCES];
      if (!religionData) {
        return res.status(400).json({
          success: false,
          message: `No video sources available for religion: ${religion}`
        });
      }

      let selectedVideo;

      if (autoGenerate) {
        // Filter by category if specified
        let availableVideos = religionData.videos;
        if (category && category !== 'all') {
          availableVideos = religionData.videos.filter(video => video.category === category);
        }

        if (availableVideos.length === 0) {
          return res.status(400).json({
            success: false,
            message: `No videos available for religion: ${religion} and category: ${category}`
          });
        }

        if (useRandom) {
          // Select random video
          const randomIndex = Math.floor(Math.random() * availableVideos.length);
          selectedVideo = availableVideos[randomIndex];
        } else if (specificVideoIndex !== null) {
          // Select specific video by index
          if (specificVideoIndex >= 0 && specificVideoIndex < availableVideos.length) {
            selectedVideo = availableVideos[specificVideoIndex];
          } else {
            return res.status(400).json({
              success: false,
              message: 'Invalid video index'
            });
          }
        } else {
          // Select first available video
          selectedVideo = availableVideos[0];
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Auto-generation is required for this endpoint'
        });
      }

      // Create the religious reel with auto-generated video
      const reel = await (Post as any).create({
        author: decoded.userId,
        content: content.trim(),
        videoUrl: selectedVideo.url,
        thumbnailUrl: selectedVideo.thumbnail,
        religion,
        category: selectedVideo.category,
        title: selectedVideo.title,
        type: 'reel',
        isActive: true,
        autoGenerated: true,
        createdAt: new Date()
      });

      // Update user's reel count
      await (User as any).findByIdAndUpdate(decoded.userId, {
        $inc: { reelsCount: 1 }
      });

      // Populate author info
      await reel.populate('author', 'username fullName avatar');

      res.status(201).json({
        success: true,
        message: 'Religious reel auto-generated successfully',
        data: {
          reel,
          autoGeneratedVideo: {
            url: selectedVideo.url,
            thumbnail: selectedVideo.thumbnail,
            title: selectedVideo.title,
            category: selectedVideo.category
          },
          generationMethod: useRandom ? 'random' : 'specific',
          religion,
          category: selectedVideo.category
        }
      });

    } else {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

  } catch (error: any) {
    console.error('Auto religious reels error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
