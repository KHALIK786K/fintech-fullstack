import { useState } from 'react';
import toast from 'react-hot-toast';
import { beneficiaryService } from '../services/beneficiaryService';
import { useAsync } from '../hooks/useAsync';
import { useForm } from '../hooks/useForm';
import { validators } from '../utils/validators';
import { extractError } from '../services/api';
import { Icon } from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';

export default function Beneficiaries() {
  const { data, loading, refetch } = useAsync(() => beneficiaryService.list(), []);
  const beneficiaries = data || [];
  const [showAdd, setShowAdd] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const form = useForm(
    { name: '', accountNumber: '', ifscCode: '', bankName: '' },
    {
      name: validators.fullName,
      accountNumber: validators.accountNumber,
      ifscCode: validators.ifsc,
    }
  );

  const onAdd = async (e) => {
    e.preventDefault();
    if (!form.validate()) return;
    form.setSubmitting(true);
    try {
      await beneficiaryService.add({
        ...form.values,
        ifscCode: form.values.ifscCode.toUpperCase(),
      });
      toast.success('Beneficiary added');
      setShowAdd(false);
      form.reset();
      refetch();
    } catch (err) {
      toast.error(extractError(err, 'Could not add beneficiary'));
    } finally {
      form.setSubmitting(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await beneficiaryService.remove(toDelete.id);
      toast.success('Beneficiary removed');
      setToDelete(null);
      refetch();
    } catch (err) {
      toast.error(extractError(err, 'Could not remove beneficiary'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{beneficiaries.length} saved payee{beneficiaries.length !== 1 ? 's' : ''}</p>
        <Button onClick={() => setShowAdd(true)}><Icon.Plus className="h-4 w-4" /> Add beneficiary</Button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-brand-600"><Spinner size={26} /></div>
      ) : beneficiaries.length === 0 ? (
        <div className="card">
          <EmptyState icon={Icon.Users} title="No beneficiaries yet"
            subtitle="Add a payee so you can transfer to them in one tap."
            action={<Button onClick={() => setShowAdd(true)}>Add beneficiary</Button>} />
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {beneficiaries.map((b) => (
            <div key={b.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-violet-50 font-semibold text-violet-600">
                  {b.name?.[0]?.toUpperCase()}
                </span>
                <div>
                  <p className="font-medium text-ink-800">{b.name}</p>
                  <p className="font-mono text-xs text-slate-400">
                    {b.accountNumber} · {b.ifscCode}{b.bankName ? ` · ${b.bankName}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={b.verified ? 'VERIFIED' : 'PENDING'} />
                <button onClick={() => setToDelete(b)} className="text-slate-400 hover:text-red-600" aria-label="Delete">
                  <Icon.Trash className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add beneficiary"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button form="bene-form" type="submit" loading={form.submitting}>Add</Button>
          </>
        )}>
        <form id="bene-form" onSubmit={onAdd} className="space-y-4" noValidate>
          <Input label="Beneficiary name" name="name" placeholder="Bob Customer"
            value={form.values.name} onChange={form.handleChange} error={form.errors.name} />
          <Input label="Account number" name="accountNumber" placeholder="100000000002"
            value={form.values.accountNumber} onChange={form.handleChange} error={form.errors.accountNumber} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="IFSC code" name="ifscCode" placeholder="FINB0001234"
              value={form.values.ifscCode} onChange={form.handleChange} error={form.errors.ifscCode}
              style={{ textTransform: 'uppercase' }} />
            <Input label="Bank name (optional)" name="bankName" placeholder="FinBank"
              value={form.values.bankName} onChange={form.handleChange} />
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={onDelete}
        danger loading={deleting} title="Remove beneficiary"
        confirmText="Remove"
        message={`Remove ${toDelete?.name} (${toDelete?.accountNumber}) from your saved payees?`} />
    </div>
  );
}
