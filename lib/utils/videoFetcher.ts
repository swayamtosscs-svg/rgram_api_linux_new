import axios from 'axios';

// You'll need to set these environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

interface VideoSource {
  title: string;
  videoUrl: string;
  source: string;
  description?: string;
  tags?: string[];
  thumbnail?: string;
}

export async function fetchReligiousVideos(religion: string): Promise<VideoSource[]> {
  try {
    // Search query based on religion
    const query = `${religion} spiritual religious`;
    const maxResults = 10;

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&maxResults=${maxResults}&type=video&videoDuration=short&key=${YOUTUBE_API_KEY}`
    );

    const videos = response.data.items.map((item: any) => ({
      title: item.snippet.title,
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      source: 'youtube',
      description: item.snippet.description,
      tags: [religion, 'spiritual', 'religious'],
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url
    }));

    return videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw new Error('Failed to fetch religious videos');
  }
}

// Function to validate if content is religious (you can enhance this based on your needs)
export function isReligiousContent(title: string, description: string): boolean {
  const religiousKeywords = [
    'god', 'prayer', 'spiritual', 'divine', 'holy', 'sacred',
    'worship', 'temple', 'church', 'mosque', 'gurudwara',
    'meditation', 'dharma', 'karma'
  ];

  const contentText = (title + ' ' + description).toLowerCase();
  return religiousKeywords.some(keyword => contentText.includes(keyword.toLowerCase()));
}
