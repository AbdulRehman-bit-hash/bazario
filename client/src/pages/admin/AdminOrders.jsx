import { useEffect, useState } from 'react';
import api from '../../utils/api.js';

const statusColors = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (filter) params.append('status', filter);
    api.get(`/admin/orders?${params}`).then(({ data }) => {
      setOrders(data.orders);
      setTotalPages(data.pages);
    }).finally(() => setLoading(false));
  }, [filter, page]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">All Orders</h1>
        <p className="text-gray-500 text-sm">Platform-wide order management</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {['', 'pending','confirmed','processing','shipped','delivered','cancelled'].map((s) => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition capitalize ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array(8).fill(0).map((_, i) => <div key={i} className="h-14 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Order ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Buyer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Vendors</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o) => {
                  const vendors = [...new Set(o.items?.map((i) => i.vendor?.shopName).filter(Boolean))];
                  return (
                    <tr key={o._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        #{o._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{o.buyer?.name}</p>
                        <p className="text-xs text-gray-400">{o.buyer?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {vendors.slice(0, 2).join(', ')}{vendors.length > 2 ? ` +${vendors.length - 2}` : ''}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">${o.pricing?.total?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${statusColors[o.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${o.paymentInfo?.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {o.paymentInfo?.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="text-center text-gray-400 py-10">No orders found</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-5">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 disabled:opacity-40">Prev</button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
