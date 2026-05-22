// Indian-style currency formatting; backend amounts are plain numbers.
export const formatMoney = (value) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 2,
  }).format(n);
};

export const formatDateTime = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
};

// Generates a unique idempotency key for a transfer attempt.
export const newIdempotencyKey = () =>
  `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
