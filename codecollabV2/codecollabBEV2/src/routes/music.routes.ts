import express from 'express';
import { authenticateUser, checkRoomAccess } from '../middleware/auth.middleware';
import {
  searchMusicHandler,
  addToPlaylist,
  removeFromPlaylist,
  skipTrack,
  getMusicTracks,
  addMusicTrack,
  getTracks,
  streamTrack,
  searchYouTubeMusic,
} from '../controllers/music.controller';

const router = express.Router();

// Search for music
router.get('/search', searchMusicHandler);

// Playlist management
router.post('/rooms/:roomId/playlist', authenticateUser, checkRoomAccess, addToPlaylist);
router.delete('/rooms/:roomId/playlist/:trackId', authenticateUser, checkRoomAccess, removeFromPlaylist);
router.post('/rooms/:roomId/skip', authenticateUser, checkRoomAccess, skipTrack);

// Routes for music
router.post('/tracks', addMusicTrack);

// Get demo tracks
router.get('/tracks', getTracks);

// Stream a track by ID
router.get('/stream/:trackId', streamTrack);

// Search YouTube for music
router.get('/youtube/search', searchYouTubeMusic);

export default router; 
