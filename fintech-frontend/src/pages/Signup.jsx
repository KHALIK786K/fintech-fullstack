import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from '../layouts/AuthShell';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useForm } from '../hooks/useForm';
import { validators } from '../utils/validators';
import { useAuth, extractError } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const form = useForm(
    { username: '', fullName: '', email: '', password: '', confirmPassword: '' },
    {
      username: validators.username,
      fullName: validators.fullName,
      email: validators.email,
      password: validators.password,
      // Confirm-password is a client-only check (backend has no such field).
      confirmPassword: () => '',
    }
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.validate()) return;
    if (form.values.password !== form.values.confirmPassword) {
      form.setErrors((er) => ({ ...er, confirmPassword: 'Passwords do not match' }));
      return;
    }
    form.setSubmitting(true);
    try {
      // Backend signup ignores confirmPassword; send only the fields it expects.
      const { confirmPassword, ...payload } = form.values;
      await signup(payload);
      toast.success('Account created');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(extractError(err, 'Signup failed'));
    } finally {
      form.setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-800">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Start moving money in minutes.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Username" name="username" autoComplete="username"
            placeholder="alice" value={form.values.username}
            onChange={form.handleChange} error={form.errors.username} />
          <Input label="Full name" name="fullName" autoComplete="name"
            placeholder="Alice Customer" value={form.values.fullName}
            onChange={form.handleChange} error={form.errors.fullName} />
        </div>
        <Input label="Email" name="email" type="email" autoComplete="email"
          placeholder="alice@example.com" value={form.values.email}
          onChange={form.handleChange} error={form.errors.email} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Password" name="password" type="password" autoComplete="new-password"
            placeholder="••••••••" value={form.values.password}
            onChange={form.handleChange} error={form.errors.password}
            hint="At least 6 characters" />
          <Input label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password"
            placeholder="••••••••" value={form.values.confirmPassword}
            onChange={form.handleChange} error={form.errors.confirmPassword} />
        </div>
        <Button type="submit" loading={form.submitting} className="w-full">Create account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
      </p>
    </AuthShell>
  );
}
