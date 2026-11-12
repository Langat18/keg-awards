const TONES = {
  neutral: 'bg-canvas text-muted border-line',
  live: 'bg-lime-tint text-brand-ink border-lime-dark/40',
  done: 'bg-brand-tint text-brand-dark border-brand/20',
  good: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  bad: 'bg-red-50 text-red-700 border-red-200',
};

export default function Badge({ tone = 'neutral', dot = false, children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${tone === 'live' ? 'bg-lime-dark' : 'bg-current'}`} />}
      {children}
    </span>
  );
}
