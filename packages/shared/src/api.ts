/** Base path every versioned API route is served under. */
export const API_PREFIX = '/api/v1' as const;

/** Successful single-resource response envelope. */
export interface ApiSuccess<T> {
  readonly data: T;
}

/** Successful list response envelope with pagination info. */
export interface ApiPage<T> {
  readonly data: readonly T[];
  readonly page: {
    readonly limit: number;
    readonly nextCursor: string | null;
  };
}

/** Error response envelope. `code` is stable and machine-readable. */
export interface ApiError {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: Readonly<Record<string, unknown>>;
  };
}