

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  size = 'md',
}) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-6 py-3',
  };

  const variants = {
    primary: 'bg-[#7F622C] text-white hover:bg-[#5c4620]',
    lime:    'bg-[#CBD300] text-[#5c4620] hover:bg-[#a8ac00]',
    outline: 'border border-[#7F622C] text-[#7F622C] hover:bg-[#7F622C]/5',
    danger:  'bg-red-600 text-white hover:bg-red-700',
    ghost:   'text-[#7F622C] hover:bg-[#7F622C]/5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size] ?? sizes.md} ${variants[variant] ?? variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}