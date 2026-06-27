import client from './client';

export const getHospitalDashboard = () => client.get('/dashboard/hospital');
export const getComments = () => client.get('/comments');
