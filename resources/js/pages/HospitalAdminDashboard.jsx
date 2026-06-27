import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getHospitalDashboard, getComments } from '../api/hospitalAdmin';

export default function HospitalAdminDashboard() {
  const { user, logout } = useAuth();
  const [info, setInfo] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getHospitalDashboard().then(res => setInfo(res.data)).catch(() => setError('Could not load dashboard'));
    getComments().then(res => setComments(res.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">FRAS — Hospital Admin</h1>
            <p className="text-sm text-gray-500">{user?.name}</p>
          </div>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">Log out</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {info && (
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <p className="text-gray-700">{info.message}</p>
            {info.note && <p className="text-sm text-gray-400 mt-1">{info.note}</p>}
          </div>
        )}

        <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Comments</h2>
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {comments.map(c => (
              <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <p className="text-gray-700 text-sm">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
