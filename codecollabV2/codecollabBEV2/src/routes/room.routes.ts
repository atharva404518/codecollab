import express from 'express';
import { authenticateUser, checkRoomAccess } from '../middleware/auth.middleware';
import {
  createRoom,
  joinRoom,
  getRoom,
  updateRoom,
  joinRoomByCode
} from '../controllers/room.controller';

const router = express.Router();

// Create a new room
router.post('/', authenticateUser, createRoom);

// Join a room
router.post('/:roomId/join', authenticateUser, joinRoom);

// Get room details
router.get('/:roomId', authenticateUser, checkRoomAccess, getRoom);

// Update room
router.put('/:roomId', authenticateUser, checkRoomAccess, updateRoom);

router.post('/join-by-code', joinRoomByCode);

export default router; 
