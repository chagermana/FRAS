import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Card, StatusBadge, SectionHeading, Select, Input, Button, EmptyState } from '../components/ui';
import {
  getHospitalResources,
  updateResource,
  deleteResource,
  createResource,
  getWards,
  createWard,
  getHospitalUsers,
  updateUser,
  deleteUser,
  getComments,
  createComment
} from '../api/hospitalAdmin';
import { approveUser, rejectUser } from '../api/approvals';

export default function HospitalAdminDashboard() {
  const [resources, setResources] = useState([]);
  const [comments, setComments] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [wards, setWards] = useState([]);
  const [newWardName, setNewWardName] = useState('');
  const [newComment, setNewComment] = useState({ resource_id: '', content: '' });
  const [newResource, setNewResource] = useState({ name: '', type: '', quantity: '1', status: 'available', ward_id: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingWorkers, setPendingWorkers] = useState([]);

  // Inline Resource Editing State
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [editResourceData, setEditResourceData] = useState({ name: '', type: '', quantity: 1, status: '', ward_id: '' });

  const load = () => {
    setLoading(true);
    getHospitalResources().then(res => setResources(res.data)).catch(() => setError('Could not load resources'));
    getComments().then(res => setComments(res.data)).catch(() => {});

    getWards()
      .then(res => setWards(res.data))
      .catch(() => setError('Could not load facility wards'));

    getHospitalUsers().then(res => {
      setWorkers(res.data.filter(u => u.status === 'approved'));
      setPendingWorkers(res.data.filter(u => u.status === 'pending'));
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    try { await approveUser(id); load(); } catch (err) { setError(err.response?.data?.message || 'Could not approve'); }
  };

  const handleReject = async (id) => {
    try { await rejectUser(id); load(); } catch (err) { setError(err.response?.data?.message || 'Could not reject'); }
  };

  const handleCreateWard = async (e) => {
    e.preventDefault();
    if (!newWardName.trim()) return;
    try {
      await createWard(newWardName);
      setNewWardName('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create ward');
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!newResource.name.trim() || !newResource.type.trim() || !newResource.ward_id) {
      setError('Please fill out all fields and select a target ward to provision a resource.');
      return;
    }
    try {
      await createResource({
        ...newResource,
        quantity: parseInt(newResource.quantity) || 1
      });
      setNewResource({ name: '', type: '', quantity: '1', status: 'available', ward_id: '' });
      setError('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not provision resource');
    }
  };

  // Start inline editing mode for a single resource item
  const startEditingResource = (resource) => {
    setEditingResourceId(resource.id);
    setEditResourceData({
      name: resource.name,
      type: resource.type,
      quantity: resource.quantity,
      status: resource.status,
      ward_id: resource.ward_id || ''
    });
  };

  // Persist modified structural parameters of resource items back to API endpoints
  const handleUpdateResource = async (id) => {
    try {
      await updateResource(id, {
        ...editResourceData,
        quantity: parseInt(editResourceData.quantity) || 1
      });
      setEditingResourceId(null);
      setError('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save resource details modification');
    }
  };

  const handleRemoveResource = async (id) => {
    if (!confirm('Permanently decommission and delete this resource?')) return;
    try {
      await deleteResource(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete resource');
    }
  };

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
      setError(err.response?.data?.message || 'Could not update user role configuration');
    }
  };

  // Modify local ward deployment assignment fields targeting working operators 
  const handleStaffWardChange = async (id, wardId) => {
    try {
      await updateUser(id, { ward_id: wardId ? parseInt(wardId) : null });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not alter employee structural ward profile location');
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

      {/* Administrative Utility Control Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-slate-100/60 p-4 rounded-xl border border-slate-200/60">
        <div className="flex flex-col justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <h4 className="font-semibold text-slate-800 text-sm mb-1">Resource Accountability</h4>
            <p className="text-xs text-slate-500 mb-4">Review historical state alterations and operator footprints.</p>
          </div>
          <Link to="/audit-logs" className="inline-flex items-center justify-center text-center px-4 py-2 bg-slate-800 hover:bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors w-full">
            📋 Open Audit Trails
          </Link>
        </div>

        <div className="flex flex-col justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <h4 className="font-semibold text-slate-800 text-sm mb-1">Operational Reports</h4>
            <p className="text-xs text-slate-500 mb-4">Compile capacity frameworks and track baseline summaries.</p>
          </div>
          <Link to="/reports" className="inline-flex items-center justify-center text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors w-full">
            📊 Manage Summary Documents
          </Link>
        </div>
      </div>

      {/* Dynamic Ward Configuration Console */}
      <SectionHeading>Facility Wards</SectionHeading>
      <Card className="p-4 mb-8">
        <form onSubmit={handleCreateWard} className="flex gap-2 mb-4">
          <Input
            placeholder="Enter new ward configuration name (e.g., Maternity, Pediatrics)..."
            value={newWardName}
            onChange={e => setNewWardName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Add Ward</Button>
        </form>
        <div className="flex flex-wrap gap-2">
          {wards.map(w => (
            <span key={w.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm">
              🏥 {w.name} <span className="text-[10px] text-slate-400 font-mono bg-slate-200/60 px-1 rounded">ID: {w.id}</span>
            </span>
          ))}
          {wards.length === 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200/60 w-full p-2.5 rounded-lg font-medium">
              ⚠️ No active wards assigned to your facility. Add a ward above to allow local healthcare workers to register.
            </p>
          )}
        </div>
      </Card>

      {/* Resource Provisioning Engine */}
      <SectionHeading>Provision New Facility Resource</SectionHeading>
      <Card className="p-4 mb-8">
        <form onSubmit={handleCreateResource} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Resource Name</label>
            <Input
              placeholder="e.g., Oxygen Concentrator v4"
              value={newResource.name}
              onChange={e => setNewResource({ ...newResource, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Category Type</label>
            <Input
              placeholder="e.g., Medical Equipment"
              value={newResource.type}
              onChange={e => setNewResource({ ...newResource, type: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Initial Quantity</label>
            <Input
              type="number"
              value={newResource.quantity}
              onChange={e => setNewResource({ ...newResource, quantity: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Target Facility Ward</label>
            <Select
              value={newResource.ward_id}
              onChange={e => setNewResource({ ...newResource, ward_id: e.target.value })}
            >
              <option value="">Select ward...</option>
              {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Operational Baseline Status</label>
            <Select
              value={newResource.status}
              onChange={e => setNewResource({ ...newResource, status: e.target.value })}
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </Select>
          </div>
          <div className="sm:col-span-2 md:col-span-5 flex justify-end mt-2">
            <Button type="submit">Add Resource</Button>
          </div>
        </form>
      </Card>

      {pendingWorkers.length > 0 && (
        <>
          <SectionHeading>Pending Staff Approvals</SectionHeading>
          <div className="space-y-3 mb-8">
            {pendingWorkers.map(p => (
              <Card key={p.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-800">{p.name}</p>
                  <p className="text-sm text-slate-500">{p.email} · Ward ID {p.ward_id}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="success" onClick={() => handleApprove(p.id)}>Approve</Button>
                  <Button variant="danger" onClick={() => handleReject(p.id)}>Reject</Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Staff Management Section */}
      <SectionHeading>Staff</SectionHeading>
      {loading ? (
        <p className="text-slate-400 text-sm mb-8">Loading...</p>
      ) : (
        <div className="space-y-3 mb-8">
          {workers.map(w => (
            <Card key={w.id} className="p-4 flex flex-wrap justify-between items-center gap-3">
              <div>
                <p className="font-medium text-slate-800">{w.name}</p>
                <p className="text-sm text-slate-500">{w.email} · {w.ward ? w.ward.name : 'No ward assigned'}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                {/* Ward Selection Dropdown to reassign layout context handles */}
                <div className="flex flex-col">
                  <label className="text-[10px] text-slate-400 font-medium mb-0.5">Assigned Ward</label>
                  <Select 
                    value={w.ward_id || ''} 
                    onChange={e => handleStaffWardChange(w.id, e.target.value)}
                  >
                    <option value="">No Ward</option>
                    {wards.map(wd => <option key={wd.id} value={wd.id}>{wd.name}</option>)}
                  </Select>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] text-slate-400 font-medium mb-0.5">System Security Role</label>
                  <Select value={w.role} onChange={e => handleRoleChange(w.id, e.target.value)}>
                    <option value="healthcare_worker">Healthcare Worker</option>
                    <option value="hospital_admin">Hospital Admin</option>
                  </Select>
                </div>

                <Button variant="danger" className="mt-4 sm:mt-0" onClick={() => handleRemoveWorker(w.id)}>Remove</Button>
              </div>
            </Card>
          ))}
          {workers.length === 0 && <EmptyState>No staff registered for your hospital yet.</EmptyState>}
        </div>
      )}

      {/* Resources Management Dashboard View Block */}
      <SectionHeading>Resources</SectionHeading>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {resources.map(r => {
          const isEditing = editingResourceId === r.id;

          return (
            <Card key={r.id} className="p-4 flex flex-col justify-between border-slate-200">
              {isEditing ? (
                // Edit Form Context Rendering Interface
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Resource Name</label>
                    <Input
                      value={editResourceData.name}
                      onChange={e => setEditResourceData({ ...editResourceData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Category Type</label>
                    <Input
                      value={editResourceData.type}
                      onChange={e => setEditResourceData({ ...editResourceData, type: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Quantity</label>
                      <Input
                        type="number"
                        value={editResourceData.quantity}
                        onChange={e => setEditResourceData({ ...editResourceData, quantity: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Status</label>
                      <Select
                        value={editResourceData.status}
                        onChange={e => setEditResourceData({ ...editResourceData, status: e.target.value })}
                      >
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Facility Location Ward</label>
                    <Select
                      value={editResourceData.ward_id}
                      onChange={e => setEditResourceData({ ...editResourceData, ward_id: e.target.value })}
                    >
                      <option value="">Select ward...</option>
                      {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button variant="secondary" onClick={() => setEditingResourceId(null)}>Cancel</Button>
                    <Button onClick={() => handleUpdateResource(r.id)}>Save Changes</Button>
                  </div>
                </div>
              ) : (
                // Base Display View Render State Context
                <>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-slate-800">{r.name}</h3>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm text-slate-500">{r.type} · Qty {r.quantity}</p>
                    {r.ward && <p className="text-xs text-slate-400 mt-1">📍 {r.ward.name}</p>}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between gap-2">
                    <Button variant="secondary" onClick={() => startEditingResource(r)}>Edit Details</Button>
                    <Button variant="danger" onClick={() => handleRemoveResource(r.id)}>Decommission</Button>
                  </div>
                </>
              )}
            </Card>
          );
        })}
        {resources.length === 0 && <EmptyState>No resources recorded yet.</EmptyState>}
      </div>

      <SectionHeading>Ward Condition Logs & Comments</SectionHeading>
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
