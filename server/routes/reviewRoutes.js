import express from 'express';
import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get reviews for a product
router.get('/', asyncHandler(async (req, res) => {
  const { product } = req.query;
  if (!product) return res.status(400).json({ message: 'product query required' });
  const reviews = await Review.find({ product })
    .populate('buyer', 'name avatar')
    .sort('-createdAt')
    .limit(50);
  res.json(reviews);
}));

// Create review
router.post('/', protect, authorize('buyer'), asyncHandler(async (req, res) => {
  const { product: productId, rating, title, comment } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const existing = await Review.findOne({ product: productId, buyer: req.user._id });
  if (existing) return res.status(400).json({ message: 'You already reviewed this product' });

  const review = await Review.create({
    product: productId,
    buyer: req.user._id,
    vendor: product.vendor,
    rating, title, comment,
  });

  // Update product rating average
  const allReviews = await Review.find({ product: productId });
  const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
  await Product.findByIdAndUpdate(productId, {
    'ratings.average': parseFloat(avg.toFixed(1)),
    'ratings.count': allReviews.length,
  });

  // Update vendor rating
  const vendorReviews = await Review.find({ vendor: product.vendor });
  const vendorAvg = vendorReviews.reduce((s, r) => s + r.rating, 0) / vendorReviews.length;
  await Vendor.findByIdAndUpdate(product.vendor, {
    'ratings.average': parseFloat(vendorAvg.toFixed(1)),
    'ratings.count': vendorReviews.length,
  });

  await review.populate('buyer', 'name avatar');
  res.status(201).json(review);
}));

export default router;
