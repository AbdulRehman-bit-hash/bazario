import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
    },
    category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Category',
  default: null,
    required: false,  
},
    subcategory: String,
    images: [
      {
        url: { type: String, required: true },
        public_id: String,
        alt: String,
      },
    ],
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sold: { type: Number, default: 0 },
    tags: [String],
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    shippingInfo: {
      weight: Number,        // in grams
      freeShipping: { type: Boolean, default: false },
      shippingCost: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Auto-generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    const base = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    this.slug = `${base}-${this._id.toString().slice(-6)}`;
  }
  next();
});

// Text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ vendor: 1, isActive: 1 });
productSchema.index({ category: 1, price: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
