import React, { useState, useEffect } from 'react';
import client from '../api/client';

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeReport, setActiveReport] = useState(null);
    const [formData, setFormData] = useState({ period_start: '', period_end: '', content: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        client.get('/reports')
            .then(response => {
                setReports(Array.isArray(response.data) ? response.data : response.data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to sync reporting modules.");
                setLoading(false);
            });
    }, []);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        client.post('/reports', formData)
            .then(response => {
                const newReport = response.data.data || response.data;
                setReports(prev => [newReport, ...prev]);
                setFormData({ period_start: '', period_end: '', content: '' });
                setSubmitting(false);
                alert("Accountability report compiled successfully.");
            })
            .catch(err => {
                console.error(err);
                setSubmitting(false);
                alert("Submission failed. Ensure date configurations are valid.");
            });
    };

    if (loading) return <div className="p-8 text-center text-slate-400 text-sm">Syncing periodic summaries...</div>;
    if (error) return <div className="p-8 text-center text-rose-600 text-sm bg-rose-50 rounded-lg max-w-md mx-auto mt-4">{error}</div>;

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Facility Resource Reports</h1>
                    <p className="text-xs text-slate-500">Compile and manage administrative capacity frameworks.</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Compile Operational Period</h3>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Period Start</label>
                                <input 
                                    type="date" required value={formData.period_start}
                                    onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Period End</label>
                                <input 
                                    type="date" required value={formData.period_end}
                                    onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Report Narrative Notes</label>
                            <textarea 
                                rows="3" required placeholder="Type resource utilization overview notes..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="submit" disabled={submitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2 px-4 rounded-lg transition-colors disabled:bg-blue-400"
                            >
                                {submitting ? "Processing..." : "Commit Summary"}
                            </button>
                        </div>
                    </form>
                </div>

                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Historical Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reports.length === 0 ? (
                        <div className="col-span-2 bg-white text-center p-10 text-slate-400 border rounded-xl text-xs">No reports generated for this facility.</div>
                    ) : (
                        reports.map(report => (
                            <div key={report.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all text-xs">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold border border-slate-200 uppercase">
                                            {report.hospital?.name || `Facility Context`}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">ID: #{report.id}</span>
                                    </div>
                                    <div className="text-slate-400 mb-3 text-[11px]">
                                        📅 {report.period_start} to {report.period_end}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setActiveReport(report)}
                                    className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-medium rounded-lg border border-slate-200 transition-colors"
                                >
                                    Review Document Notes
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {activeReport && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl max-w-xl w-full flex flex-col">
                        <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-semibold text-sm text-slate-800">Document Content Viewer</h3>
                            <button onClick={() => setActiveReport(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
                        </div>
                        <div className="p-4 overflow-y-auto bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed max-h-[50vh] rounded-b-xl whitespace-pre-wrap">
                            {activeReport.content}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
