const map = {
  SUCCESS:    'bg-brand-50 text-brand-700',
  PROCESSING: 'bg-amber-50 text-amber-700',
  INITIATED:  'bg-sky-50 text-sky-700',
  FAILED:     'bg-red-50 text-red-700',
  FLAGGED:    'bg-orange-50 text-orange-700',
  ACTIVE:     'bg-brand-50 text-brand-700',
  FROZEN:     'bg-sky-50 text-sky-700',
  CLOSED:     'bg-slate-100 text-slate-600',
  VERIFIED:   'bg-brand-50 text-brand-700',
  PENDING:    'bg-amber-50 text-amber-700',
};

export default function StatusBadge({ status }) {
  const cls = map[status] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`badge ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
