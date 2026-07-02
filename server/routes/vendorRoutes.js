import express from 'express';
import {
  registerVendor, getVendorBySlug, getMyVendorProfile,
  updateVendorProfile, getVendorDashboard,
} from '../controllers/vendorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', protect, registerVendor);
router.get('/me', protect, authorize('vendor'), getMyVendorProfile);
router.get('/dashboard', protect, authorize('vendor'), getVendorDashboard);
router.put('/me', protect, authorize('vendor'), updateVendorProfile);
router.get('/:slug', getVendorBySlug);

export default router;
