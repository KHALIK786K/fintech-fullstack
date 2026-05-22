export default function Select({ label, error, id, children, className = '', ...rest }) {
  const selectId = id || rest.name;
  return (
    <div className={className}>
      {label && <label htmlFor={selectId} className="field-label">{label}</label>}
      <select
        id={selectId}
        className={`field-input appearance-none ${error ? 'field-input--error' : ''}`}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
