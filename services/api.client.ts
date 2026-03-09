import { buildApiUrl } from "../constants/env";
import { mapApiError } from "../mappers/map-api-error";
import { getAuthToken } from "./token.storage";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestConfig = {
  method: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
};

type AuthTokenProvider = () => Promise<string | null>;

let authTokenProvider: AuthTokenProvider | null = null;

function setAuthTokenProvider(provider: AuthTokenProvider) {
  authTokenProvider = provider;
}

async function buildHeaders(
  headers?: Record<string, string>,
): Promise<Record<string, string>> {
  const token = authTokenProvider ? await authTokenProvider() : null;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers ?? {}),
  };
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => "");
  return text || null;
}

async function request<T>(path: string, config: RequestConfig): Promise<T> {
  const url = buildApiUrl(path);

  let response: Response;

  try {
    response = await fetch(url, {
      method: config.method,
      headers: await buildHeaders(config.headers),
      body: config.body !== undefined ? JSON.stringify(config.body) : undefined,
    });
  } catch (error) {
    throw mapApiError(error);
  }

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw mapApiError({
      response: {
        status: response.status,
        data: payload,
      },
    });
  }

  return payload as T;
}

setAuthTokenProvider(getAuthToken);

const apiClient = {
  get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return request<T>(path, { method: "GET", headers });
  },

  post<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return request<T>(path, { method: "POST", body, headers });
  },

  put<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return request<T>(path, { method: "PUT", body, headers });
  },

  delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return request<T>(path, { method: "DELETE", headers });
  },
};

export async function apiGet<T>(
  path: string,
  headers?: Record<string, string>,
): Promise<T> {
  return apiClient.get<T>(path, headers);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  headers?: Record<string, string>,
): Promise<T> {
  return apiClient.post<T>(path, body, headers);
}

export async function apiDelete<T>(
  path: string,
  headers?: Record<string, string>,
): Promise<T> {
  return apiClient.delete<T>(path, headers);
}

export async function apiPut<T>(
  path: string,
  body: unknown,
  headers?: Record<string, string>,
): Promise<T> {
  return apiClient.put<T>(path, body, headers);
}
