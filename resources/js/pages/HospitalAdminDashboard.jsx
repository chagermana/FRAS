import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, StatusBadge, SectionHeading, Select, Input, Button, EmptyState } from '../components/ui';
import { getHospitalResources, getComments, createComment, getHospitalUsers, updateUser, deleteUser } from '../api/hospitalAdmin';

export default function HospitalAdminDashboard() {
  const [resources, setResources] = useState([]);
  const [comments, setComments] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [newComment, setNewComment] = useState({ resource_id: '', content: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getHospitalResources().then(res => setResources(res.data)).catch(() => setError('Could not load resources'));
    getComments().then(res => setComments(res.data)).catch(() => {});
    getHospitalUsers().then(res => setWorkers(res.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.resource_id || !newComment.content) return;
    try {
      await createComment(newComment.resource_id, newComment.content);
      setNewComment({ resource_id: '', content: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add comment');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateUser(id, { role });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update user');
    }
  };

  const handleRemoveWorker = async (id) => {
    if (!confirm('Remove this staff member?')) return;
    try {
      await deleteUser(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove user');
    }
  };

  const myHospitalComments = comments.filter(c => resources.some(r => r.id === c.resource?.id));

  return (
    <DashboardLayout title="Hospital Overview">
      {error && <p className="text-rose-600 text-sm mb-4 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}

      <SectionHeading>Staff</SectionHeading>
      {loading ? (
        <p className="text-slate-400 text-sm mb-8">Loading...</p>
      ) : (
        <div className="space-y-3 mb-8">
          {workers.map(w => (
            <Card key={w.id} className="p-4 flex flex-wrap justify-between items-center gap-3">
              <div>
                <p className="font-medium text-slate-800">{w.name}</p>
                <p className="text-sm text-slate-500">{w.email} · {w.ward ? w.ward.name : 'No ward'}</p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={w.role} onChange={e => handleRoleChange(w.id, e.target.value)}>
                  <option value="healthcare_worker">Healthcare Worker</option>
                  <option value="hospital_admin">Hospital Admin</option>
                </Select>
                <Button variant="danger" onClick={() => handleRemoveWorker(w.id)}>Remove</Button>
              </div>
            </Card>
          ))}
          {workers.length === 0 && <EmptyState>No staff registered for your hospital yet.</EmptyState>}
        </div>
      )}

      <SectionHeading>Resources</SectionHeading>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {resources.map(r => (
          <Card key={r.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-slate-800">{r.name}</h3>
              <StatusBadge status={r.status} />
            </div>
            <p className="text-sm text-slate-500">{r.type} · Qty {r.quantity}</p>
            {r.ward && <p className="text-xs text-slate-400 mt-1">{r.ward.name}</p>}
          </Card>
        ))}
        {resources.length === 0 && <EmptyState>No resources recorded yet.</EmptyState>}
      </div>

      <SectionHeading>Comments</SectionHeading>
      <Card className="p-4 mb-6">
        <form onSubmit={handleAddComment} className="flex flex-wrap gap-2">
          <Select
            value={newComment.resource_id}
            onChange={e => setNewComment({ ...newComment, resource_id: e.target.value })}
          >
            <option value="">Select resource...</option>
            {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
          <Input
            placeholder="Add a comment..."
            value={newComment.content}
            onChange={e => setNewComment({ ...newComment, content: e.target.value })}
            className="flex-1 min-w-[160px]"
          />
          <Button type="submit">Post</Button>
        </form>
      </Card>

      <div className="space-y-3">
        {myHospitalComments.map(c => (
          <Card key={c.id} className="p-4">
            <p className="text-slate-700 text-sm">{c.content}</p>
            <p className="text-xs text-slate-400 mt-1">{c.user?.name} on {c.resource?.name}</p>
          </Card>
        ))}
        {myHospitalComments.length === 0 && <EmptyState>No comments yet.</EmptyState>}
      </div>
    </DashboardLayout>
  );
}
