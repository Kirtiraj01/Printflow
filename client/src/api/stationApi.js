import client from './client';

export const stationApi = {
  getStatus: async () => {
    return client.get('/station/status');
  },
  updateConfig: async (configData) => {
    return client.put('/station/config', configData);
  },
  resetDemo: async () => {
    return client.post('/station/reset-demo', {});
  },
};
