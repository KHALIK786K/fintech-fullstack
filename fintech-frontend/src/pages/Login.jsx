import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from '../layouts/AuthShell';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useForm } from '../hooks/useForm';
import { validators } from '../utils/validators';
import { useAuth, extractError } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const form = useForm(
    { username: '', password: '' },
    { username: validators.username, password: validators.password }
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.validate()) return;
    form.setSubmitting(true);
    try {
      await login(form.values);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(extractError(err, 'Login failed'));
    } finally {
      form.setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-800">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Access your Meridian banking console.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Username" name="username" autoComplete="username"
          placeholder="alice" value={form.values.username}
          onChange={form.handleChange} error={form.errors.username}
        />
        <Input
          label="Password" name="password" type="password" autoComplete="current-password"
          placeholder="••••••••" value={form.values.password}
          onChange={form.handleChange} error={form.errors.password}
        />
        <Button type="submit" loading={form.submitting} className="w-full">Sign in</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to Meridian?{' '}
        <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">Create an account</Link>
      </p>

      <div className="mt-6 rounded-xl bg-slate-100 p-3 text-center text-xs text-slate-500">
        Demo login — <span className="font-mono font-semibold">alice</span> / <span className="font-mono font-semibold">Password123</span>
      </div>
    </AuthShell>
  );
}
