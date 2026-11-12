import { Link } from 'react-router-dom';
import Icon from './Icon';

const SIZES = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
};

const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'border border-line bg-white text-brand-ink hover:border-brand/40 hover:bg-brand-tint',
  ghost: 'text-brand hover:bg-brand-tint',
  danger: 'bg-red-700 text-white hover:bg-red-800',
  'danger-outline': 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
  lime: 'bg-lime text-brand-ink hover:bg-lime-dark',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  className = '',
  to,
  type = 'button',
  ...rest
}) {
  const classes = `inline-flex items-center justify-center whitespace-nowrap rounded font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${className}`;

  const content = (
    <>
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      ) : (
        icon && <Icon name={icon} className={size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'} />
      )}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled || loading} className={classes} {...rest}>
      {content}
    </button>
  );
}
