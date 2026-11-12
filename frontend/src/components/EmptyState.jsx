import Icon from './Icon';

export default function EmptyState({ icon = 'info', title, children, action, compact = false }) {
  return (
    <div className={`rounded-xl border border-dashed border-line bg-white/60 text-center ${compact ? 'px-5 py-8' : 'px-6 py-14'}`}>
      <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-tint text-brand">
        <Icon name={icon} />
      </span>
      <h2 className="text-base font-bold">{title}</h2>
      {children && <p className="mx-auto mt-1 max-w-md text-sm text-muted">{children}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
