import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, StatusBadge, Select, EmptyState } from '../components/ui';
import { getMyWardResources, updateResourceStatus } from '../api/worker';
import client from '../api/client';

export default function HealthcareWorkerDashboard() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [cardComments, setCardComments] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const load = () => {
    setLoading(true);
    getMyWardResources()
      .then(res => setResources(res.data))
      .catch(() => setError('Could not load resources'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Filter logic: This makes the dashboard responsive and fast
  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                            r.type.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [resources, search, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateResourceStatus(id, newStatus);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleCommentSubmit = async (e, resourceId) => {
    e.preventDefault();
    const text = cardComments[resourceId]?.trim();
    if (!text) return;
    setSubmittingId(resourceId);
    client.post('/comments', { resource_id: resourceId, content: text })
      .then(() => {
        setCardComments(prev => ({ ...prev, [resourceId]: '' }));
        alert('Condition log appended.');
      })
      .finally(() => setSubmittingId(null));
  };

  return (
    <DashboardLayout title="Ward Resources">
      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name or type..."
          className="flex-grow px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
          onChange={e => setSearch(e.target.value)}
        />
        <select 
          className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none bg-white"
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
          <option value="decommissioned">Decommissioned</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : filteredResources.length === 0 ? (
        <EmptyState>No resources match your filters.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map(r => (
            <Card key={r.id} className="p-4 border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-slate-800 text-sm">{r.name}</h3>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-slate-500 mb-3">{r.type} · Qty {r.quantity}</p>
                <Select value={r.status} onChange={e => handleStatusChange(r.id, e.target.value)} className="w-full text-xs">
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="decommissioned">Decommissioned</option>
                </Select>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <form onSubmit={(e) => handleCommentSubmit(e, r.id)} className="space-y-2">
                  <input
                    type="text"
                    value={cardComments[r.id] || ''}
                    onChange={e => setCardComments(prev => ({ ...prev, [r.id]: e.target.value }))}
                    placeholder="Log status notes..."
                    className="w-full px-2 py-1 border border-slate-200 rounded text-[11px] outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                  />
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
