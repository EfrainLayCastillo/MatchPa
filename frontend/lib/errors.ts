import type { ApiFieldError } from "./types";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly errors: ApiFieldError[],
  ) {
    super(errors[0]?.message ?? `Error ${status}`);
  }
}
