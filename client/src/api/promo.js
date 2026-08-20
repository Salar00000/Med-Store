import api from './client.js';

export async function validatePromo(code) {
  const { data } = await api.get(`/promo/${encodeURIComponent(code)}`);
  return data;
}
