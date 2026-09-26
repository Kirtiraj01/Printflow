import express from 'express';
import { getStationStatus, resetDemoData, updateStationConfig } from '../controllers/stationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/status', getStationStatus);
router.put('/config', requireAuth, updateStationConfig);
router.post('/reset-demo', resetDemoData);

export default router;
