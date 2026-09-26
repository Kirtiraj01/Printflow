import client from './client';

export const studentsApi = {
  getMe: async () => {
    return client.get('/students/me');
  },
  updateMe: async (profileData) => {
    return client.put('/students/me', profileData);
  },
  topUpWallet: async (amount) => {
    return client.post('/students/wallet/topup', { amount });
  },
};
