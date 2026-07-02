import asyncHandler from 'express-async-handler';
import Vendor from '../models/Vendor.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Register as vendor
// @route   POST /api/vendors/register
// @access  Private (buyer → vendor upgrade)
export const registerVendor = asyncHandler(async (req, res) => {
  const existingVendor = await Vendor.findOne({ user: req.user._id });
  if (existingVendor) {
    return res.status(400).json({ message: 'Vendor profile already exists' });
  }

  const vendor = await Vendor.create({ ...req.body, user: req.user._id });

  // Update user role
  await User.findByIdAndUpdate(req.user._id, { role: 'vendor' });

  res.status(201).json(vendor);
});

// @desc    Get vendor profile (public)
// @route   GET /api/vendors/:slug
// @access  Public
export const getVendorBySlug = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ slug: req.params.slug, status: 'approved' })
    .populate('user', 'name avatar');

  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

  const products = await Product.find({ vendor: vendor._id, isActive: true })
    .populate('category', 'name')
    .sort('-createdAt')
    .limit(20);

  res.json({ vendor, products });
});

// @desc    Get my vendor profile
// @route   GET /api/vendors/me
// @access  Private (vendor)
export const getMyVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });
  res.json(vendor);
});

// @desc    Update vendor profile
// @route   PUT /api/vendors/me
// @access  Private (vendor)
export const updateVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOneAndUpdate(
    { user: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });
  res.json(vendor);
});

// @desc    Get vendor dashboard stats
// @route   GET /api/vendors/dashboard
// @access  Private (vendor)
export const getVendorDashboard = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

  const [totalProducts, totalOrders, recentOrders] = await Promise.all([
    Product.countDocuments({ vendor: vendor._id }),
    Order.countDocuments({ 'items.vendor': vendor._id }),
    Order.find({ 'items.vendor': vendor._id })
      .populate('buyer', 'name email')
      .sort('-createdAt')
      .limit(5),
  ]);

  // Revenue by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const revenueData = await Order.aggregate([
    {
      $match: {
        'items.vendor': vendor._id,
        'paymentInfo.status': 'paid',
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    { $unwind: '$items' },
    { $match: { 'items.vendor': vendor._id } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    stats: {
      totalProducts,
      totalOrders,
      totalRevenue: vendor.totalRevenue,
      totalSales: vendor.totalSales,
      averageRating: vendor.ratings.average,
    },
    recentOrders,
    revenueData,
  });
});
