import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

export type NotificationPermissionResult = {
  granted: boolean;
  expoPushToken: string | null;
};

function getProjectId(): string | undefined {
  const fromEasConfig = Constants.easConfig?.projectId;
  if (typeof fromEasConfig === "string" && fromEasConfig.trim()) {
    return fromEasConfig;
  }

  const fromExpoConfig = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;
  if (typeof fromExpoConfig === "string" && fromExpoConfig.trim()) {
    return fromExpoConfig;
  }

  return undefined;
}

export async function requestPushNotificationPermissionAndToken(): Promise<NotificationPermissionResult> {
  const currentPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = currentPermissions.status;

  if (finalStatus !== "granted") {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermissions.status;
  }

  if (finalStatus !== "granted") {
    return {
      granted: false,
      expoPushToken: null,
    };
  }

  const projectId = getProjectId();

  let resolvedToken: string | null = null;

  try {
    const pushTokenResponse = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    resolvedToken = pushTokenResponse.data ?? null;
  } catch {
    // Fallback for environments where Expo push token cannot be resolved (e.g. missing projectId).
    try {
      const devicePushToken = await Notifications.getDevicePushTokenAsync();
      resolvedToken = devicePushToken.data ? String(devicePushToken.data) : null;
    } catch {
      resolvedToken = null;
    }
  }

  return {
    granted: true,
    expoPushToken: resolvedToken,
  };
}

export async function areNotificationsEnabledOnDevice(): Promise<boolean> {
  const permissions = await Notifications.getPermissionsAsync();
  return permissions.status === "granted";
}
