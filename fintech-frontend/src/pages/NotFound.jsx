import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <div className="text-center">
        <p className="font-display text-6xl font-bold text-ink-800">404</p>
        <p className="mt-2 text-slate-500">This page doesn’t exist.</p>
        <Link to="/dashboard" className="btn-primary mt-5 inline-flex">Back to dashboard</Link>
      </div>
    </div>
  );
}
