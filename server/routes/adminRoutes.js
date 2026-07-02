import express from 'express';
import {
  getPlatformStats, getAllVendors, updateVendorStatus,
  getAllUsers, toggleUserStatus, getAllOrders,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/vendors', getAllVendors);
router.put('/vendors/:id', updateVendorStatus);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/orders', getAllOrders);

export default router;
