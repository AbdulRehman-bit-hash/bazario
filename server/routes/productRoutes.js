import express from 'express';
import {
  getProducts, getProduct, getProductById, createProduct,
  updateProduct, deleteProduct, getMyProducts,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/my', protect, authorize('vendor'), getMyProducts);

// ── NEW: lookup by MongoDB _id specifically (used by the wishlist,
// which stores raw product IDs, not slugs). Must come BEFORE the
// /:slug route below, otherwise Express would treat "id/123..." as
// a slug lookup instead. ──
router.get('/id/:id', getProductById);

router.get('/:slug', getProduct);
router.post('/', protect, authorize('vendor'), createProduct);
router.put('/:id', protect, authorize('vendor'), updateProduct);
router.delete('/:id', protect, authorize('vendor'), deleteProduct);

export default router;
