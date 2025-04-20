import express from 'express';
import { searchYouTube } from '../controllers/youtube.controller';
// import { authenticateUser } from '../middleware/auth.middleware';

const router = express.Router();

// Routes for YouTube API - removed authentication to allow guest users to search
router.get('/search', searchYouTube);

export default router; 
