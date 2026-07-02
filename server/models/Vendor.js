import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    shopName: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
      maxlength: [60, 'Shop name cannot exceed 60 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    logo: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    banner: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended', 'rejected'],
      default: 'pending',
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
    },
    phone: String,
    socialLinks: {
      website: String,
      instagram: String,
      facebook: String,
    },
    bankDetails: {
      accountName: { type: String, select: false },
      accountNumber: { type: String, select: false },
      bankName: { type: String, select: false },
    },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-generate slug from shopName
vendorSchema.pre('save', function (next) {
  if (this.isModified('shopName')) {
    this.slug = this.shopName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;
