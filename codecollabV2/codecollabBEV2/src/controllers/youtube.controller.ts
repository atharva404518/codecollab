import { Request, Response } from 'express';
import axios from 'axios';

// YouTube API key from env variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

interface YouTubeSearchResponse {
  items: any[];
  [key: string]: any;
}

// Define a type for Axios error
interface AxiosErrorResponse {
  response?: {
    status: number;
    data: any;
  };
}

/**
 * Search YouTube for videos
 */
export const searchYouTube = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key is not configured');
      return res.status(500).json({ error: 'YouTube API key is not configured' });
    }
    
    // Call YouTube API
    const response = await axios.get<YouTubeSearchResponse>(YOUTUBE_API_URL, {
      params: {
        part: 'snippet',
        maxResults: 10,
        q: q,
        type: 'video',
        videoCategoryId: '10', // Music category ID
        key: YOUTUBE_API_KEY
      }
    });
    
    if (!response.data || !response.data.items) {
      return res.status(500).json({ error: 'Invalid response from YouTube API' });
    }
    
    // Return the items from YouTube response
    res.json({ items: response.data.items });
  } catch (error) {
    console.error('Error searching YouTube:', error);
    
    // Check if it's an axios error with response
    const axiosError = error as AxiosErrorResponse;
    if (axiosError && typeof axiosError === 'object' && axiosError.response) {
      console.error('YouTube API error details:', axiosError.response.data);
      return res.status(axiosError.response.status || 500).json({ 
        error: 'YouTube API error', 
        details: axiosError.response.data 
      });
    }
    
    res.status(500).json({ error: 'Failed to search YouTube' });
  }
}; 
