import client from './client';

export const approveUser = (id) => client.patch(`/users/${id}/approve`);
export const rejectUser = (id) => client.patch(`/users/${id}/reject`);
