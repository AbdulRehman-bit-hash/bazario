import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const statusConfig = {
  pending:   { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved:  { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected:  { color: 'bg-red-100 text-red-700', icon: XCircle },
  suspended: { color: 'bg-gray-100 text-gray-600', icon: XCircle },
};

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');

  const fetchVendors = () => {
    setLoading(true);
    api.get(`/admin/vendors?status=${filter}`).then(({ data }) => setVendors(data.vendors)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchVendors(); }, [filter]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/vendors/${id}`, { status });
      setVendors((prev) => prev.filter((v) => v._id !== id));
      toast.success(`Vendor ${status}`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const filtered = vendors.filter((v) =>
    !search || v.shopName?.toLowerCase().includes(search.toLowerCase()) || v.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Vendor Management</h1>
        <p className="text-gray-500 text-sm">Review and manage vendor applications</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {['pending','approved','rejected','suspended'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors..." className="input-field pl-9 text-sm w-56" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>No {filter} vendors found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Shop</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Applied</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((v) => {
                const cfg = statusConfig[v.status] || statusConfig.pending;
                const StatusIcon = cfg.icon;
                return (
                  <tr key={v._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {v.logo?.url ? (
                          <img src={v.logo.url} alt={v.shopName} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center font-bold text-primary-600">
                            {v.shopName?.[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{v.shopName}</p>
                          <p className="text-xs text-gray-400">{v.address?.city || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{v.user?.name}</p>
                      <p className="text-xs text-gray-400">{v.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{v.category}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${cfg.color} flex items-center gap-1 w-fit`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {v.status !== 'approved' && (
                          <button onClick={() => handleStatusChange(v._id, 'approved')}
                            className="bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        {v.status !== 'rejected' && v.status !== 'suspended' && (
                          <button onClick={() => handleStatusChange(v._id, 'rejected')}
                            className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}
                        {v.status === 'approved' && (
                          <button onClick={() => handleStatusChange(v._id, 'suspended')}
                            className="bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition">
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
