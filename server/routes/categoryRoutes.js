import express from 'express';
import Category from '../models/Category.js';
import asyncHandler from 'express-async-handler';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find();

  console.log("DB RESULT:", categories);

  res.json(categories);
}));

router.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
}));

export default router;
