import client from './client';

export const getHospitalResources = () => client.get('/resources');
export const updateResource = (id, data) => client.put(`/resources/${id}`, data);
export const deleteResource = (id) => client.delete(`/resources/${id}`);
export const createResource = (data) => client.post('/resources', data);

export const getWards = () => client.get('/wards');
export const createWard = (name) => client.post('/wards', { name });

export const getHospitalUsers = () => client.get('/users');
export const updateUser = (id, data) => client.put(`/users/${id}`, data);
export const deleteUser = (id) => client.delete(`/users/${id}`);

export const getComments = () => client.get('/comments');
export const createComment = (resource_id, content) => client.post('/comments', { resource_id, content });
