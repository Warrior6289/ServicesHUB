import { api } from './client';

export async function fetchUsers() {
  const { data } = await api.get('/admin/users');
  return data as Array<{ id: string; name: string; email: string; role: 'user'|'seller'|'admin'; status: 'active'|'blocked'|'pending' }>;
}

export async function approveSeller(id: string) {
  const { data } = await api.post(`/admin/sellers/${id}/approve`);
  return data;
}

export async function rejectSeller(id: string) {
  const { data } = await api.post(`/admin/sellers/${id}/reject`);
  return data;
}

export async function blockUser(id: string) {
  const { data } = await api.post(`/admin/users/${id}/block`);
  return data;
}

export async function unblockUser(id: string) {
  const { data } = await api.post(`/admin/users/${id}/unblock`);
  return data;
}

export async function setUserRole(id: string, role: 'user'|'seller'|'admin') {
  const { data } = await api.post(`/admin/users/${id}/role`, { role });
  return data;
}


