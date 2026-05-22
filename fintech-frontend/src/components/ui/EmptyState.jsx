export default function EmptyState({ icon: IconC, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      {IconC && (
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <IconC className="h-6 w-6" />
        </div>
      )}
      <p className="font-display font-semibold text-ink-700">{title}</p>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-slate-500">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
