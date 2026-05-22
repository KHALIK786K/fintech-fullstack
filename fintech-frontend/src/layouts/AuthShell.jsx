import { Icon } from '../components/ui/Icon';

// Split-screen auth shell: a dark brand panel on the left, the form on the right.
export default function AuthShell({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand / marketing panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-900 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-ink-900">
            <Icon.Shield className="h-6 w-6" />
          </div>
          <span className="font-display text-xl font-bold">Meridian</span>
        </div>

        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Move money with<br /><span className="text-brand-400">confidence.</span>
          </h2>
          <p className="mt-4 max-w-md text-slate-400">
            Instant RTGS settlements, batched NEFT transfers, and a full audit trail —
            built on bank-grade security.
          </p>
          <div className="mt-8 flex gap-6">
            {[['Encrypted', Icon.Shield], ['Real-time RTGS', Icon.Bolt], ['Audited', Icon.List]].map(
              ([label, IconC]) => (
                <div key={label} className="flex items-center gap-2 text-sm text-slate-300">
                  <IconC className="h-4 w-4 text-brand-400" /> {label}
                </div>
              )
            )}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">© {new Date().getFullYear()} Meridian Bank. Demo environment.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-slate-50 p-6 sm:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
