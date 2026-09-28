/**
 * Input whose label sits inside the box and lifts to the upper area once the
 * field is focused or filled — the pattern used on Facebook's sign-in form.
 * The label doubles as the accessible name, so no placeholder is needed.
 */
export default function FloatingField({
  id,
  label,
  invalid = false,
  trailing = null,
  className = '',
  ...inputProps
}) {
  return (
    <div className="relative">
      <input
        id={id}
        placeholder=" "
        aria-invalid={invalid || undefined}
        className={`peer h-[3.75rem] w-full rounded-lg border bg-surface pb-2 pl-3 pt-7 text-[15px] leading-tight text-text-primary outline-none transition-colors hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-focus-ring ${
          trailing ? 'pr-11' : 'pr-3'
        } ${invalid ? 'border-danger' : 'border-border'} ${className}`}
        {...inputProps}
      />

      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-3 top-[0.85rem] text-[11px] leading-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-focus:top-[0.85rem] peer-focus:translate-y-0 peer-focus:text-[11px] ${
          invalid ? 'text-danger-text' : 'text-text-muted'
        }`}
      >
        {label}
      </label>

      {trailing && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</span>
      )}
    </div>
  )
}
