import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Categories of religious content with predefined videos
const RELIGIOUS_CATEGORIES = [
    {
        name: 'Hinduism',
        videos: [
            {
                id: 'hindu_video_1',
                title: 'Hindu Religious Video 1',
                description: 'A beautiful Hindu religious video showcasing traditions and rituals',
                thumbnails: {
                    default: { url: '/images/religious/hinduism/1.jpg' },
                    medium: { url: '/images/religious/hinduism/1.jpg' },
                    high: { url: '/images/religious/hinduism/1.jpg' }
                },
                publishedAt: new Date().toISOString(),
                channelTitle: 'Hindu Channel',
                videoUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedios/',
                embedUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedios/'
            },
            {
                id: 'hindu_video_2',
                title: 'Hindu Religious Video 2',
                description: 'Explore the rich cultural heritage of Hinduism',
                thumbnails: {
                    default: { url: '/images/religious/hinduism/2.jpg' },
                    medium: { url: '/images/religious/hinduism/2.jpg' },
                    high: { url: '/images/religious/hinduism/2.jpg' }
                },
                publishedAt: new Date().toISOString(),
                channelTitle: 'Hindu Channel',
                videoUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedio2/',
                embedUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedio2/'
            },
            {
                id: 'hindu_video_3',
                title: 'Hindu Religious Video 3',
                description: 'Sacred Hindu ceremonies and practices',
                thumbnails: {
                    default: { url: '/images/religious/hinduism/3.jpg' },
                    medium: { url: '/images/religious/hinduism/3.jpg' },
                    high: { url: '/images/religious/hinduism/3.jpg' }
                },
                publishedAt: new Date().toISOString(),
                channelTitle: 'Hindu Channel',
                videoUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedio3/',
                embedUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedio3/'
            }
        ]
    },
    {
        name: 'Islam',
        videos: [
            {
                id: 'islam_video_1',
                title: 'Islamic Prayers',
                description: 'Beautiful Islamic prayers and recitations',
                thumbnails: {
                    default: { url: '/images/religious/hinduism/4.jpg' },
                    medium: { url: '/images/religious/hinduism/4.jpg' },
                    high: { url: '/images/religious/hinduism/4.jpg' }
                },
                publishedAt: new Date().toISOString(),
                channelTitle: 'Islamic Channel',
                videoUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedios/',
                embedUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedios/'
            }
        ]
    },
    {
        name: 'Christianity',
        videos: [
            {
                id: 'christian_video_1',
                title: 'Christian Worship',
                description: 'Christian worship songs and prayers',
                thumbnails: {
                    default: { url: '/images/religious/hinduism/5.jpg' },
                    medium: { url: '/images/religious/hinduism/5.jpg' },
                    high: { url: '/images/religious/hinduism/5.jpg' }
                },
                publishedAt: new Date().toISOString(),
                channelTitle: 'Christian Channel',
                videoUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedio2/',
                embedUrl: 'https://dhaneshwaritosscs-netizen.github.io/vedio2/'
            }
        ]
    }
];

interface YoutubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
    };
    publishedAt: string;
    channelTitle: string;
    videoUrl: string;
    embedUrl: string;
}

interface ProcessedVideo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { category, maxResults = 10 } = req.query;
        let allVideos: YoutubeVideo[] = [];

        // If category is specified, filter categories
        const categoriesToSearch = category 
            ? RELIGIOUS_CATEGORIES.filter(cat => 
                cat.name.toLowerCase() === String(category).toLowerCase())
            : RELIGIOUS_CATEGORIES;

        // Get videos from each category
        for (const categoryData of categoriesToSearch) {
            allVideos = [...allVideos, ...categoryData.videos];
        }

        // Process videos to match the expected format
        let videosToReturn: ProcessedVideo[] = allVideos.map(video => ({
            id: video.id,
            title: video.title,
            description: video.description,
            thumbnail: video.thumbnails.medium.url
        }));

        // Randomize the order of videos
        videosToReturn = videosToReturn.sort(() => Math.random() - 0.5);

        // Limit the number of videos if specified
        if (maxResults) {
            videosToReturn = videosToReturn.slice(0, Number(maxResults));
        }

        return res.status(200).json({
            success: true,
            message: 'Religious videos fetched successfully',
            data: {
                videos: videosToReturn,
                totalVideos: videosToReturn.length,
                category: category || 'all'
            }
        });

    } catch (error: unknown) {
        console.error('Error fetching religious videos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching religious videos',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
