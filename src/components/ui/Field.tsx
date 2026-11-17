import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type TouchState = 'idle' | 'valid' | 'invalid';

function stateClass(touched: boolean, error?: string, value?: string) {
  if (!touched || !value) return '';
  return error ? 'is-invalid' : 'is-valid';
}

interface FieldMetaProps {
  label: string;
  error?: string;
  hint?: string;
  counter?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function FieldShell({ label, error, hint, counter, htmlFor, children }: FieldMetaProps) {
  return (
    <div className="field">
      <div className="field__meta">
        <label className="field__label" htmlFor={htmlFor}>
          {label}
        </label>
        {counter ? <span className="field__counter">{counter}</span> : null}
      </div>
      {children}
      {error ? <span className="field__error">{error}</span> : hint ? <span className="field__hint">{hint}</span> : <span className="field__error" />}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  touched?: boolean;
  counter?: string;
  prefix?: string;
}

export function TextField({
  label,
  error,
  hint,
  touched = false,
  counter,
  prefix,
  id,
  className,
  ...props
}: TextFieldProps) {
  const fieldId = id ?? props.name;
  const cls = stateClass(touched, error, String(props.value ?? ''));

  const input = (
    <input
      id={fieldId}
      className={`input ${cls} ${className ?? ''}`.trim()}
      aria-invalid={!!error}
      {...props}
    />
  );

  return (
    <FieldShell label={label} error={touched ? error : undefined} hint={hint} counter={counter} htmlFor={fieldId}>
      {prefix ? (
        <div className={`input-prefix ${cls}`}>
          <span className="input-prefix__affix">{prefix}</span>
          {input}
        </div>
      ) : (
        input
      )}
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  touched?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({
  label,
  error,
  hint,
  touched = false,
  options,
  placeholder,
  id,
  ...props
}: SelectFieldProps) {
  const fieldId = id ?? props.name;
  const cls = stateClass(touched, error, String(props.value ?? ''));

  return (
    <FieldShell label={label} error={touched ? error : undefined} hint={hint} htmlFor={fieldId}>
      <select id={fieldId} className={`select ${cls}`} aria-invalid={!!error} {...props}>
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  touched?: boolean;
  counter?: string;
}

export function TextAreaField({
  label,
  error,
  hint,
  touched = false,
  counter,
  id,
  ...props
}: TextAreaFieldProps) {
  const fieldId = id ?? props.name;
  const cls = stateClass(touched, error, String(props.value ?? ''));

  return (
    <FieldShell label={label} error={touched ? error : undefined} hint={hint} counter={counter} htmlFor={fieldId}>
      <textarea id={fieldId} className={`textarea ${cls}`} aria-invalid={!!error} {...props} />
    </FieldShell>
  );
}

export type { TouchState };
