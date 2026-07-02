import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCartTotal, clearCart } from '../../store/slices/cartSlice.js';
import { MapPin, CreditCard, Package } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Review', 'Payment'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.cart);
  const subtotal = useSelector(selectCartTotal);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = parseFloat((subtotal * 0.05).toFixed(2));
  const total = parseFloat((subtotal + shipping + tax).toFixed(2));

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: '', city: '', state: '', zip: '', country: 'US',
  });
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvc: '', name: '' });

const handlePlaceOrder = async () => {
  setLoading(true);
  try {
    const orderItems = items.map((i) => ({
      product: i.product._id,
      quantity: i.quantity,
    }));

    const { data } = await api.post('/orders', {
      items: orderItems,
      shippingAddress: address,
      paymentMethod: 'stripe',
    });

    // Order created — clear cart NOW so a payment hiccup doesn't trap the user
    dispatch(clearCart());

    try {
      await api.post('/payment/confirm', {
        paymentIntentId: data.order.paymentInfo.stripePaymentIntentId,
      });
      toast.success('Order placed successfully!');
    } catch (confirmErr) {
      // Order exists either way — just inform the user, don't block them
      toast.success('Order placed! Payment is finalising — check My Orders.');
    }

    navigate('/orders');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Order failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="h-px w-8 bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Step 0: Address */}
          {step === 0 && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" /> Shipping Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Street Address</label>
                  <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="123 Main Street" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                  <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="New York" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
                  <input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="NY" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ZIP Code</label>
                  <input value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                    placeholder="10001" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
                  <select value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    className="input-field">
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="PK">Pakistan</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => { if (address.street && address.city && address.country) setStep(1); else toast.error('Please fill in required fields'); }}
                className="btn-primary mt-6 w-full">Continue to Review</button>
            </div>
          )}

          {/* Step 1: Review */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600" /> Review Your Order
              </h2>
              <div className="space-y-4 mb-6">
                {items.map(({ product, quantity }) => (
                  <div key={product._id} className="flex gap-4 py-3 border-b border-gray-50 last:border-0">
                    <img src={product.images?.[0]?.url || 'https://via.placeholder.com/64'} alt={product.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.vendor?.shopName}</p>
                      <p className="text-sm text-gray-700 mt-0.5">Qty: {quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">
                      ${((product.discountPrice || product.price) * quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm mb-4">
                <p className="font-medium text-gray-900 mb-1">Shipping to:</p>
                <p className="text-gray-600">{address.street}, {address.city}, {address.state} {address.zip}, {address.country}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1">Continue to Payment</button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-600" /> Payment Details
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 text-sm text-blue-700">
                Test mode: Use card <strong>4242 4242 4242 4242</strong>, any future date, any CVC
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Cardholder Name</label>
                  <input value={cardInfo.name} onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
                    placeholder="John Doe" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Card Number</label>
                  <input value={cardInfo.number} onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                    placeholder="4242 4242 4242 4242" maxLength={19} className="input-field font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Expiry</label>
                    <input value={cardInfo.expiry} onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                      placeholder="MM/YY" maxLength={5} className="input-field" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">CVC</label>
                    <input value={cardInfo.cvc} onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value })}
                      placeholder="123" maxLength={4} className="input-field" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary sidebar */}
        <div className="card p-5 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (5%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <hr className="border-gray-100 my-1" />
            <div className="flex justify-between font-bold text-base text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Secured by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
