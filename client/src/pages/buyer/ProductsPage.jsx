import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productsSlice.js';
import ProductCard from '../../components/common/ProductCard.jsx';
import Loader from '../../components/common/Loader.jsx';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api.js';

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, pagination, loading } = useSelector((s) => s.products);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: Number(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // THE FIX
  //
  // Problem: filters.search (and the other filter fields) were only ever
  // read from the URL ONCE, inside useState's initial value above. That
  // initial value only runs on the component's first mount. If the user
  // is already on /products and searches AGAIN from the navbar, React
  // Router updates the URL but does NOT remount this component (it's
  // the same route, just new query params) — so that useState initial
  // value never re-runs, and `filters` stays stuck on whatever was
  // searched first.
  //
  // Fix: explicitly watch searchParams with its own useEffect, and
  // whenever the URL's search/category/etc actually change, copy those
  // fresh values into `filters` state. This keeps filters in sync with
  // the URL on EVERY navigation, not just the first one.
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || prev.category,
      minPrice: searchParams.get('minPrice') || prev.minPrice,
      maxPrice: searchParams.get('maxPrice') || prev.maxPrice,
      sort: searchParams.get('sort') || prev.sort,
      page: Number(searchParams.get('page')) || 1,
    }));
  }, [searchParams]);

  useEffect(() => {
    dispatch(fetchProducts({ ...filters, limit: 12 }));
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className="hidden md:block w-56 shrink-0 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Filter className="w-4 h-4" />Filters</h3>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
            <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} className="input-field text-sm">
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="input-field text-sm" />
              <input type="number" placeholder="Max" value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="input-field text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
            <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} className="input-field text-sm">
              <option value="-createdAt">Newest</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-ratings.average">Top Rated</option>
              <option value="-sold">Best Selling</option>
            </select>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {filters.search && (
            <p className="mb-4 text-gray-600">Results for: <strong>"{filters.search}"</strong></p>
          )}
          {loading ? (
            <Loader variant="section" text="Loading products…" />
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No products found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>

              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                  <button disabled={filters.page <= 1} onClick={() => updateFilter('page', filters.page - 1)}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">Page {filters.page} of {pagination.pages}</span>
                  <button disabled={filters.page >= pagination.pages} onClick={() => updateFilter('page', filters.page + 1)}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
