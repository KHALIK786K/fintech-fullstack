import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { accountService } from '../services/accountService';
import { beneficiaryService } from '../services/beneficiaryService';
import { transferService } from '../services/transferService';
import { useAsync } from '../hooks/useAsync';
import { useForm } from '../hooks/useForm';
import { validators } from '../utils/validators';
import { newIdempotencyKey, formatMoney } from '../utils/format';
import { extractError } from '../services/api';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import { Icon } from '../components/ui/Icon';

const RTGS_MIN = 200000; // mirrors backend app.rtgs.min-amount

// type: 'RTGS' | 'NEFT'
export default function TransferForm({ type }) {
  const isRtgs = type === 'RTGS';
  const accountsQ = useAsync(() => accountService.myAccounts(), []);
  const benesQ = useAsync(() => beneficiaryService.list(), []);
  const accounts = accountsQ.data || [];
  const beneficiaries = benesQ.data || [];

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState(null); // transaction returned by backend

  const form = useForm(
    {
      sourceAccountNumber: '',
      destAccountNumber: '',
      destIfsc: '',
      amount: '',
      remarks: '',
    },
    {
      sourceAccountNumber: validators.accountNumber,
      destAccountNumber: validators.accountNumber,
      destIfsc: validators.ifsc,
      // RTGS enforces a minimum amount; NEFT just needs a positive amount.
      amount: (v) => validators.amount(v, isRtgs ? { min: RTGS_MIN } : {}),
    }
  );

  const selectedSource = useMemo(
    () => accounts.find((a) => a.accountNumber === form.values.sourceAccountNumber),
    [accounts, form.values.sourceAccountNumber]
  );

  // When a beneficiary is picked, auto-fill destination account + IFSC.
  const onPickBeneficiary = (e) => {
    const b = beneficiaries.find((x) => String(x.id) === e.target.value);
    if (b) {
      form.setValue('destAccountNumber', b.accountNumber);
      form.setValue('destIfsc', b.ifscCode);
    }
  };

  const openConfirm = (e) => {
    e.preventDefault();
    if (!form.validate()) return;
    // Extra client-side guard: don't allow sending more than the source balance.
    if (selectedSource && Number(form.values.amount) > Number(selectedSource.balance)) {
      form.setErrors((er) => ({ ...er, amount: 'Amount exceeds available balance' }));
      return;
    }
    setConfirmOpen(true);
  };

  const submitTransfer = async () => {
    form.setSubmitting(true);
    try {
      const payload = {
        ...form.values,
        destIfsc: form.values.destIfsc.toUpperCase(),
        amount: Number(form.values.amount),
        // Generate a fresh idempotency key per confirmed attempt so retries are safe.
        idempotencyKey: newIdempotencyKey(),
      };
      const fn = isRtgs ? transferService.rtgs : transferService.neft;
      const txn = await fn(payload);
      setResult(txn);
      setConfirmOpen(false);
      toast.success(isRtgs ? 'RTGS transfer completed' : 'NEFT transfer queued');
      form.reset();
      accountsQ.refetch(); // balance changed
    } catch (err) {
      setConfirmOpen(false);
      toast.error(extractError(err, 'Transfer failed'));
    } finally {
      form.setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Info banner explaining the rail */}
      <div className={`card flex items-start gap-3 p-4 ${isRtgs ? 'border-l-4 border-l-sky-500' : 'border-l-4 border-l-amber-500'}`}>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${isRtgs ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600'}`}>
          {isRtgs ? <Icon.Bolt className="h-5 w-5" /> : <Icon.Clock className="h-5 w-5" />}
        </span>
        <div className="text-sm">
          <p className="font-semibold text-ink-800">{isRtgs ? 'RTGS — instant settlement' : 'NEFT — batch settlement'}</p>
          <p className="text-slate-500">
            {isRtgs
              ? `High-value transfers settle immediately. Minimum amount ${formatMoney(RTGS_MIN)}.`
              : 'Money is debited now and settled in the next batch window. Status starts as PROCESSING.'}
          </p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={openConfirm} className="space-y-4" noValidate>
          {/* Source account */}
          <Select label="From account" name="sourceAccountNumber"
            value={form.values.sourceAccountNumber} onChange={form.handleChange}
            error={form.errors.sourceAccountNumber}>
            <option value="">Select source account…</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.accountNumber}>
                {a.accountNumber} — {formatMoney(a.balance)}
              </option>
            ))}
          </Select>

          {/* Beneficiary quick-pick */}
          {beneficiaries.length > 0 && (
            <Select label="Pick a saved beneficiary (optional)" name="_bene" onChange={onPickBeneficiary} defaultValue="">
              <option value="">Choose to auto-fill destination…</option>
              {beneficiaries.map((b) => (
                <option key={b.id} value={b.id}>{b.name} — {b.accountNumber}</option>
              ))}
            </Select>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Destination account" name="destAccountNumber" placeholder="100000000002"
              value={form.values.destAccountNumber} onChange={form.handleChange} error={form.errors.destAccountNumber} />
            <Input label="Destination IFSC" name="destIfsc" placeholder="FINB0001234"
              value={form.values.destIfsc} onChange={form.handleChange} error={form.errors.destIfsc}
              style={{ textTransform: 'uppercase' }} />
          </div>

          <Input label="Amount (INR)" name="amount" type="number" min="1" step="0.01"
            placeholder={isRtgs ? '200000' : '5000'}
            value={form.values.amount} onChange={form.handleChange} error={form.errors.amount}
            hint={isRtgs ? `Minimum ${formatMoney(RTGS_MIN)}` : undefined} />

          <Input label="Remarks (optional)" name="remarks" placeholder="Rent / Invoice #123"
            value={form.values.remarks} onChange={form.handleChange} />

          <div className="flex justify-end pt-2">
            <Button type="submit">Review transfer <Icon.Arrow className="h-4 w-4" /></Button>
          </div>
        </form>
      </div>

      {/* Confirmation popup */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm transfer"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Back</Button>
            <Button loading={form.submitting} onClick={submitTransfer}>
              Confirm &amp; send {formatMoney(form.values.amount || 0)}
            </Button>
          </>
        )}>
        <dl className="space-y-2.5 text-sm">
          {[
            ['Type', `${type} transfer`],
            ['From', form.values.sourceAccountNumber],
            ['To', `${form.values.destAccountNumber} (${(form.values.destIfsc || '').toUpperCase()})`],
            ['Amount', formatMoney(form.values.amount || 0)],
            ['Remarks', form.values.remarks || '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-slate-500">{k}</dt>
              <dd className="text-right font-medium text-ink-800">{v}</dd>
            </div>
          ))}
        </dl>
        {isRtgs && (
          <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-700">
            This RTGS transfer settles immediately and cannot be reversed.
          </p>
        )}
      </Modal>

      {/* Result modal */}
      <Modal open={!!result} onClose={() => setResult(null)} title="Transfer submitted"
        footer={<Button onClick={() => setResult(null)}>Done</Button>}>
        {result && (
          <div className="text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Icon.Check className="h-7 w-7" />
            </div>
            <p className="font-display text-lg font-semibold text-ink-800">{formatMoney(result.amount)}</p>
            <p className="mt-1 text-sm text-slate-500">to {result.destAccountNumber}</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <StatusBadge status={result.status} />
            </div>
            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
              Ref: {result.txnReference}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
