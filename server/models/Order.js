import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name: String,
  image: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      zip: String,
      country: { type: String, required: true },
    },
    paymentInfo: {
      method: { type: String, enum: ['stripe', 'cod'], default: 'stripe' },
      stripePaymentIntentId: String,
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      paidAt: Date,
    },
    pricing: {
      subtotal: { type: Number, required: true },
      shippingCost: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    // Per-vendor status (since items may be from multiple vendors)
    vendorStatuses: [
      {
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
        status: {
          type: String,
          enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
          default: 'pending',
        },
        trackingNumber: String,
        updatedAt: Date,
      },
    ],
    notes: String,
    deliveredAt: Date,
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
