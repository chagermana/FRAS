import client from './client';

export const getPublicStats = () => client.get('/public/dashboard');
export const searchPublicResources = (search = '') =>
  client.get('/public/resources', { params: search ? { search } : {} });
