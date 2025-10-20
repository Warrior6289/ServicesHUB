import { api, setAuthToken } from './client';

export type LoginPayload = { email: string; password: string };
export type SignupPayload = { name: string; email: string; password: string; accountType: 'buyer' | 'seller' };

export async function login(payload: LoginPayload) {
  const { data } = await api.post('/auth/login', payload);
  if (data?.token) setAuthToken(data.token);
  return data;
}

export async function signup(payload: SignupPayload) {
  const { data } = await api.post('/auth/signup', payload);
  if (data?.token) setAuthToken(data.token);
  return data;
}

export async function logout() {
  try { await api.post('/auth/logout'); } catch {}
  setAuthToken(null);
}


