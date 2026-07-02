import express from 'express';
import {
  createOrder, getMyOrders, getVendorOrders,
  updateVendorOrderStatus, getOrder,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('buyer', 'vendor'), createOrder);
router.get('/my', protect, authorize('buyer', 'vendor'), getMyOrders);
router.get('/vendor', protect, authorize('vendor'), getVendorOrders);
router.put('/:id/vendor-status', protect, authorize('vendor'), updateVendorOrderStatus);
router.get('/:id', protect, getOrder);

export default router;
