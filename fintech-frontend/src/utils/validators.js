// Validation rules mirror the backend's Bean Validation annotations exactly,
// so the client rejects the same inputs the server would (fail fast, fewer round-trips).

export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;       // matches backend @Pattern
export const ACCOUNT_REGEX = /^\d{9,18}$/;                 // 9-18 digits
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const required = (v) => (v == null || String(v).trim() === '' ? 'This field is required' : '');

export const validators = {
  username: (v) => {
    if (required(v)) return required(v);
    if (v.length < 3 || v.length > 50) return 'Username must be 3–50 characters';
    return '';
  },
  password: (v) => {
    if (required(v)) return required(v);
    if (v.length < 6) return 'Password must be at least 6 characters';
    return '';
  },
  email: (v) => {
    if (required(v)) return required(v);
    if (!EMAIL_REGEX.test(v)) return 'Enter a valid email address';
    return '';
  },
  fullName: (v) => required(v),
  ifsc: (v) => {
    if (required(v)) return required(v);
    if (!IFSC_REGEX.test(v)) return 'Invalid IFSC (e.g. FINB0001234)';
    return '';
  },
  accountNumber: (v) => {
    if (required(v)) return required(v);
    if (!ACCOUNT_REGEX.test(v)) return 'Account number must be 9–18 digits';
    return '';
  },
  amount: (v, { min } = {}) => {
    if (required(v)) return required(v);
    const n = Number(v);
    if (Number.isNaN(n) || n <= 0) return 'Enter a valid amount';
    if (min != null && n < min) return `Amount must be at least ${min.toLocaleString('en-IN')}`;
    return '';
  },
};

// Runs a field->rule map against values; returns { errors, isValid }.
export function runValidation(values, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const msg = rule(values[field]);
    if (msg) errors[field] = msg;
  }
  return { errors, isValid: Object.keys(errors).length === 0 };
}
