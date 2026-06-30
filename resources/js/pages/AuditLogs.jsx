import React, { useState, useEffect } from 'react';
import client from '../api/client';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Using your configured client automatically maps to /api/audit-logs with auth headers
        client.get('/audit-logs')
            .then(response => {
                setLogs(Array.isArray(response.data) ? response.data : response.data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching audit logs:", err);
                setError("Failed to load resource audit tracking ledger.");
                setLoading(false);
            });
    }, []);

    const filteredLogs = logs.filter(log => {
        const staffName = log.user?.name?.toLowerCase() || '';
        const resourceName = log.resource?.name?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return staffName.includes(search) || resourceName.includes(search);
    });

    if (loading) return <div className="p-8 text-center text-slate-400 text-sm">Loading tracking ledger...</div>;
    if (error) return <div className="p-8 text-center text-rose-600 text-sm bg-rose-50 rounded-lg max-w-md mx-auto mt-4">{error}</div>;

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Resource Audit Trails</h1>
                        <p className="text-xs text-slate-500">Real-time status alteration logging for facility accountability.</p>
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Search by staff or asset..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs shadow-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 transition-all"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3.5">Timestamp</th>
                                    <th className="px-6 py-3.5">Operator Account</th>
                                    <th className="px-6 py-3.5">Tracked Resource</th>
                                    <th className="px-6 py-3.5">Status Transition</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-slate-600">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-slate-400">No matching audit events logged.</td>
                                    </tr>
                                ) : (
                                    filteredLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-400">
                                                {new Date(log.changed_at || log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-slate-800">{log.user?.name || `User ID: ${log.user_id}`}</div>
                                                <div className="text-[10px] text-slate-400 capitalize">{log.user?.role?.replace('_', ' ')}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200">
                                                    {log.resource?.name || `Resource ID: ${log.resource_id}`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                                                <span className="text-slate-400">{log.old_status}</span>
                                                <span className="text-slate-300">➔</span>
                                                <span className="font-medium text-slate-800">{log.new_status}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
