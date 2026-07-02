import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';

// @desc    Get all products (with filters, search, pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search, category, vendor, minPrice, maxPrice,
    sort = '-createdAt', page = 1, limit = 12,
    featured, inStock,
  } = req.query;

  const query = { isActive: true };

  if (search) {
    query.$text = { $search: search };
  }
  if (category) query.category = category;
  if (vendor) query.vendor = vendor;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (featured === 'true') query.isFeatured = true;
  if (inStock === 'true') query.stock = { $gt: 0 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate('vendor', 'shopName slug logo ratings user')
    .populate('category', 'name slug')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get single product by SLUG (used for product detail pages, SEO-friendly URLs)
// @route   GET /api/products/:slug
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('vendor', 'shopName slug logo ratings isVerified address user')
    .populate('category', 'name slug');

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
});

// @desc    Get single product by MongoDB _id (used by the wishlist, which
//          stores raw product IDs rather than slugs)
// @route   GET /api/products/id/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true })
    .populate('vendor', 'shopName slug logo ratings isVerified address user')
    .populate('category', 'name slug');

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
});

// @desc    Create product (vendor only)
// @route   POST /api/products
// @access  Private (vendor)
export const createProduct = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id, status: 'approved' });
  if (!vendor) {
    return res.status(403).json({ message: 'You must have an approved vendor account' });
  }

  const product = await Product.create({ ...req.body, vendor: vendor._id });
  res.status(201).json(product);
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (vendor - own products)
export const updateProduct = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  const product = await Product.findOne({ _id: req.params.id, vendor: vendor._id });

  if (!product) {
    return res.status(404).json({ message: 'Product not found or unauthorized' });
  }

  Object.assign(product, req.body);
  await product.save();
  res.json(product);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (vendor - own products)
export const deleteProduct = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  const product = await Product.findOneAndDelete({ _id: req.params.id, vendor: vendor._id });

  if (!product) {
    return res.status(404).json({ message: 'Product not found or unauthorized' });
  }

  res.json({ message: 'Product deleted successfully' });
});

// @desc    Get vendor's own products
// @route   GET /api/products/my
// @access  Private (vendor)
export const getMyProducts = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

  const { page = 1, limit = 10, search } = req.query;
  const query = { vendor: vendor._id };
  if (search) query.$text = { $search: search };

  const skip = (page - 1) * limit;
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  res.json({ products, total, pages: Math.ceil(total / limit) });
});
