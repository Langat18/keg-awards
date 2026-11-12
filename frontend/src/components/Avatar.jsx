import { initials } from '../lib/format';

const SIZES = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
};

export default function Avatar({ name, size = 'md', inverted = false, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${SIZES[size]} ${
        inverted ? 'bg-white/20 text-white' : 'bg-brand-tint text-brand-dark'
      } ${className}`}
    >
      {initials(name)}
    </span>
  );
}
