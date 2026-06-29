export const statusStyles = {
  available: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  occupied: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  maintenance: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  decommissioned: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

export function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[status] || statusStyles.decommissioned}`}>
      {status}
    </span>
  );
}

export function StatCard({ label, value, accent = 'text-blue-900' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className={`text-3xl font-semibold mt-1 ${accent}`}>{value ?? '–'}</p>
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeading({ children }) {
  return <h3 className="text-base font-semibold text-slate-800 mb-4">{children}</h3>;
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  };
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props) {
  return (
    <input
      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
      {...props}
    />
  );
}

export function Select(props) {
  return (
    <select
      className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      {...props}
    />
  );
}

export function EmptyState({ children }) {
  return (
    <div className="text-center py-10 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
      {children}
    </div>
  );
}
