import { useState } from 'react';
import { Icon } from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function Topbar({ title, onMenu }) {
  const { logout } = useAuth();
  const [confirm, setConfirm] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button className="md:hidden text-ink-600" onClick={onMenu} aria-label="Open menu">
          <Icon.List className="h-6 w-6" />
        </button>
        <h1 className="font-display text-lg font-semibold text-ink-800">{title}</h1>
      </div>
      <button className="btn-ghost py-2" onClick={() => setConfirm(true)}>
        <Icon.Logout className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
      </button>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); logout(); }}
        title="Sign out?"
        message="You will need to sign in again to access your accounts."
        confirmText="Sign out"
      />
    </header>
  );
}
