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
