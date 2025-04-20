import { Request, Response } from 'express';
import { supabaseClient } from '../config/supabase';
import {
  searchMusic,
  getRecommendations,
  createRoomPlaylist,
  addToQueue,
  removeFromQueue,
  playNext,
} from '../services/music.service';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import ytdl from 'ytdl-core';

export const searchMusicHandler = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await searchMusic(query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Music search error:', error);
    res.status(500).json({ error: 'Failed to search music' });
  }
};

export const addToPlaylist = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { trackId } = req.body;

    if (!roomId || !trackId) {
      return res.status(400).json({ error: 'Room ID and track ID are required' });
    }

    // Get current playlist
    const { data: playlist, error: playlistError } = await supabaseClient
      .from('room_playlists')
      .select('*')
      .eq('room_id', roomId)
      .single();

    if (playlistError) {
      return res.status(500).json({ error: 'Failed to get playlist' });
    }

    // Update playlist with new track
    const updatedPlaylist = {
      ...playlist,
      tracks: [...(playlist.tracks || []), trackId],
    };

    // Update playlist in database
    const { error: updateError } = await supabaseClient
      .from('room_playlists')
      .update(updatedPlaylist)
      .eq('id', playlist.id);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update playlist' });
    }

    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error adding to playlist:', error);
    res.status(500).json({ error: 'Failed to add to playlist' });
  }
};

export const removeFromPlaylist = async (req: Request, res: Response) => {
  try {
    const { roomId, trackId } = req.params;

    if (!roomId || !trackId) {
      return res.status(400).json({ error: 'Room ID and track ID are required' });
    }

    // Get current playlist
    const { data: playlist, error: playlistError } = await supabaseClient
      .from('room_playlists')
      .select('*')
      .eq('room_id', roomId)
      .single();

    if (playlistError) {
      return res.status(500).json({ error: 'Failed to get playlist' });
    }

    // Remove track from playlist
    const updatedPlaylist = {
      ...playlist,
      tracks: (playlist.tracks || []).filter((id: string) => id !== trackId),
    };

    // Update playlist in database
    const { error: updateError } = await supabaseClient
      .from('room_playlists')
      .update(updatedPlaylist)
      .eq('id', playlist.id);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update playlist' });
    }

    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error removing from playlist:', error);
    res.status(500).json({ error: 'Failed to remove from playlist' });
  }
};

export const skipTrack = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    // Get current playlist
    const { data: playlist, error: playlistError } = await supabaseClient
      .from('room_playlists')
      .select('*')
      .eq('room_id', roomId)
      .single();

    if (playlistError) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Play next track
    const updatedPlaylist = await playNext(playlist);

    // Update playlist in database
    const { error: updateError } = await supabaseClient
      .from('room_playlists')
      .update(updatedPlaylist)
      .eq('room_id', roomId);

    if (updateError) {
      throw updateError;
    }

    res.status(200).json(updatedPlaylist);
  } catch (error) {
    console.error('Skip track error:', error);
    res.status(500).json({ error: 'Failed to skip track' });
  }
};

// Demo music track data
const DEMO_TRACKS = [
  {
    id: 'demo-track-1',
    title: 'Demo Music Track',
    artist: 'CodeCollab',
    cover: '/static/music/demo-cover.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 180, // 3 minutes
  },
  {
    id: 'demo-track-2',
    title: 'Coding Session Lo-Fi',
    artist: 'Dev Music',
    cover: 'https://via.placeholder.com/200?text=Lo-Fi',
    audioUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    duration: 240, // 4 minutes
  },
  {
    id: 'demo-track-3',
    title: 'Focus Flow',
    artist: 'Productivity Beats',
    cover: 'https://via.placeholder.com/200?text=Focus',
    audioUrl: 'https://www.youtube.com/watch?v=n61ULEU7CO0',
    duration: 300, // 5 minutes
  },
  {
    id: 'demo-track-4',
    title: 'Deep Coding Trance',
    artist: 'Algorithm Sounds',
    cover: 'https://via.placeholder.com/200?text=Trance',
    audioUrl: 'https://www.youtube.com/watch?v=1ZYbU82GVz4',
    duration: 360, // 6 minutes
  },
  {
    id: 'demo-track-5',
    title: 'Ambient Programming',
    artist: 'Binary Beats',
    cover: 'https://via.placeholder.com/200?text=Ambient',
    audioUrl: 'https://www.youtube.com/watch?v=sjkrrmBnpGE',
    duration: 210, // 3.5 minutes
  }
];

/**
 * Get all available music tracks
 */
export const getMusicTracks = async (req: Request, res: Response) => {
  try {
    // For now, just return the demo tracks
    // In a real app, you would fetch this from a database
    res.json({ tracks: DEMO_TRACKS });
  } catch (error) {
    console.error('Error getting music tracks:', error);
    res.status(500).json({ error: 'Failed to fetch music tracks' });
  }
};

