import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, StatCard, SectionHeading, Input, Button, EmptyState } from '../components/ui';
import { getStats, getHospitals, createHospital, updateHospital, deleteHospital } from '../api/admin';

export default function SystemAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState({ name: '', county: '', location: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    getStats().then(res => setStats(res.data));
    getHospitals().then(res => setHospitals(res.data));
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateHospital(editingId, form);
      } else {
        await createHospital(form);
      }
      setForm({ name: '', county: '', location: '' });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleEdit = (h) => {
    setEditingId(h.id);
    setForm({ name: h.name, county: h.county, location: h.location });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this hospital?')) return;
    await deleteHospital(id);
    load();
  };

  return (
    <DashboardLayout title="System Overview">
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Hospitals" value={stats.hospitals} />
          <StatCard label="Wards" value={stats.wards} />
          <StatCard label="Resources" value={stats.resources} />
          <StatCard label="Users" value={stats.users} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1 h-fit">
          <SectionHeading>{editingId ? 'Edit Hospital' : 'Add Hospital'}</SectionHeading>
          {error && <p className="text-rose-600 text-sm mb-3 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input name="name" placeholder="Hospital name" value={form.name} onChange={handleChange} required />
            <Input name="county" placeholder="County" value={form.county} onChange={handleChange} required />
            <Input name="location" placeholder="Location" value={form.location} onChange={handleChange} required />
            <Button type="submit" className="w-full">{editingId ? 'Update' : 'Create'}</Button>
            {editingId && (
              <Button type="button" variant="ghost" className="w-full"
                onClick={() => { setEditingId(null); setForm({ name:'', county:'', location:'' }); }}>
                Cancel
              </Button>
            )}
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-3">
          {hospitals.map(h => (
            <Card key={h.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-800">{h.name}</p>
                <p className="text-sm text-slate-500">{h.location}, {h.county}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => handleEdit(h)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(h.id)}>Delete</Button>
              </div>
            </Card>
          ))}
          {hospitals.length === 0 && <EmptyState>No hospitals yet. Add one to get started.</EmptyState>}
        </div>
      </div>
    </DashboardLayout>
  );
}
