import { useId, useState } from 'react';
import Icon from './Icon';

export function Field({ label, hint, error, optional = false, htmlFor, className = '', children, aside }) {
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <label htmlFor={htmlFor} className="text-sm font-semibold text-brand-ink">
            {label}
            {optional && <span className="ml-1 font-normal text-muted">(optional)</span>}
          </label>
          {aside}
        </div>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-[13px] text-red-700">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-[13px] text-muted">{hint}</p>
      )}
    </div>
  );
}

export default function Input({ label, hint, error, optional, className = '', type = 'text', ...rest }) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';

  return (
    <Field label={label} hint={hint} error={error} optional={optional} htmlFor={id} className={className}>
      <div className="relative">
        <input
          id={id}
          type={isPassword && reveal ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          className={`field ${isPassword ? 'pr-11' : ''}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal(r => !r)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-brand-ink"
            aria-label={reveal ? 'Hide password' : 'Show password'}
          >
            <Icon name={reveal ? 'eyeOff' : 'eye'} className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>
    </Field>
  );
}

export function Textarea({ label, hint, error, optional, className = '', ...rest }) {
  const id = useId();

  return (
    <Field label={label} hint={hint} error={error} optional={optional} htmlFor={id} className={className}>
      <textarea id={id} aria-invalid={error ? 'true' : undefined} className="field resize-y" {...rest} />
    </Field>
  );
}

export function Select({ label, hint, error, optional, className = '', children, ...rest }) {
  const id = useId();

  return (
    <Field label={label} hint={hint} error={error} optional={optional} htmlFor={id} className={className}>
      <div className="relative">
        <select id={id} aria-invalid={error ? 'true' : undefined} className="field appearance-none pr-10" {...rest}>
          {children}
        </select>
        <Icon name="chevronDown" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </div>
    </Field>
  );
}
