import { useCallback, useRef, useState } from "react";
import { ApiError } from "./errors";

export type FieldErrors = Partial<Record<string, string>>;

export interface FormErrors {
  fields: FieldErrors;
  form: string | null;
}

export const NO_ERRORS: FormErrors = { fields: {}, form: null };

export function toFormErrors(err: unknown, fallback: string): FormErrors {
  if (!(err instanceof ApiError)) return { fields: {}, form: fallback };
  const withField = err.errors.filter((e) => e.field);
  if (withField.length === 0) return { fields: {}, form: err.message };
  return { fields: Object.fromEntries(withField.map((e) => [e.field, e.message])), form: null };
}

function focusFirstInvalid(form: HTMLFormElement | null) {
  requestAnimationFrame(() => form?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
}

export function invalidProps(id: string, message: string | undefined) {
  return message ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` } : {};
}

export function useFormErrors(initialForm: string | null = null) {
  const [errors, setErrors] = useState<FormErrors>(() => ({ fields: {}, form: initialForm }));
  const formRef = useRef<HTMLFormElement>(null);

  const fail = useCallback((next: FormErrors) => {
    setErrors(next);
    focusFirstInvalid(formRef.current);
  }, []);
  const reset = useCallback(() => setErrors(NO_ERRORS), []);
  const clearField = useCallback(
    (name: string) => setErrors((prev) => (prev.fields[name] ? { ...prev, fields: { ...prev.fields, [name]: undefined } } : prev)),
    [],
  );

  return { errors, formRef, fail, reset, clearField };
}
