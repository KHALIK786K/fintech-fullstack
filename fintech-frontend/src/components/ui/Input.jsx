export default function Input({ label, error, hint, id, className = '', ...rest }) {
  const inputId = id || rest.name;
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="field-label">{label}</label>}
      <input
        id={inputId}
        className={`field-input ${error ? 'field-input--error' : ''}`}
        aria-invalid={!!error}
        {...rest}
      />
      {error ? <p className="field-error">{error}</p>
             : hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
