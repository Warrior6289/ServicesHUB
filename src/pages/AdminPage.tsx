import React from 'react';
import { useAuth } from '../lib/auth';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { approveSeller as apiApprove, rejectSeller as apiReject, blockUser as apiBlock, unblockUser as apiUnblock, setUserRole as apiSetRole, fetchUsers as apiFetchUsers } from '../api/admin';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  status: 'active' | 'blocked' | 'pending';
};

const demoUsers: UserRecord[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', role: 'user', status: 'active' },
  { id: '2', name: 'Bob', email: 'bob@example.com', role: 'seller', status: 'pending' },
  { id: '3', name: 'Carol', email: 'carol@example.com', role: 'seller', status: 'active' },
  { id: '4', name: 'Dave', email: 'dave@example.com', role: 'user', status: 'blocked' },
];

const activityData = [
  { name: 'Mon', users: 12, services: 5 },
  { name: 'Tue', users: 18, services: 7 },
  { name: 'Wed', users: 22, services: 10 },
  { name: 'Thu', users: 20, services: 9 },
  { name: 'Fri', users: 28, services: 13 },
  { name: 'Sat', users: 24, services: 11 },
  { name: 'Sun', users: 16, services: 8 },
];

export const AdminPage: React.FC = () => {
  const { loginAs, role } = useAuth();
  const [query, setQuery] = React.useState<string>('');
  const [roleFilter, setRoleFilter] = React.useState<'all' | 'user' | 'seller' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'blocked' | 'pending'>('all');
  const [sortKey, setSortKey] = React.useState<keyof UserRecord>('name');
  const [sortAsc, setSortAsc] = React.useState<boolean>(true);
  const [rows, setRows] = React.useState<UserRecord[]>(demoUsers);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiFetchUsers();
        if (mounted && Array.isArray(data)) setRows(data as any);
      } catch {
        setError('Failed to load users. Showing demo data.');
      } finally {
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = rows
    .filter(r => (roleFilter === 'all' ? true : r.role === roleFilter))
    .filter(r => (statusFilter === 'all' ? true : r.status === statusFilter))
    .filter(r => (query ? (r.name.toLowerCase().includes(query.toLowerCase()) || r.email.toLowerCase().includes(query.toLowerCase())) : true))
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortAsc ? cmp : -cmp;
    });

  const toggleSort = (key: keyof UserRecord) => {
    if (key === sortKey) {
      setSortAsc(prev => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const approveSeller = (id: string) => { setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'active' } : r)); apiApprove(id).catch(() => {}); };
  const rejectSeller = (id: string) => { setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'blocked' } : r)); apiReject(id).catch(() => {}); };
  const blockUser = (id: string) => { setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'blocked' } : r)); apiBlock(id).catch(() => {}); };
  const unblockUser = (id: string) => { setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'active' } : r)); apiUnblock(id).catch(() => {}); };
  const setRoleFor = (id: string, next: UserRecord['role']) => { setRows(prev => prev.map(r => r.id === id ? { ...r, role: next } : r)); apiSetRole(id, next).catch(() => {}); };

  return (
    <section className="max-w-none">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-300">Current role: {role}</span>
          <div className="flex gap-1">
            <button className="rounded-md border px-2 py-1 text-sm" onClick={() => loginAs('admin')}>Login as Admin</button>
            <button className="rounded-md border px-2 py-1 text-sm" onClick={() => loginAs('buyer')}>Login as Buyer</button>
            <button className="rounded-md border px-2 py-1 text-sm" onClick={() => loginAs('seller')}>Login as Seller</button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4 dark:border-slate-700">
          <p className="text-sm text-slate-500">Total Users</p>
          <p className="mt-1 text-3xl font-semibold">1,248</p>
        </div>
        <div className="rounded-xl border p-4 dark:border-slate-700">
          <p className="text-sm text-slate-500">Active Sellers</p>
          <p className="mt-1 text-3xl font-semibold">83</p>
        </div>
        <div className="rounded-xl border p-4 dark:border-slate-700">
          <p className="text-sm text-slate-500">Pending Applications</p>
          <p className="mt-1 text-3xl font-semibold">12</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border p-4 dark:border-slate-700">
        <h2 className="text-lg font-medium">Activity & Trends</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#3b82f6" />
              <Bar dataKey="services" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 rounded-xl border p-4 dark:border-slate-700">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-medium">Users & Sellers</h2>
            <p className="text-sm text-slate-500">Filter, sort, and manage accounts</p>
            {error ? <p className="text-sm text-amber-600">{error}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email"
              className="rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                {['name', 'email', 'role', 'status'].map((key) => (
                  <th key={key} className="px-3 py-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <button className="hover:underline inline-flex items-center gap-1" onClick={() => toggleSort(key as keyof UserRecord)}>
                      {key.toUpperCase()} 
                      {sortKey === key && (
                        sortAsc ? (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )
                      )}
                    </button>
                  </th>
                ))}
                <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 text-sm">{r.name}</td>
                  <td className="px-3 py-2 text-sm">{r.email}</td>
                  <td className="px-3 py-2 text-sm">
                    <select value={r.role} onChange={(e) => setRoleFor(r.id, e.target.value as any)} className="rounded-md border px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800">
                      <option value="user">User</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status === 'active' ? 'bg-green-100 text-green-800' : r.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <div className="flex flex-wrap gap-2">
                      {r.role === 'seller' && r.status === 'pending' ? (
                        <>
                          <button className="rounded-md bg-green-600 px-2 py-1 text-white hover:bg-green-700" onClick={() => approveSeller(r.id)}>Approve</button>
                          <button className="rounded-md bg-red-600 px-2 py-1 text-white hover:bg-red-700" onClick={() => rejectSeller(r.id)}>Reject</button>
                        </>
                      ) : null}
                      {r.status === 'active' ? (
                        <button className="rounded-md border px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => blockUser(r.id)}>Block</button>
                      ) : (
                        <button className="rounded-md border px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => unblockUser(r.id)}>Unblock</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};


