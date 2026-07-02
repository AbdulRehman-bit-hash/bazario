import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private (admin)
export const getPlatformStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalVendors, totalProducts, totalOrders,
    pendingVendors, recentOrders,
  ] = await Promise.all([
    User.countDocuments(),
    Vendor.countDocuments({ status: 'approved' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Vendor.countDocuments({ status: 'pending' }),
    Order.find().sort('-createdAt').limit(10)
      .populate('buyer', 'name email')
      .populate('items.vendor', 'shopName'),
  ]);

  // Total revenue from paid orders
  const revenueAgg = await Order.aggregate([
    { $match: { 'paymentInfo.status': 'paid' } },
    { $group: { _id: null, total: { $sum: '$pricing.total' } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  res.json({ totalUsers, totalVendors, totalProducts, totalOrders, pendingVendors, totalRevenue, recentOrders });
});

// @desc    Get all vendors (with filter)
// @route   GET /api/admin/vendors
// @access  Private (admin)
export const getAllVendors = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const total = await Vendor.countDocuments(query);
  const vendors = await Vendor.find(query)
    .populate('user', 'name email createdAt')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  res.json({ vendors, total, pages: Math.ceil(total / limit) });
});

// @desc    Approve or reject vendor
// @route   PUT /api/admin/vendors/:id
// @access  Private (admin)
export const updateVendorStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('user', 'name email');

  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

  res.json({ message: `Vendor ${status}`, vendor });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role } = req.query;
  const query = {};
  if (role) query.role = role;

  const skip = (page - 1) * limit;
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  res.json({ users, total, pages: Math.ceil(total / limit) });
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
// @access  Private (admin)
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (admin)
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = {};
  if (status) query.orderStatus = status;

  const skip = (page - 1) * limit;
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('buyer', 'name email')
    .populate('items.vendor', 'shopName')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  res.json({ orders, total, pages: Math.ceil(total / limit) });
});
