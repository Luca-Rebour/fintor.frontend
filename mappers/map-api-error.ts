import { ApiError, ApiErrorCode } from "../types/api/api-error";

type ErrorPayload = {
  message?: unknown;
  code?: unknown;
};

type ErrorWithResponse = {
  response?: {
    status?: unknown;
    data?: unknown;
  };
  status?: unknown;
  data?: unknown;
  message?: unknown;
};

function toFiniteStatus(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asPayload(value: unknown): ErrorPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as ErrorPayload;
}

function isNetworkError(error: ErrorWithResponse): boolean {
  if (!error.response) {
    return true;
  }

  if (typeof error.message !== "string") {
    return false;
  }

  const normalized = error.message.toLowerCase();
  return (
    normalized.includes("network") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("request failed")
  );
}

export function mapApiError(error: unknown): ApiError {
  const source = (error ?? {}) as ErrorWithResponse;

  const responseData = asPayload(source.response?.data);
  const fallbackData = asPayload(source.data);

  const status = toFiniteStatus(source.response?.status ?? source.status);
  const backendMessage = responseData?.message ?? fallbackData?.message;
  const backendCode = responseData?.code ?? fallbackData?.code;
  const normalizedBackendCode = typeof backendCode === "string" ? backendCode : undefined;

  function resolveFallbackCode(): ApiErrorCode {
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

  if (typeof backendMessage === "string" && backendMessage.trim()) {
    return {
      message: backendMessage,
      code: normalizedBackendCode ?? resolveFallbackCode(),
      status,
    };
  }

  if (isNetworkError(source)) {
    return {
      message: "No se pudo conectar con el servidor.",
      code: normalizedBackendCode ?? "NetworkError",
      status,
    };
  }

  if (status === 500) {
    return {
      message: "Ocurrió un error inesperado.",
      code: normalizedBackendCode ?? "INTERNAL_ERROR",
      status,
    };
  }

  return {
    message: "Ocurrió un error.",
    code: normalizedBackendCode ?? resolveFallbackCode(),
    status,
  };
}
