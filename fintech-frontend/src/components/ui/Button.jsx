import Spinner from './Spinner';

const variants = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

export default function Button({
  variant = 'primary', loading = false, disabled, children, className = '', ...rest
}) {
  return (
    <button className={`${variants[variant]} ${className}`} disabled={disabled || loading} {...rest}>
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}
