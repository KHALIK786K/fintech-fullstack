import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { accountService } from '../services/accountService';
import { useForm } from '../hooks/useForm';
import { validators } from '../utils/validators';
import { extractError } from '../services/api';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';

export default function CreateAccount() {
  const navigate = useNavigate();
  const form = useForm(
    { accountHolderName: '', openingBalance: '', accountType: 'SAVINGS' },
    {
      accountHolderName: validators.fullName,
      // Opening balance is optional but must be >= 0 if provided.
      openingBalance: (v) => {
        if (v === '' || v == null) return '';
        return Number(v) < 0 ? 'Opening balance cannot be negative' : '';
      },
    }
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.validate()) return;
    form.setSubmitting(true);
    try {
      // Backend CreateAccountRequest accepts only these two fields.
      // accountType is captured for UX but not sent (no backend field yet).
      const payload = {
        accountHolderName: form.values.accountHolderName,
        openingBalance: form.values.openingBalance === '' ? 0 : Number(form.values.openingBalance),
      };
      const created = await accountService.create(payload);
      toast.success(`Account ${created.accountNumber} opened`);
      navigate('/accounts');
    } catch (err) {
      toast.error(extractError(err, 'Could not open account'));
    } finally {
      form.setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Icon.Wallet className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-800">Open a new account</h2>
            <p className="text-sm text-slate-500">A unique account number and IFSC are assigned automatically.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input label="Account holder name" name="accountHolderName"
            placeholder="Alice Customer" value={form.values.accountHolderName}
            onChange={form.handleChange} error={form.errors.accountHolderName} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Account type" name="accountType"
              value={form.values.accountType} onChange={form.handleChange}>
              <option value="SAVINGS">Savings</option>
              <option value="CURRENT">Current</option>
            </Select>
            <Input label="Opening balance (optional)" name="openingBalance" type="number" min="0" step="0.01"
              placeholder="0.00" value={form.values.openingBalance}
              onChange={form.handleChange} error={form.errors.openingBalance} />
          </div>

          <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500">
            <span className="font-semibold text-ink-600">IFSC code</span> is assigned by the bank on creation (single-branch demo: <span className="font-mono">FINB0001234</span>).
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => navigate('/accounts')}>Cancel</Button>
            <Button type="submit" loading={form.submitting}>Open account</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
