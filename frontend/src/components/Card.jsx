export default function Card({ as: Tag = 'section', className = '', padded = true, children, ...rest }) {
  return (
    <Tag className={`rounded-xl border border-line bg-white ${padded ? 'p-5 sm:p-6' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, action, className = '' }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-base font-bold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
