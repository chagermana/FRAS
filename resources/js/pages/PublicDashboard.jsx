import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, StatCard, StatusBadge, SectionHeading, Input, Button, EmptyState } from '../components/ui';
import { getPublicStats, searchPublicResources, getPublicHospitals } from '../api/dashboard';

export default function PublicDashboard() {
  const [stats, setStats] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicStats().then(res => setStats(res.data));
    getPublicHospitals().then(res => setHospitals(res.data));
    searchPublicResources().then(res => setResources(res.data)).finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await searchPublicResources(search);
    setResources(res.data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold tracking-tight">FRAS</h1>
          <Link to="/login" className="text-sm font-medium text-blue-200 hover:text-white">
            Staff Login →
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            <StatCard label="Hospitals" value={stats.hospitals} />
            <StatCard label="Wards" value={stats.wards} />
            <StatCard label="Total Resources" value={stats.resources} />
            <StatCard label="Available" value={stats.available_resources} accent="text-emerald-600" />
            <StatCard label="Occupied" value={stats.occupied_resources} accent="text-rose-600" />
            <StatCard label="Maintenance" value={stats.maintenance_resources} accent="text-amber-600" />
          </div>
        )}

        <SectionHeading>Hospitals</SectionHeading>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {hospitals.map(h => (
            <Card key={h.id} className="p-4">
              <h3 className="font-medium text-slate-800 mb-2">{h.name}</h3>
              <div className="flex gap-3 text-sm">
                <span className="text-emerald-600">{h.available_resources} available</span>
                <span className="text-rose-600">{h.occupied_resources} occupied</span>
                <span className="text-amber-600">{h.maintenance_resources} maintenance</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{h.total_resources} total resources</p>
            </Card>
          ))}
          {hospitals.length === 0 && <EmptyState>No hospitals registered yet.</EmptyState>}
        </div>

        <SectionHeading>Search Resources</SectionHeading>
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <Input
            placeholder="Search resources by name or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : resources.length === 0 ? (
          <EmptyState>No resources found.</EmptyState>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(r => (
              <Card key={r.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-slate-800">{r.name}</h3>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-sm text-slate-500">{r.type} · Qty {r.quantity}</p>
                {r.ward && (
                  <p className="text-xs text-slate-400 mt-1">
                    {r.ward.name}{r.ward.hospital ? `, ${r.ward.hospital.name}` : ''}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
