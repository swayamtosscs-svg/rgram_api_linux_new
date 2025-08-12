import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Categories of religious content
const RELIGIOUS_CATEGORIES = [
    {
        name: 'Hinduism',
        queries: ['hindu temple worship', 'hindu bhajan', 'hindu prayers']
    },
    {
        name: 'Islam',
        queries: ['islamic prayers', 'quran recitation', 'islamic lectures']
    },
    {
        name: 'Christianity',
        queries: ['christian worship songs', 'christian prayers', 'bible study']
    },
    {
        name: 'Sikhism',
        queries: ['sikh kirtan', 'gurdwara live', 'sikh prayers']
    },
    {
        name: 'Buddhism',
        queries: ['buddhist meditation', 'buddhist chants', 'buddhist teachings']
    }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { category, maxResults = 10 } = req.query;
        let videosToReturn = [];

        // If category is specified, filter categories
        const categoriesToSearch = category 
            ? RELIGIOUS_CATEGORIES.filter(cat => 
                cat.name.toLowerCase() === String(category).toLowerCase())
            : RELIGIOUS_CATEGORIES;

        // Fetch videos for each category
        for (const categoryData of categoriesToSearch) {
            // Get random query from category's queries
            const randomQuery = categoryData.queries[Math.floor(Math.random() * categoryData.queries.length)];
            
            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    q: randomQuery,
                    maxResults: Math.ceil(Number(maxResults) / categoriesToSearch.length),
                    type: 'video',
                    videoDuration: 'medium', // Medium length videos
                    key: YOUTUBE_API_KEY
                }
            });

            const videos = response.data.items.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnails: item.snippet.thumbnails,
                publishedAt: item.snippet.publishedAt,
                channelTitle: item.snippet.channelTitle,
                category: categoryData.name,
                videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
            }));

            videosToReturn = [...videosToReturn, ...videos];
        }

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

    } catch (error) {
        console.error('Error fetching religious videos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching religious videos',
            error: error.message
        });
    }
}
