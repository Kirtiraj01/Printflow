import client from './client';

export const authApi = {
  login: async (email, password) => {
    return client.post('/auth/login', { email, password });
  },
  getMe: async () => {
    return client.get('/auth/me');
  },
};
