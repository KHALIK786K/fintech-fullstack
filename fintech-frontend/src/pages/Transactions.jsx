import { useEffect, useMemo, useState } from 'react';
import { accountService } from '../services/accountService';
import { transactionService } from '../services/transactionService';
import { useAsync } from '../hooks/useAsync';
import { formatMoney, formatDateTime } from '../utils/format';
import { extractError } from '../services/api';
import { Icon } from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';

const PAGE_SIZE = 10;

export default function Transactions() {
  const accountsQ = useAsync(() => accountService.myAccounts(), []);
  const accounts = accountsQ.data || [];

  const [account, setAccount] = useState('');
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);

  // Default to the first account once accounts load.
  useEffect(() => {
    if (!account && accounts.length) setAccount(accounts[0].accountNumber);
  }, [accounts, account]);

  // Fetch transactions whenever the account or page changes.
  useEffect(() => {
    if (!account) return;
    let active = true;
    setLoading(true);
    setErrorMsg('');
    transactionService.history(account, { page, size: PAGE_SIZE })
      .then((data) => { if (active) setPageData(data); })
      .catch((err) => { if (active) setErrorMsg(extractError(err, 'Could not load transactions')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [account, page]);

  const rows = pageData?.content || [];

  // Client-side search + status filter on the current page.
  const filtered = useMemo(() => {
    return rows.filter((t) => {
      const matchesSearch = !search
        || t.txnReference?.toLowerCase().includes(search.toLowerCase())
        || t.destAccountNumber?.includes(search);
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const totalPages = pageData?.totalPages ?? 1;

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <Select label="Account" value={account}
          onChange={(e) => { setAccount(e.target.value); setPage(0); }} className="sm:w-56">
          {accounts.length === 0 && <option value="">No accounts</option>}
          {accounts.map((a) => (
            <option key={a.id} value={a.accountNumber}>{a.accountNumber}</option>
          ))}
        </Select>
        <div className="relative flex-1">
          <label className="field-label">Search</label>
          <Icon.Search className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-slate-400" />
          <input className="field-input pl-9" placeholder="Reference or destination account"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-44">
          {['ALL', 'SUCCESS', 'PROCESSING', 'INITIATED', 'FAILED', 'FLAGGED'].map((s) => (
            <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s}</option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {accountsQ.loading || loading ? (
          <div className="grid place-items-center py-20 text-brand-600"><Spinner size={26} /></div>
        ) : errorMsg ? (
          <EmptyState icon={Icon.List} title="Couldn’t load transactions" subtitle={errorMsg} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Icon.List} title="No transactions found"
            subtitle="Try a different account or clear your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">To</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.txnReference} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{t.txnReference}</td>
                    <td className="px-4 py-3">{t.transferType}</td>
                    <td className="px-4 py-3 font-mono text-xs">{t.destAccountNumber}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink-800">{formatMoney(t.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(t.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelected(t)} className="text-brand-600 hover:text-brand-700" aria-label="Details">
                        <Icon.Arrow className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !errorMsg && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
            <span className="text-slate-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="ghost" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Details modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Transaction details"
        footer={<Button onClick={() => setSelected(null)}>Close</Button>}>
        {selected && (
          <dl className="space-y-2.5 text-sm">
            {[
              ['Reference', selected.txnReference, true],
              ['Type', `${selected.transferType} transfer`],
              ['Source account', selected.sourceAccountNumber, true],
              ['Destination', `${selected.destAccountNumber} (${selected.destIfsc})`, true],
              ['Amount', formatMoney(selected.amount)],
              ['Remarks', selected.remarks || '—'],
              ['Created', formatDateTime(selected.createdAt)],
            ].map(([k, v, mono]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-slate-500">{k}</dt>
                <dd className={`text-right text-ink-800 ${mono ? 'font-mono text-xs' : 'font-medium'}`}>{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Status</dt>
              <dd><StatusBadge status={selected.status} /></dd>
            </div>
            {selected.failureReason && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                <span className="font-semibold">Failure reason:</span> {selected.failureReason}
              </div>
            )}
          </dl>
        )}
      </Modal>
    </div>
  );
}
