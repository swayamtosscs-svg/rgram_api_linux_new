# Video API Demo

## Overview

This demo provides an interactive way to explore the video API endpoints available in the Apirgram API. The demo includes functionality to:

1. View video categories with counts and percentages
2. Fetch videos filtered by religion with statistics
3. Get religious reels with filtering options
4. Add external video links (e.g., YouTube Shorts) as video posts

## How to Use the Demo

### Accessing the Demo

The demo is available at: [http://localhost:3000/video-api-demo.html](http://localhost:3000/video-api-demo.html)

You can also access it by clicking the "Try Video API Demo" button on the homepage.

### Testing API Endpoints

#### 1. Video Categories

Click the "Try it" button in the `/api/videos/categories` section to fetch all available video categories with their counts and percentages.

#### 2. Religion Videos

Select a religion from the dropdown menu and click the "Try it" button in the `/api/videos/religion` section to fetch videos filtered by the selected religion.

#### 3. Religious Reels

Select a religion and category from the dropdown menus and click the "Try it" button in the `/api/videos/religious-reels` section to fetch religious reels with the selected filters.

#### 4. Add Video Link

The demo includes a form to add a YouTube Shorts video link as a video post. The form is pre-filled with a Krishna devotional video, but you can modify the fields as needed:

- **Video URL**: The YouTube Shorts URL (e.g., `https://youtube.com/shorts/aZuIkQXuIVw?si=DDWJDtjUevItgG03`)
- **Title**: The title for the video post
- **Description**: A description for the video post
- **Category**: The category for the video (e.g., Inspiration, Entertainment, Education)
- **Religion**: The religion tag for the video (e.g., Hinduism, Islam, Christianity)

The thumbnail is automatically generated from the YouTube video ID and displayed in the preview section.

**Note**: The "Add Video" functionality requires authentication. In a real implementation, you would need to provide a valid authentication token. The demo will show what the request would look like but may not actually add the video to the database without proper authentication.

## API Documentation

For more detailed information about the video API endpoints, please refer to the [VIDEO_API_DOCUMENTATION.md](../VIDEO_API_DOCUMENTATION.md) file.

## Testing

You can also test the video API endpoints using the provided test script:

```bash
node test-video-api.js
```

This script will test various video API endpoints and display the results in the console.