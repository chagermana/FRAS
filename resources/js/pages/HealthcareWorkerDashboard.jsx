import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, StatusBadge, Select, EmptyState } from '../components/ui';
import { getMyWardResources, updateResourceStatus } from '../api/worker';

export default function HealthcareWorkerDashboard() {
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
    <DashboardLayout title="Ward Resources">
      {error && <p className="text-rose-600 text-sm mb-4 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : resources.length === 0 ? (
        <EmptyState>No resources assigned to your ward yet.</EmptyState>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-slate-800">{r.name}</h3>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-sm text-slate-500 mb-3">{r.type} · Qty {r.quantity}</p>
              <Select
                value={r.status}
                onChange={e => handleStatusChange(r.id, e.target.value)}
                className="w-full"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="decommissioned">Decommissioned</option>
              </Select>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
