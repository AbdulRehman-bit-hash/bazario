import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 100 },
    comment: { type: String, required: true, maxlength: 1000 },
    images: [{ url: String, public_id: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One review per buyer per product
reviewSchema.index({ product: 1, buyer: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
