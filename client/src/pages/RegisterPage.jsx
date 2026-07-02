import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/slices/authSlice.js';
import toast from 'react-hot-toast';
import { Store } from 'lucide-react';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' });

  useEffect(() => {
    if (user) navigate('/');
  }, [user]);

  useEffect(() => {
    if (error) toast.error(error);
    return () => dispatch(clearError());
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Welcome to Bazario 🎉');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Store className="w-8 h-8 text-primary-600" />
            <span className="font-display text-3xl font-bold text-gray-900">Bazario</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Create your account</h1>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required minLength={6} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field" placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I want to...</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: 'buyer', label: '🛍️ Shop / Buy' }, { value: 'vendor', label: '🏪 Sell Products' }].map((opt) => (
                  <label key={opt.value}
                    className={`border-2 rounded-xl p-3 text-center cursor-pointer transition ${
                      form.role === opt.value ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input type="radio" name="role" value={opt.value} className="sr-only"
                      onChange={() => setForm({ ...form, role: opt.value })} />
                    <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