/**
 * Add a new music track
 */
export const addMusicTrack = async (req: Request, res: Response) => {
  try {
    // In a real app, you would validate the request and save to a database
    // For now, just return success
    res.status(201).json({ message: 'Track added successfully' });
  } catch (error) {
    console.error('Error adding music track:', error);
    res.status(500).json({ error: 'Failed to add music track' });
  }
};

/**
 * Get all available demo tracks
 */
export const getTracks = async (req: Request, res: Response) => {
  try {
    // Get demo tracks from music directory
    const tracks = [
      {
        id: 'demo-track-1',
        title: 'Lofi Study Beat',
        artist: 'CodeCollab',
        cover: `${req.protocol}://${req.get('host')}/music/demo-cover.jpg`,
        duration: 180,
      },
      {
        id: 'demo-track-2',
        title: 'Ambient Coding',
        artist: 'Dev Music',
        cover: `${req.protocol}://${req.get('host')}/music/demo-cover.jpg`,
        duration: 240,
      },
      {
        id: 'david-guetta-lovers',
        title: 'David Guetta - Lovers on the Sun (Acoustic Cover)',
        artist: 'Acoustic Covers',
        cover: `${req.protocol}://${req.get('host')}/music/demo-cover.jpg`,
        duration: 169,
        audioUrl: `${req.protocol}://${req.get('host')}/music/David_Guetta_Lovers_on_the_Sun_Acoustic_Cover.mp3`,
      }
    ];

    res.json({ tracks });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
};

/**
 * Stream a track by ID
 */
export const streamTrack = async (req: Request, res: Response) => {
  try {
    const trackId = req.params.trackId;

    // Check if this is a YouTube ID
    if (trackId && ytdl.validateID(trackId)) {
      // Stream from YouTube
      const info = await ytdl.getInfo(trackId);
      const format = ytdl.chooseFormat(info.formats, { quality: 'lowestaudio' });
      
      if (!format) {
        return res.status(404).json({ error: 'No audio format available for this video' });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Transfer-Encoding', 'chunked');
      
      // Stream the audio
      ytdl(trackId, { format }).pipe(res);
      return;
    }
    
    // Check if this is one of our demo tracks
    if (trackId === 'demo-track-1' || trackId === 'demo-track-2') {
      const filePath = path.join(__dirname, '../../public/music/demo-track.mp3');
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Track not found' });
      }
      
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
      
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, {start, end});
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg',
        });
        
        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'audio/mpeg',
        });
        fs.createReadStream(filePath).pipe(res);
      }
      return;
    }
    
    // Check if this is our custom track
    if (trackId === 'david-guetta-lovers') {
      const filePath = path.join(__dirname, '../../public/music/David_Guetta_Lovers_on_the_Sun_Acoustic_Cover.mp3');
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Track not found' });
      }
      
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
      
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, {start, end});
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg',
        });
        
        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'audio/mpeg',
        });
        fs.createReadStream(filePath).pipe(res);
      }
      return;
    }
    
    // If we get here, the track wasn't found
    res.status(404).json({ error: 'Track not found' });
  } catch (error) {
    console.error('Error streaming track:', error);
    res.status(500).json({ error: 'Failed to stream track' });
  }
};

/**
 * Search YouTube for music
 */
export const searchYouTubeMusic = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Use YouTube API for search if API key is available
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: 10,
        q: `${query} music audio`,
        type: 'video',
        videoCategoryId: '10', // Music category
        key: apiKey,
      },
    });

    // Extract relevant data and ensure proper typing with type assertion
    const data = response.data as {
      items: Array<{
        id: { videoId: string };
        snippet: {
          title: string;
          channelTitle: string;
          thumbnails: {
            default: { url: string; width: number; height: number };
          };
        };
      }>;
    };
    
    const items = data.items.map((item) => ({
      ...item,
      id: {
        ...item.id,
        videoId: item.id.videoId,
      },
      snippet: {
        ...item.snippet,
        title: item.snippet.title.replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'"),
      },
    }));

    res.json({ items });
  } catch (error) {
    console.error('Error searching YouTube:', error);
    
    // Provide fallback results for demo
    const fallbackResults = {
      items: [
        {
          id: { videoId: 'demo-fallback-1' },
          snippet: {
            title: 'Lo-Fi Beats for Coding',
            channelTitle: 'Code Tunes',
            thumbnails: {
              default: {
                url: 'https://via.placeholder.com/120x90?text=Lo-Fi',
                width: 120,
                height: 90,
              },
            },
          },
        },
        {
          id: { videoId: 'demo-fallback-2' },
          snippet: {
            title: 'Ambient Work Music',
            channelTitle: 'Productivity Sounds',
            thumbnails: {
              default: {
                url: 'https://via.placeholder.com/120x90?text=Ambient',
                width: 120,
                height: 90,
              },
            },
          },
        },
      ],
    };
    
    res.json(fallbackResults);
  }
}; 
