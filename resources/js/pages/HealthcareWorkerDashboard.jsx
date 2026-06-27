import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyWardResources, updateResourceStatus } from '../api/worker';

const statusColors = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
};

export default function HealthcareWorkerDashboard() {
  const { user, logout } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getMyWardResources()
      .then(res => setResources(res.data))
      .catch(() => setError('Could not load resources'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateResourceStatus(id, newStatus);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">FRAS — Healthcare Worker</h1>
            <p className="text-sm text-gray-500">{user?.name}</p>
          </div>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">Log out</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Ward Resources</h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : resources.length === 0 ? (
          <p className="text-gray-500">No resources found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(r => (
              <div key={r.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">{r.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[r.status] || 'bg-gray-100 text-gray-700'}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">Type: {r.type} · Qty: {r.quantity}</p>
                <select
                  value={r.status}
                  onChange={e => handleStatusChange(r.id, e.target.value)}
                  className="w-full text-sm border rounded-md px-2 py-1"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="decommissioned">Decommissioned</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
