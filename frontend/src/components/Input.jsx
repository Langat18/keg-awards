

export default function Input({
  label,
  hint,
  error,
  type = 'text',
  required = false,
  className = '',
  ...props
}) {
  const base = `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
    error
      ? 'border-red-400 focus:ring-red-300'
      : 'border-gray-300 focus:ring-[#7F622C] focus:border-[#7F622C]'
  }`;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {!required && (
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          )}
        </label>
      )}
      <input type={type} required={required} className={base} {...props} />
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}