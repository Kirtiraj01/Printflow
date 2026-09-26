import client from './client';

export const ordersApi = {
  createOrder: async (formData) => {
    return client.post('/orders', formData);
  },
  getMyOrders: async () => {
    return client.get('/orders/my-orders');
  },
  getOrderById: async (id) => {
    return client.get(`/orders/${id}`);
  },
  getOrderPdfBlob: async (id) => {
    return client.get(`/orders/${id}/file`, { responseType: 'blob' });
  },
  getAllOrders: async () => {
    return client.get('/orders');
  },
  updateStatus: async (id, status, extra = {}) => {
    return client.patch(`/orders/${id}/status`, {
      status,
      shelfLocation: extra.shelfLocation,
      reason: extra.reason,
    });
  },
};
