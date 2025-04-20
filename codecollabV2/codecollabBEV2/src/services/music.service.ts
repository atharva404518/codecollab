import axios from 'axios';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  youtube_id: string;
  duration: number;
}

export interface RoomPlaylist {
  room_id: string;
  current_track_id: string | null;
  is_playing: boolean;
  tracks: string[];
}

// YouTube API response interfaces
interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: {
        default: {
          url: string;
        };
      };
    };
  }>;
}

interface YouTubeVideoResponse {
  items: Array<{
    contentDetails: {
      duration: string;
    };
  }>;
}

export async function searchMusic(query: string): Promise<MusicTrack[]> {
  try {
    // Using YouTube API for search
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: 'snippet',
        maxResults: 10,
        q: query,
        type: 'video',
        key: API_KEY,
      },
    });

    const data = response.data as YouTubeSearchResponse;
    if (!data || !data.items) {
      return [];
    }

    return data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      cover_url: item.snippet.thumbnails.default.url,
      youtube_id: item.id.videoId,
      duration: 0, // Duration needs to be fetched separately
    }));
  } catch (error) {
    console.error('Error searching music:', error);
    return [];
  }
}

export async function getRecommendations(trackId: string): Promise<MusicTrack[]> {
  try {
    // Using YouTube API for recommendations
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: 'snippet',
        relatedToVideoId: trackId,
        type: 'video',
        maxResults: 5,
        key: API_KEY,
      },
    });

    const data = response.data as YouTubeSearchResponse;
    if (!data || !data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      cover_url: item.snippet.thumbnails.default.url,
      youtube_id: item.id.videoId,
      duration: 0, // Duration needs to be fetched separately
    }));
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

export async function getVideoDuration(videoId: string): Promise<number> {
  try {
    // Using YouTube API to get video details
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'contentDetails',
        id: videoId,
        key: API_KEY,
      },
    });

    const data = response.data as YouTubeVideoResponse;
    if (!data.items || data.items.length === 0) {
      return 0;
    }

    // Parse duration from ISO 8601 format
    const duration = data.items[0].contentDetails.duration;
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    let seconds = 0;
    if (match) {
      if (match[1]) seconds += parseInt(match[1].replace('H', '')) * 3600;
      if (match[2]) seconds += parseInt(match[2].replace('M', '')) * 60;
      if (match[3]) seconds += parseInt(match[3].replace('S', ''));
    }

    return seconds;
  } catch (error) {
    console.error('Error getting video duration:', error);
    return 0;
  }
}

export function createRoomPlaylist(roomId: string): RoomPlaylist {
  return {
    room_id: roomId,
    current_track_id: null,
    is_playing: false,
    tracks: [],
  };
}

export async function addToQueue(playlist: RoomPlaylist, track: MusicTrack): Promise<RoomPlaylist> {
  return {
    ...playlist,
    tracks: [...playlist.tracks, track.id],
  };
}

export async function removeFromQueue(playlist: RoomPlaylist, trackId: string): Promise<RoomPlaylist> {
  return {
    ...playlist,
    tracks: playlist.tracks.filter(id => id !== trackId),
    current_track_id: playlist.current_track_id === trackId ? null : playlist.current_track_id,
  };
}

export async function playNext(playlist: RoomPlaylist): Promise<RoomPlaylist> {
  // If there are no tracks in the queue, just return the playlist as is
  if (playlist.tracks.length === 0) {
    return {
      ...playlist,
      current_track_id: null,
      is_playing: false,
    };
  }
  
  // Get the first track from the queue
  const nextTrackId = playlist.tracks[0];
  
  // Return updated playlist with the next track playing and removed from queue
  return {
    ...playlist,
    current_track_id: nextTrackId,
    is_playing: true,
    tracks: playlist.tracks.slice(1), // Remove the first track from the queue
  };
} 
