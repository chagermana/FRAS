import client from './client';

export const getMyWardResources = () => client.get('/resources');
export const updateResourceStatus = (id, status) => client.put(`/resources/${id}`, { status });
