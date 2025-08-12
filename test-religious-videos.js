const axios = require('axios');

const YOUTUBE_API_KEY = 'AIzaSyDVsMDn82s-o7LwZyEJwL51HOUkDN3id8o';

async function fetchReligiousVideos() {
    try {
        // Array of religious search terms
        const searchQueries = [
            'spiritual meditation prayers',
            'hindu temple worship',
            'islamic prayer dua',
            'christian worship songs',
            'sikh gurdwara kirtan',
            'buddhist meditation chants'
        ];

        const allVideos = [];

        // Fetch videos for each religious query
        for (const query of searchQueries) {
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
                params: {
                    part: 'snippet',
                    q: query,
                    maxResults: 5,
                    type: 'video',
                    videoDuration: 'short',
                    key: YOUTUBE_API_KEY
                }
            });

            const videos = response.data.items.map(item => ({
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnails: item.snippet.thumbnails,
                videoId: item.id.videoId,
                videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                publishedAt: item.snippet.publishedAt,
                channelTitle: item.snippet.channelTitle,
                searchQuery: query
            }));

            allVideos.push(...videos);
        }

        console.log('\n=== Religious Videos Found ===\n');
        allVideos.forEach((video, index) => {
            console.log(`Video ${index + 1}:`);
            console.log(`Title: ${video.title}`);
            console.log(`Channel: ${video.channelTitle}`);
            console.log(`Category: ${video.searchQuery}`);
            console.log(`URL: ${video.videoUrl}`);
            console.log(`Description: ${video.description.slice(0, 100)}...`);
            console.log('----------------------------------------\n');
        });

    } catch (error) {
        console.error('Error fetching videos:', error.response ? error.response.data : error.message);
    }
}

// Run the function
console.log('Fetching religious videos...\n');
fetchReligiousVideos();
