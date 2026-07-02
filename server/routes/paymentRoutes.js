import express from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Lazily create the Stripe client (same fix as orderController.js) ──
// See orderController.js for the full explanation of why this can't be
// created at the top of the file.
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

// Confirm payment after Stripe redirects
router.post('/confirm', protect, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      await Order.findOneAndUpdate(
        { 'paymentInfo.stripePaymentIntentId': paymentIntentId },
        {
          'paymentInfo.status': 'paid',
          'paymentInfo.paidAt': new Date(),
          orderStatus: 'confirmed',
        }
      );
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, status: paymentIntent.status });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
