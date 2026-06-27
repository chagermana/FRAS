import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Accept': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('fras_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
