export type ApiErrorCode =
  | "InvalidCredentials"
  | "InsufficientBalance"
  | "GoalCompleted"
  | "Forbidden"
  | "ValidationError"
  | "INTERNAL_ERROR"
  | "NetworkError"
  | "UnknownError";

export interface ApiError {
  message: string;
  code?: ApiErrorCode | string;
  status: number;
}

export function isApiError(error: unknown): error is ApiError {
  if (!error || typeof error !== "object") {
    return false;
  }

  const value = error as Record<string, unknown>;
  return (
    typeof value.message === "string" &&
    typeof value.status === "number" &&
    Number.isFinite(value.status)
  );
}