import { apiGet, apiPost } from "./api.client";

type NotificationPreferenceResponse = {
  enabled?: boolean;
};

function readEnabledFlag(payload: NotificationPreferenceResponse): boolean {
  if (typeof payload.enabled === "boolean") {
    return payload.enabled;
  }
  return false;
}

export async function getServerNotificationPreferencesEnabled(): Promise<boolean> {
  const response = await apiGet<NotificationPreferenceResponse>(
    "/users/notifications/enabled",
  );
  return readEnabledFlag(response ?? {});
}

export async function sendNotificationTokenToBackend(
  token: string,
): Promise<void> {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    throw new Error("Push token is required");
  }

  await apiPost<unknown>("/users/notifications/token", {
    token: normalizedToken,
  });
  return;
}
