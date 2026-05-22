import { Link } from 'react-router-dom';
import { accountService } from '../services/accountService';
import { useAsync } from '../hooks/useAsync';
import { formatMoney } from '../utils/format';
import { Icon } from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';

export default function Accounts() {
  const { data, loading } = useAsync(() => accountService.myAccounts(), []);
  const accounts = data || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        <Link to="/accounts/new" className="btn-primary"><Icon.Plus className="h-4 w-4" /> Open account</Link>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-brand-600"><Spinner size={26} /></div>
      ) : accounts.length === 0 ? (
        <div className="card">
          <EmptyState icon={Icon.Wallet} title="No accounts yet"
            subtitle="Open your first account to start sending and receiving money."
            action={<Link to="/accounts/new" className="btn-primary">Open account</Link>} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {accounts.map((a) => (
            <div key={a.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Account number</p>
                  <p className="font-mono text-lg font-semibold text-ink-800">{a.accountNumber}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-400">Available balance</p>
                  <p className="font-display text-2xl font-bold text-ink-800">{formatMoney(a.balance)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">IFSC</p>
                  <p className="font-mono text-sm text-ink-600">{a.ifscCode}</p>
                </div>
              </div>
              <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-500">{a.accountHolderName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
