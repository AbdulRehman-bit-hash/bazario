import { useEffect, useState } from 'react';
import { Search, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const roleColors = {
  buyer:  'bg-blue-100 text-blue-700',
  vendor: 'bg-purple-100 text-purple-700',
  admin:  'bg-red-100 text-red-700',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (roleFilter) params.append('role', roleFilter);
    api.get(`/admin/users?${params}`).then(({ data }) => {
      setUsers(data.users);
      setTotalPages(data.pages);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [roleFilter, page]);

  const toggleActive = async (id, current) => {
    try {
      await api.put(`/admin/users/${id}/toggle`);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: !current } : u));
      toast.success(`User ${!current ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update user');
    }
  };

  const filtered = users.filter((u) =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 text-sm">Manage all platform users</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {['', 'buyer', 'vendor', 'admin'].map((r) => (
          <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
              roleFilter === r ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {r || 'All Roles'}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..." className="input-field pl-9 text-sm w-56" />
        </div>
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
                  <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toggleActive(u._id, u.isActive)} title={u.isActive ? 'Deactivate' : 'Activate'}>
                        {u.isActive
                          ? <ToggleRight className="w-6 h-6 text-green-500 hover:text-green-700 transition" />
                          : <ToggleLeft className="w-6 h-6 text-gray-400 hover:text-gray-600 transition" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
