import express from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import { executeCodeHandler, enhanceCode } from '../controllers/code.controller';

const router = express.Router();

// Execute code
router.post('/execute', authenticateUser, executeCodeHandler);

// Routes for code enhancement
router.post('/enhance', authenticateUser, enhanceCode);

export default router; 
