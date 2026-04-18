const FormField = ({
  label,
  error,
  hint,
  children,
}) => {
  return (
    <div>
      {label ? <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label> : null}
      {children}
      {hint && !error ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
};

export default FormField;
