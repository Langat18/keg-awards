export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    brown:   'bg-[#7F622C]/10 text-[#7F622C]',
    lime:    'bg-[#CBD300]/20 text-[#5c4620]',
    blue:    'bg-blue-100 text-blue-700',
    green:   'bg-green-100 text-green-700',
    amber:   'bg-amber-100 text-amber-700',
    red:     'bg-red-100 text-red-600',
  };

  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${variants[variant] ?? variants.default}`}>
      {children}
    </span>
  );
}