import api from './client.js';

export async function fetchProducts({ category = 'all', search = '', sort = 'default' } = {}) {
  const { data } = await api.get('/products', {
    params: { category, search, sort },
  });
  return data.products;
}

export async function fetchProduct(id) {
  const { data } = await api.get(`/products/${id}`);
  return data.product;
}
