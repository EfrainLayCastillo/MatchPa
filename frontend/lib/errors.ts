import type { ApiFieldError } from "./types";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly errors: ApiFieldError[],
    readonly code?: string,
  ) {
    super(errors[0]?.message ?? `Error ${status}`);
  }
}

export const answeredMessage = (error: unknown) =>
  error instanceof ApiError && error.status >= 400 && error.status < 500 ? error.message : undefined;
