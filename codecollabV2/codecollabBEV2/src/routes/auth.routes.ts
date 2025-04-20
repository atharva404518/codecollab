import express from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import {
  register,
  login,
  logout,
  getCurrentUser,
} from '../controllers/auth.controller';

const router = express.Router();

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Logout user
router.post('/logout', authenticateUser, logout);

// Get current user
router.get('/me', authenticateUser, getCurrentUser);

export default router; 
