import client from './client';

export const getStats = () => client.get('/dashboard');
export const getHospitals = () => client.get('/hospitals');
export const createHospital = (data) => client.post('/hospitals', data);
export const updateHospital = (id, data) => client.put(`/hospitals/${id}`, data);
export const deleteHospital = (id) => client.delete(`/hospitals/${id}`);
