import express from 'express';
import { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  streamOrderFile, 
  getAllOrders, 
  updateOrderStatus 
} from '../controllers/orderController.js';
import { requireDevice } from '../middleware/requireDevice.js';
import { requireAuth } from '../middleware/auth.js';
import { deviceOrAuth } from '../middleware/deviceOrAuth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Student endpoints
router.post('/', requireDevice, upload.single('file'), createOrder);
router.get('/my-orders', requireDevice, getMyOrders);

// Admin endpoints
router.get('/', requireAuth, getAllOrders);
router.patch('/:id/status', requireAuth, updateOrderStatus);

// Shared endpoints (owning device or admin)
router.get('/:id', deviceOrAuth, getOrderById);
router.get('/:id/file', deviceOrAuth, streamOrderFile);

export default router;
