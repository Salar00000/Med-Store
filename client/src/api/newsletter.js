import api from './client.js';

export async function subscribeNewsletter(email) {
  const { data } = await api.post('/newsletter', { email });
  return data;
}
