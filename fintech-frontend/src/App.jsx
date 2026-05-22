import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import AppLayout from './layouts/AppLayout';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import CreateAccount from './pages/CreateAccount';
import Beneficiaries from './pages/Beneficiaries';
import RtgsTransfer from './pages/RtgsTransfer';
import NeftTransfer from './pages/NeftTransfer';
import Transactions from './pages/Transactions';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Public auth routes (redirect to dashboard if already signed in) */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Protected app routes share the sidebar/topbar layout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/new" element={<CreateAccount />} />
        <Route path="/beneficiaries" element={<Beneficiaries />} />
        <Route path="/transfer/rtgs" element={<RtgsTransfer />} />
        <Route path="/transfer/neft" element={<NeftTransfer />} />
        <Route path="/transactions" element={<Transactions />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
