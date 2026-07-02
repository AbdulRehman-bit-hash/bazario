import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';

// ── Lazily create the Stripe client ─────────────────────────────────────
// We do NOT call `new Stripe(...)` at the top of this file, because in
// ES modules all `import` statements (and any top-level code in imported
// files) are resolved BEFORE `dotenv.config()` finishes running in
// server.js. That race condition meant process.env.STRIPE_SECRET_KEY was
// still undefined the moment this file loaded, even though it was
// correctly loaded a few milliseconds later. Creating the client inside
// a function guarantees it only runs at request time, long after the
// environment variables are guaranteed to be loaded.
let stripeClient = null;
function getStripe() {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

// @desc    Create order + Stripe payment intent
// @route   POST /api/orders
// @access  Private (buyer)
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'stripe', notes } = req.body;

  if (!items?.length) {
    return res.status(400).json({ message: 'No items in order' });
  }

  // Validate products and calculate pricing
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product).populate('vendor');
    if (!product || !product.isActive) {
      return res.status(400).json({ message: `Product ${item.product} not available` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for "${product.name}"` });
    }

    const price = product.discountPrice || product.price;
    subtotal += price * item.quantity;

    orderItems.push({
      product: product._id,
      vendor: product.vendor._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price,
      quantity: item.quantity,
    });
  }

  const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% tax
  const shippingCost = subtotal > 100 ? 0 : 9.99;
  const total = parseFloat((subtotal + tax + shippingCost).toFixed(2));

  // Get unique vendors for vendorStatuses
  const uniqueVendors = [...new Set(orderItems.map((i) => i.vendor.toString()))];

  const order = await Order.create({
    buyer: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentInfo: { method: paymentMethod },
    pricing: { subtotal, shippingCost, tax, total },
    notes,
    vendorStatuses: uniqueVendors.map((v) => ({ vendor: v, status: 'pending' })),
  });

  // Create Stripe payment intent
  if (paymentMethod === 'stripe') {
    const stripe = getStripe();   // ← created here, at request time

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // in cents
      currency: 'usd',
      metadata: { orderId: order._id.toString(), userId: req.user._id.toString() },
    });

    order.paymentInfo.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    // Deduct stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    return res.status(201).json({
      order,
      clientSecret: paymentIntent.client_secret,
    });
  }

  res.status(201).json({ order });
});

// @desc    Get my orders (buyer)
// @route   GET /api/orders/my
// @access  Private (buyer)
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { buyer: req.user._id };
  if (status) query.orderStatus = status;

  const skip = (page - 1) * limit;
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('items.product', 'name images slug')
    .populate('items.vendor', 'shopName')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  res.json({ orders, total, pages: Math.ceil(total / limit) });
});

// @desc    Get vendor orders
// @route   GET /api/orders/vendor
// @access  Private (vendor)
export const getVendorOrders = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

  const { page = 1, limit = 10, status } = req.query;
  const query = { 'items.vendor': vendor._id };
  if (status) query['vendorStatuses'] = { $elemMatch: { vendor: vendor._id, status } };

  const skip = (page - 1) * limit;
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('buyer', 'name email')
    .populate('items.product', 'name images')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  res.json({ orders, total, pages: Math.ceil(total / limit) });
});

// @desc    Update vendor order status
// @route   PUT /api/orders/:id/vendor-status
// @access  Private (vendor)
export const updateVendorOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body;
  const vendor = await Vendor.findOne({ user: req.user._id });
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ message: 'Order not found' });

  const vendorStatus = order.vendorStatuses.find(
    (vs) => vs.vendor.toString() === vendor._id.toString()
  );

  if (!vendorStatus) return res.status(403).json({ message: 'Not authorized' });

  vendorStatus.status = status;
  if (trackingNumber) vendorStatus.trackingNumber = trackingNumber;
  vendorStatus.updatedAt = new Date();

  await order.save();
  res.json({ message: 'Order status updated', order });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'name email')
    .populate('items.product', 'name images slug')
    .populate('items.vendor', 'shopName slug');

  if (!order) return res.status(404).json({ message: 'Order not found' });

  // Allow buyer, involved vendor, or admin
  const isOwner = order.buyer._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json(order);
});
