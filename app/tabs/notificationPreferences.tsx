import { APP_COLORS } from "../../constants/colors";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { AppIcon } from "../../components/shared/AppIcon";
import { requestPushNotificationPermissionAndToken } from "../../services/notification-permissions.service";
import { sendNotificationTokenToBackend } from "../../services/notifications.service";

type NotificationFeature = {
  id: string;
  label: string;
  description: string;
  enabledByDefault: boolean;
};

const FEATURES: NotificationFeature[] = [
  {
    id: "recurring-reminders",
    label: "notifications.features.recurring.label",
    description: "notifications.features.recurring.description",
    enabledByDefault: true,
  },
  {
    id: "goal-progress",
    label: "notifications.features.goals.label",
    description: "notifications.features.goals.description",
    enabledByDefault: true,
  },
  {
    id: "large-transactions",
    label: "notifications.features.transactions.label",
    description: "notifications.features.transactions.description",
    enabledByDefault: true,
  },
];

function parseMode(input: string | string[] | undefined): "enabled" | "disabled" {
  if (Array.isArray(input)) {
    return parseMode(input[0]);
  }

  if (input === "enabled") {
    return "enabled";
  }

  return "disabled";
}

export default function NotificationPreferencesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string | string[] }>();
  const [mode, setMode] = useState<"enabled" | "disabled">(parseMode(params.mode));
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [featureToggles, setFeatureToggles] = useState<Record<string, boolean>>(
    () =>
      FEATURES.reduce<Record<string, boolean>>((acc, feature) => {
        acc[feature.id] = feature.enabledByDefault;
        return acc;
      }, {}),
  );

  const featureStates = useMemo(
    () =>
      FEATURES.map((feature) => ({
        ...feature,
        enabled: mode === "enabled" ? Boolean(featureToggles[feature.id]) : false,
      })),
    [featureToggles, mode],
  );

  async function handleEnableNotifications() {
    if (isRequestingPermission) {
      return;
    }

    try {
      setIsRequestingPermission(true);
      const permissionResult = await requestPushNotificationPermissionAndToken();

      if (!permissionResult.granted) {
        Alert.alert(t("notifications.permissionDeniedTitle"), t("notifications.permissionDeniedMessage"));
        return;
      }

      if (!permissionResult.expoPushToken) {
        Alert.alert(t("notifications.errorTitle"), t("notifications.tokenUnavailable"));
        return;
      }

      await sendNotificationTokenToBackend(permissionResult.expoPushToken);
      setMode("enabled");
      Alert.alert(t("notifications.enabledTitle"), t("notifications.enabledMessage"));
    } catch {
      Alert.alert(t("notifications.errorTitle"), t("notifications.enableFailed"));
    } finally {
      setIsRequestingPermission(false);
    }
  }

  return (
    <View className="flex-1 bg-app-bgPrimary px-4 pt-2">
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.replace("/tabs/profile")}
          className="h-10 w-10 items-center justify-center rounded-full bg-app-surface"
        >
          <AppIcon name="ArrowLeft" size={18} color={APP_COLORS.textPrimary} />
        </Pressable>

        <Text className="text-xl font-bold text-app-textPrimary">{t("notifications.title")}</Text>

        <View className="h-10 w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {mode === "disabled" ? (
          <View className="mb-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4">
            <Text className="text-base font-semibold text-amber-300">{t("notifications.permissionRequiredTitle")}</Text>
            <Text className="mt-1 text-sm text-amber-100">{t("notifications.permissionRequiredMessage")}</Text>

            <Pressable
              onPress={handleEnableNotifications}
              disabled={isRequestingPermission}
              className="mt-3 rounded-xl bg-app-accentBlue px-4 py-3"
            >
              <Text className="text-center text-sm font-bold text-[#061324]">
                {isRequestingPermission ? t("notifications.actions.requesting") : t("notifications.actions.enable")}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View className="rounded-2xl border border-app-border bg-app-bgSecondary p-3">
          {featureStates.map((feature, index) => (
            <View
              key={feature.id}
              className={`flex-row items-center justify-between py-3 ${index < featureStates.length - 1 ? "border-b border-app-border" : ""}`}
            >
              <View className="flex-1 pr-3">
                <Text className="text-base font-semibold text-app-textPrimary">{t(feature.label)}</Text>
                <Text className="mt-1 text-xs text-app-textSecondary">{t(feature.description)}</Text>
              </View>
              <Switch
                value={feature.enabled}
                disabled={mode !== "enabled"}
                trackColor={{ false: "#4B5563", true: APP_COLORS.actionPrimary }}
                thumbColor={feature.enabled ? "#DBEAFE" : "#D1D5DB"}
                onValueChange={(value) => {
                  setFeatureToggles((previous) => ({
                    ...previous,
                    [feature.id]: value,
                  }));
                }}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
