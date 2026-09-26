import express from 'express';
import { loginAdmin, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/me', requireAuth, getMe);

export default router;
