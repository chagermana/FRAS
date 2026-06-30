import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, StatusBadge, Select, EmptyState } from '../components/ui';
import { getMyWardResources, updateResourceStatus } from '../api/worker';
import client from '../api/client';

export default function HealthcareWorkerDashboard() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Track comments per resource ID: { [resourceId]: "comment text" }
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
    setError('');

    // Sending exactly what Laravel validator wants: resource_id and content
    client.post('/comments', { 
      resource_id: resourceId, 
      content: text 
    })
      .then(() => {
        setCardComments(prev => ({ ...prev, [resourceId]: '' }));
        alert('Condition log appended to this resource.');
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to sync comment with backend verification.');
      })
      .finally(() => {
        setSubmittingId(null);
      });
  };

  return (
    <DashboardLayout title="Ward Resources">
      {error && <p className="text-rose-600 text-sm mb-4 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}

      {loading ? (
        <p className="text-slate-400 text-sm">Loading resources...</p>
      ) : resources.length === 0 ? (
        <EmptyState>No resources assigned to your ward yet.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(r => (
            <Card key={r.id} className="p-4 border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-slate-800 text-sm">{r.name}</h3>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-slate-500 mb-3">{r.type} · Qty {r.quantity}</p>
                <Select
                  value={r.status}
                  onChange={e => handleStatusChange(r.id, e.target.value)}
                  className="w-full text-xs"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="decommissioned">Decommissioned</option>
                </Select>
              </div>

              {/* Labeled Inline Comment Form Specific to This Resource */}
              <div className="pt-2 border-t border-slate-100">
                <form onSubmit={(e) => handleCommentSubmit(e, r.id)} className="space-y-2">
                  <input
                    type="text"
                    value={cardComments[r.id] || ''}
                    onChange={e => setCardComments(prev => ({ ...prev, [r.id]: e.target.value }))}
                    placeholder="Log status notes..."
                    className="w-full px-2 py-1 border border-slate-200 rounded text-[11px] outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingId === r.id}
                      className="bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-medium py-1 px-2 rounded transition-colors disabled:bg-slate-400"
                    >
                      {submittingId === r.id ? "Saving..." : "Log Note"}
                    </button>
                  </div>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
