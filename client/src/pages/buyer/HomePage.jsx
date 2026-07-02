import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../../store/slices/productsSlice.js';
import ProductCard from '../../components/common/ProductCard.jsx';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

const features = [
  { icon: Truck,       title: 'Free Shipping',   desc: 'On orders over $100' },
  { icon: ShieldCheck, title: 'Secure Payments',  desc: 'Your data is safe' },
  { icon: RotateCcw,   title: 'Easy Returns',     desc: '30-day return policy' },
  { icon: Headphones,  title: '24/7 Support',     desc: 'Always here to help' },
];

const categories = [
  {
    label: 'Food',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    color: 'from-orange-400/60',
    slug: 'food',
  },
  {
    label: 'Fashion',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
    color: 'from-pink-400/60',
    slug: 'fashion',
  },
  {
    label: 'Tech',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
    color: 'from-blue-500/60',
    slug: 'electronics',
  },
  {
    label: 'Home',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    color: 'from-emerald-400/60',
    slug: 'home',
  },
];

// ─── Rich mock products ────────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  // Electronics
  {
    _id: 'm1',
    name: 'Sony WH-1000XM5 Noise Cancelling Headphones',
    slug: 'sony-wh-1000xm5',
    price: 399.99,
    discountPrice: 279.99,
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' }],
    ratings: { average: 4.8, count: 2341 },
    stock: 18,
    vendor: { shopName: 'TechZone', slug: 'techzone' },
  },
  {
    _id: 'm2',
    name: 'Apple iPad Pro 11" M4 — 256GB Space Grey',
    slug: 'apple-ipad-pro-m4',
    price: 1099.00,
    discountPrice: 999.00,
    images: [{ url: 'https://qmart.pk/wp-content/uploads/2024/12/Apple-iPad-Pro-M4-Chip-11-Qmart-2-removebg-preview.png' }],
    ratings: { average: 4.9, count: 874 },
    stock: 7,
    vendor: { shopName: 'GadgetHub', slug: 'gadgethub' },
  },
  {
    _id: 'm3',
    name: 'Logitech MX Master 3S Wireless Mouse',
    slug: 'logitech-mx-master-3s',
    price: 99.99,
    discountPrice: 74.99,
    images: [{ url: 'https://cdn.mos.cms.futurecdn.net/h5fUesahSt6c2BkQGp7GBf.jpg' }],
    ratings: { average: 4.7, count: 5120 },
    stock: 45,
    vendor: { shopName: 'TechZone', slug: 'techzone' },
  },
  // Fashion
  {
    _id: 'm4',
    name: 'Premium Leather Chelsea Boots — Men\'s',
    slug: 'leather-chelsea-boots',
    price: 189.00,
    discountPrice: 129.00,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' }],
    ratings: { average: 4.6, count: 938 },
    stock: 22,
    vendor: { shopName: 'Urban Threads', slug: 'urban-threads' },
  },
  {
    _id: 'm5',
    name: 'Linen Summer Dress — Women\'s Boho Collection',
    slug: 'linen-summer-dress',
    price: 79.99,
    discountPrice: 54.99,
    images: [{ url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80' }],
    ratings: { average: 4.5, count: 1204 },
    stock: 33,
    vendor: { shopName: 'Bloom Boutique', slug: 'bloom-boutique' },
  },
  // Home & Living
  {
    _id: 'm6',
    name: 'Handcrafted Walnut Serving Board with Handle',
    slug: 'walnut-serving-board',
    price: 64.00,
    discountPrice: null,
    images: [{ url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80' }],
    ratings: { average: 4.9, count: 432 },
    stock: 14,
    vendor: { shopName: 'Timber & Co.', slug: 'timber-co' },
  },
  {
    _id: 'm7',
    name: 'Ceramic Pour-Over Coffee Set — Matte Black',
    slug: 'ceramic-pour-over-set',
    price: 48.00,
    discountPrice: 38.00,
    images: [{ url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80' }],
    ratings: { average: 4.8, count: 763 },
    stock: 28,
    vendor: { shopName: 'Morning Ritual', slug: 'morning-ritual' },
  },
  // Food & Grocery
  {
    _id: 'm8',
    name: 'Organic Cold-Press Olive Oil — 500ml Extra Virgin',
    slug: 'organic-olive-oil',
    price: 24.99,
    discountPrice: 19.99,
    images: [{ url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80' }],
    ratings: { average: 4.7, count: 1890 },
    stock: 60,
    vendor: { shopName: 'Farm Fresh', slug: 'farm-fresh' },
  },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const { items: apiProducts, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8, sort: '-createdAt' }));
  }, [dispatch]);

  // Use API products if available, otherwise show mock data
  const displayProducts = apiProducts.length > 0 ? apiProducts : MOCK_PRODUCTS;

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-white py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase mb-4 block">
              The New Marketplace
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 leading-tight mb-6">
              Discover Products from
              <span className="text-primary-600"> Thousands</span> of Vendors
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Browse unique products from independent sellers worldwide. Find something special, support small businesses.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/become-vendor" className="btn-secondary inline-flex items-center gap-2">
                Sell on Bazario
              </Link>
            </div>
          </div>

          {/* ── Category cards with real photos ── */}
          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={`/products?search=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent`} />
                {/* label */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-white font-display font-bold text-xl drop-shadow-md">
                    {cat.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Features ───────────────────────────────────────────── */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="bg-primary-50 rounded-xl p-2.5 shrink-0">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trending Banner ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pt-12 pb-2">
        <div className="rounded-2xl overflow-hidden relative h-44 md:h-56">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80"
            alt="Sale banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-8 md:px-12">
            <div>
              <p className="text-primary-300 font-semibold text-sm uppercase tracking-widest mb-1">Limited Time</p>
              <h2 className="text-white font-display font-bold text-3xl md:text-4xl mb-3">Up to 40% Off</h2>
              <Link to="/products?sort=-sold" className="bg-white text-gray-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary-50 transition inline-flex items-center gap-2">
                Shop the Sale <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── New Arrivals ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-gray-900">New Arrivals</h2>
            <p className="text-gray-500 mt-1">Fresh products from our vendors</p>
          </div>
          <Link to="/products" className="text-primary-600 font-medium hover:underline flex items-center gap-1 text-sm">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── Featured Vendors Strip ───────────────────────────────────── */}
      <section className="bg-gray-50 py-12 px-4 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 text-center">Featured Shops</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'TechZone', tagline: 'Gadgets & Electronics', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYCdERYZQlM2UCY2vJM_3g-rZF-ww3WmlI8Q&s' },
              { name: 'Bloom Boutique', tagline: 'Women\'s Fashion', img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&q=80' },
              { name: 'Farm Fresh', tagline: 'Organic Food', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80' },
              { name: 'Timber & Co.', tagline: 'Home & Living', img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=300&q=80' },
            ].map((v) => (
              <div key={v.name} className="card overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-28 overflow-hidden">
                  <img src={v.img} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-900 text-sm">{v.name}</p>
                  <p className="text-xs text-gray-500">{v.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="bg-primary-600 py-16 px-4 text-center">
        <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to Start Selling?</h2>
        <p className="text-primary-100 text-lg mb-8">Join thousands of vendors and reach millions of buyers</p>
        <Link to="/become-vendor" className="bg-white text-primary-600 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition inline-block">
          Open Your Shop Today
        </Link>
      </section>
    </div>
  );
}
