import { TFunction } from "i18next";

import { ApiErrorCode, isApiError } from "../types/api/api-error";

const CODE_ALIASES: Record<string, ApiErrorCode> = {
  INVALID_CREDENTIALS: "InvalidCredentials",
  INVALIDCREDENTIALS: "InvalidCredentials",
  INSUFFICIENT_BALANCE: "InsufficientBalance",
  INSUFFICIENTBALANCE: "InsufficientBalance",
  GOAL_COMPLETED: "GoalCompleted",
  GOALCOMPLETED: "GoalCompleted",
  FORBIDDEN: "Forbidden",
  VALIDATION_ERROR: "ValidationError",
  VALIDATIONERROR: "ValidationError",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NETWORK_ERROR: "NetworkError",
  NETWORKERROR: "NetworkError",
  UNKNOWN_ERROR: "UnknownError",
  UNKNOWNERROR: "UnknownError",
};

function normalizeCode(code: unknown): ApiErrorCode | null {
  if (typeof code !== "string") {
    return null;
  }

  const normalized = code.trim().replace(/[\s-]/g, "_").toUpperCase();
  return CODE_ALIASES[normalized] ?? null;
}

function codeFromStatus(status: number): ApiErrorCode {
  if (status === 0) {
    return "NetworkError";
  }

  if (status === 401) {
    return "InvalidCredentials";
  }

  if (status === 403) {
    return "Forbidden";
  }

  if (status === 400 || status === 422) {
    return "ValidationError";
  }

  if (status >= 500) {
    return "INTERNAL_ERROR";
  }

  return "UnknownError";
}

export function resolveApiErrorMessage(
  error: unknown,
  t: TFunction,
  fallbackKey: string,
): string {
  if (isApiError(error)) {
    const code = normalizeCode(error.code) ?? codeFromStatus(error.status);
    const translationKey = `apiErrors.${code}`;
    const translated = t(translationKey as any);

    if (translated !== translationKey) {
      return translated;
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return t(fallbackKey as any);
}
