import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicStats, searchPublicResources } from '../api/dashboard';

const statusColors = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
};

export default function PublicDashboard() {
  const [stats, setStats] = useState(null);
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicStats().then(res => setStats(res.data));
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">FRAS</h1>
          <Link to="/login" className="text-blue-600 text-sm font-medium hover:underline">
            Staff Login
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatCard label="Hospitals" value={stats.hospitals} />
            <StatCard label="Wards" value={stats.wards} />
            <StatCard label="Total Resources" value={stats.resources} />
            <StatCard label="Available" value={stats.available_resources} color="text-green-600" />
            <StatCard label="Occupied" value={stats.occupied_resources} color="text-red-600" />
            <StatCard label="Maintenance" value={stats.maintenance_resources} color="text-yellow-600" />
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Search resources by name or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md"
          />
          <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700">
            Search
          </button>
        </form>

        {/* Resource list */}
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
                <p className="text-sm text-gray-500">Type: {r.type}</p>
                <p className="text-sm text-gray-500">Quantity: {r.quantity}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, color = 'text-gray-800' }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value ?? '-'}</p>
    </div>
  );
}
