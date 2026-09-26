import express from 'express';
import { getStudentSession, updateStudentSession, topUpWallet } from '../controllers/studentController.js';
import { requireDevice } from '../middleware/requireDevice.js';

const router = express.Router();

router.use(requireDevice);
router.get('/me', getStudentSession);
router.put('/me', updateStudentSession);
router.post('/wallet/topup', topUpWallet);

export default router;
