import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const roleLabels = {
  system_admin: 'System Admin',
  hospital_admin: 'Hospital Admin',
  healthcare_worker: 'Healthcare Worker',
};

export default function DashboardLayout({ title, children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile overlay */}
      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/30 z-20 lg:hidden" />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static z-30 inset-y-0 left-0 w-64 bg-blue-950 text-white flex flex-col transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-6 py-5 border-b border-blue-800/60">
          <h1 className="text-lg font-semibold tracking-tight">FRAS</h1>
          <p className="text-xs text-blue-300 mt-0.5">Facility Resource Allocation</p>
        </div>

        <div className="px-6 py-4 border-b border-blue-800/60">
          <p className="text-sm font-medium">{user?.name}</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200">
            {roleLabels[user?.role] || user?.role}
          </span>
        </div>

        <div className="flex-1" />

        <div className="px-6 py-4 border-t border-blue-800/60">
          <button onClick={logout} className="w-full text-left text-sm text-blue-200 hover:text-white transition-colors">
            ↩ Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-5 lg:px-8 py-5 flex items-center gap-4">
          <button onClick={() => setOpen(true)} className="lg:hidden text-slate-600">
            ☰
          </button>
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        </header>
        <main className="flex-1 p-5 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
