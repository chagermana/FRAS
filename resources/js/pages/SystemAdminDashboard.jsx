import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStats, getHospitals, createHospital, updateHospital, deleteHospital } from '../api/admin';

export default function SystemAdminDashboard() {
  const { user, logout } = useAuth();
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">FRAS — System Admin</h1>
            <p className="text-sm text-gray-500">{user?.name}</p>
          </div>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">Log out</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Hospitals" value={stats.hospitals} />
            <StatCard label="Wards" value={stats.wards} />
            <StatCard label="Resources" value={stats.resources} />
            <StatCard label="Users" value={stats.users} />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="md:col-span-1">
            <div className="bg-white p-5 rounded-lg shadow-sm border">
              <h2 className="font-medium text-gray-800 mb-3">{editingId ? 'Edit Hospital' : 'Add Hospital'}</h2>
              {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-3">
                <input name="name" placeholder="Hospital name" value={form.name} onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm" required />
                <input name="county" placeholder="County" value={form.county} onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm" required />
                <input name="location" placeholder="Location" value={form.location} onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm" required />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700">
                  {editingId ? 'Update' : 'Create'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setForm({ name:'', county:'', location:'' }); }}
                    className="w-full text-gray-500 text-sm">Cancel</button>
                )}
              </form>
            </div>
          </div>

          {/* List */}
          <div className="md:col-span-2 space-y-3">
            {hospitals.map(h => (
              <div key={h.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{h.name}</p>
                  <p className="text-sm text-gray-500">{h.location}, {h.county}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(h)} className="text-sm text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(h.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))}
            {hospitals.length === 0 && <p className="text-gray-500 text-sm">No hospitals yet.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-800">{value ?? '-'}</p>
    </div>
  );
}
