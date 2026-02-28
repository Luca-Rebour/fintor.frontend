import { buildApiUrl } from "../constants/env";
import { getAuthToken } from "./token.storage";

type RequestOptions = {
  method: "GET" | "POST";
  body?: unknown;
  headers?: Record<string, string>;
};

async function requestJson<T>(
  path: string,
  options: RequestOptions,
): Promise<T> {
  const url = buildApiUrl(path);
  const response = await fetch(url, {
    method: options.method,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const apiMessage =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : null;

    throw new Error(apiMessage || `Request failed (${response.status})`);
  }

  return payload as T;
}

export async function apiGet<T>(
  path: string,
  headers?: Record<string, string>,
): Promise<T> {
  const token = await getAuthToken();
  const authHeaders = token
    ? {
        ...(headers ?? {}),
        Authorization: `Bearer ${token}`,
      }
    : headers;

    console.log(path);
    
  return requestJson<T>(path, { method: "GET", headers: authHeaders });
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  headers?: Record<string, string>,
): Promise<T> {
  const token = await getAuthToken();
  return requestJson<T>(path, {
    method: "POST",
    body,
    headers: token
      ? { ...(headers ?? {}), Authorization: `Bearer ${token}` }
      : headers,
  });
}
