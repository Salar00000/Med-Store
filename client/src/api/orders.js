import api from './client.js';

export async function createOrder(payload) {
  const { data } = await api.post('/orders', payload);
  return data.order;
}

export async function fetchOrders() {
  const { data } = await api.get('/orders');
  return data.orders;
}
