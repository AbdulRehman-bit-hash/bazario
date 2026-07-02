import express from 'express';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, asyncHandler(async (req, res) => {
  res.json(req.user);
}));

router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { name, avatar, addresses } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, avatar, addresses },
    { new: true, runValidators: true }
  );
  res.json(user);
}));

router.put('/wishlist/:productId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.indexOf(req.params.productId);
  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    user.wishlist.push(req.params.productId);
  }
  await user.save({ validateBeforeSave: false });
  res.json({ wishlist: user.wishlist });
}));

export default router;
