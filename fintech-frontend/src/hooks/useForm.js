import { useState, useCallback } from 'react';
import { runValidation } from '../utils/validators';

// Minimal form helper: holds values/errors, validates against a rules map,
// and exposes handlers. Keeps page components free of repetitive state code.
export function useForm(initial, rules = {}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    // Clear a field's error as soon as the user edits it.
    setErrors((er) => (er[name] ? { ...er, [name]: '' } : er));
  }, []);

  const setValue = useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
  }, []);

  const validate = useCallback(() => {
    const { errors: errs, isValid } = runValidation(values, rules);
    setErrors(errs);
    return isValid;
  }, [values, rules]);

  const reset = useCallback(() => { setValues(initial); setErrors({}); }, [initial]);

  return { values, errors, submitting, setSubmitting, handleChange, setValue, validate, reset, setErrors };
}
