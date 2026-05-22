import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { accountService } from '../services/accountService';
import { beneficiaryService } from '../services/beneficiaryService';
import { transactionService } from '../services/transactionService';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { formatMoney, formatDateTime } from '../utils/format';
import { Icon } from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';

function StatCard({ icon: IconC, label, value, tone = 'slate', to }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    sky: 'bg-sky-50 text-sky-600',
    violet: 'bg-violet-50 text-violet-600',
    slate: 'bg-slate-100 text-slate-600',
  };
  const inner = (
    <div className="card p-5 transition hover:shadow-glow">
      <div className="flex items-center justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>
          <IconC className="h-5 w-5" />
        </span>
        {to && <Icon.Arrow className="h-4 w-4 text-slate-300" />}
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-bold text-ink-800">{value}</p>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function Dashboard() {
  const { user } = useAuth();
  const accountsQ = useAsync(() => accountService.myAccounts(), []);
  const benesQ = useAsync(() => beneficiaryService.list(), []);

  const accounts = accountsQ.data || [];
  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0),
    [accounts]
  );

  // Pull recent transactions from the first account (primary) if one exists.
  const primary = accounts[0];
  const txQ = useAsync(
    () => (primary ? transactionService.history(primary.accountNumber, { page: 0, size: 5 }) : Promise.resolve(null)),
    [primary?.accountNumber]
  );
  const recent = txQ.data?.content || [];

  const stats = useMemo(() => {
    const rtgs = recent.filter((t) => t.transferType === 'RTGS').length;
    const neft = recent.filter((t) => t.transferType === 'NEFT').length;
    return { rtgs, neft };
  }, [recent]);

  if (accountsQ.loading) {
    return <div className="grid place-items-center py-24 text-brand-600"><Spinner size={28} /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Greeting + balance hero */}
      <div className="card overflow-hidden">
        <div className="bg-ink-900 p-6 text-white">
          <p className="text-sm text-slate-400">Welcome back, {user?.username}</p>
          <p className="mt-1 text-sm text-slate-500">Total balance across all accounts</p>
          <p className="mt-1 font-display text-4xl font-bold">{formatMoney(totalBalance)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/transfer/rtgs" className="btn bg-brand-500 text-ink-900 hover:bg-brand-400">
              <Icon.Bolt className="h-4 w-4" /> Send RTGS
            </Link>
            <Link to="/transfer/neft" className="btn bg-white/10 text-white hover:bg-white/20">
              <Icon.Send className="h-4 w-4" /> Send NEFT
            </Link>
            <Link to="/accounts/new" className="btn bg-white/10 text-white hover:bg-white/20">
              <Icon.Plus className="h-4 w-4" /> Open account
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Icon.Wallet} label="Accounts" value={accounts.length} tone="brand" to="/accounts" />
        <StatCard icon={Icon.Users} label="Beneficiaries" value={benesQ.loading ? '…' : (benesQ.data?.length ?? 0)} tone="violet" to="/beneficiaries" />
        <StatCard icon={Icon.Bolt} label="Recent RTGS" value={stats.rtgs} tone="sky" />
        <StatCard icon={Icon.Send} label="Recent NEFT" value={stats.neft} tone="slate" />
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-display font-semibold text-ink-800">Recent transactions</h2>
          <Link to="/transactions" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all</Link>
        </div>

        {!primary ? (
          <EmptyState icon={Icon.Wallet} title="No accounts yet"
            subtitle="Open your first account to start transacting."
            action={<Link to="/accounts/new" className="btn-primary">Open account</Link>} />
        ) : txQ.loading ? (
          <div className="grid place-items-center py-12 text-brand-600"><Spinner /></div>
        ) : recent.length === 0 ? (
          <EmptyState icon={Icon.List} title="No transactions yet"
            subtitle="Your most recent transfers will appear here." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((t) => (
              <li key={t.txnReference} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500">
                    {t.transferType === 'RTGS' ? <Icon.Bolt className="h-4 w-4" /> : <Icon.Send className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink-800">To {t.destAccountNumber}</p>
                    <p className="font-mono text-xs text-slate-400">{t.txnReference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink-800">{formatMoney(t.amount)}</p>
                  <StatusBadge status={t.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
