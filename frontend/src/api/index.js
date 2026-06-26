import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('sasa_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('sasa_token');
    localStorage.removeItem('sasa_user');
  }
  return Promise.reject(err);
});

// Auth
export const register       = d  => api.post('/auth/register', d);
export const login          = d  => api.post('/auth/login', d);
export const updateProfile  = d  => api.put('/auth/profile', d);

// Categories (dynamic)
export const getCategories    = ()       => api.get('/categories');
export const createCategory   = d        => api.post('/categories', d);
export const updateCategory   = (id,d)   => api.put(`/categories/${id}`, d);
export const deleteCategory   = id       => api.delete(`/categories/${id}`);

// Products
export const getProducts    = p  => api.get('/products', { params: p });
export const getProduct     = id => api.get(`/products/${id}`);
export const createProduct  = d  => api.post('/products', d);
export const updateProduct  = (id,d) => api.put(`/products/${id}`, d);
export const deleteProduct  = id => api.delete(`/products/${id}`);

// Payment (direct order — WhatsApp)
export const createDirectOrder = d => api.post('/orders/direct', d);

// Orders
export const getOrders        = ()       => api.get('/orders');
export const getOrder         = id => api.get(`/orders/${id}`);
export const getUserOrders    = email    => api.get('/orders/user', { params: { email } });
export const updateOrderStatus = (id,d)  => api.put(`/orders/${id}/status`, d);

// Admin
export const getCustomers = () => api.get('/customers');
export const getStats     = () => api.get('/admin/stats');

export default api;
