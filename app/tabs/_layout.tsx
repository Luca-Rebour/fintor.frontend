import { APP_COLORS } from "../../constants/colors";
import { Redirect, Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { AppIcon } from "../../components/shared/AppIcon";
import { AppBottomSheetModal } from "../../components/shared/AppBottomSheetModal";

import { getStoredJwt, loadAuthenticatedUser } from "../../services/auth.service";

export default function ProtectedTabsLayout() {
  const { t } = useTranslation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await getStoredJwt();
        setIsAuthenticated(Boolean(token));

        if (token) {
          await loadAuthenticatedUser();
        }
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuth();
  }, []);

  if (isCheckingAuth) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bgPrimary">
        <ActivityIndicator size="large" color={APP_COLORS.actionPrimary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  function openMoreMenu() {
    setIsMoreMenuVisible(true);
  }

  function closeMoreMenu() {
    setIsMoreMenuVisible(false);
  }

  function navigateToTab(tabPath: string) {
    closeMoreMenu();
    router.push(tabPath as any);
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: APP_COLORS.actionPrimary,
          tabBarInactiveTintColor: APP_COLORS.textSecondary,
          tabBarStyle: {
            backgroundColor: APP_COLORS.surfaceCard,
            borderTopWidth: 0,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: t("tabs.home"),
            tabBarIcon: ({ color, size }) => (
              <AppIcon name="House" color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="transactions"
          options={{
            title: t("tabs.transactions"),
            tabBarIcon: ({ color, size }) => (
              <AppIcon name="arrow-left-right" color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="more"
          options={{
            title: t("tabs.more"),
            tabBarButton: () => (
              <Pressable
                onPress={openMoreMenu}
                accessibilityRole="button"
                accessibilityLabel={t("tabs.openMoreTabOptions")}
                className="-mt-2 items-center"
              >
                <View className="h-14 w-14 items-center justify-center rounded-full bg-app-accentBlue">
                  <AppIcon name="Ellipsis" color={APP_COLORS.surfacePrimary} size={24} />
                </View>
                <Text className="mt-1 text-[11px] font-semibold text-app-textSecondary">{t("tabs.more")}</Text>
              </Pressable>
            ),
          }}
          listeners={{
            tabPress: () => {
              openMoreMenu();
            },
          }}
        />

        <Tabs.Screen
          name="recurringTransactions"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="recurringAdmin"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="goalTransactions"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="accounts"
          options={{
            title: t("tabs.accounts"),
            tabBarIcon: ({ color, size }) => (
              <AppIcon name="CreditCard" color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="accountDetails"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="goals"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="categories"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: t("tabs.profile"),
            tabBarIcon: ({ color, size }) => (
              <AppIcon name="User" color={color} size={size} />
            ),
          }}
        />
      </Tabs>

      <AppBottomSheetModal visible={isMoreMenuVisible} onClose={closeMoreMenu} snapPoints={["44%"]} debugName="Tabs:MoreMenu">
          <View className="rounded-2xl bg-app-bgSecondary p-4">
            <TouchableOpacity
              className="mb-2 flex-row items-center rounded-xl bg-app-border px-3 py-3"
              onPress={() => navigateToTab("/tabs/recurringTransactions")}
            >
              <AppIcon name="Calendar" color={APP_COLORS.actionPrimary} size={18} />
              <Text className="ml-2 text-base font-medium text-white">{t("tabs.recurringTransactions")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center rounded-xl bg-app-border px-3 py-3"
              onPress={() => navigateToTab("/tabs/recurringAdmin")}
            >
              <AppIcon name="Settings" color={APP_COLORS.actionPrimary} size={18} />
              <Text className="ml-2 text-base font-medium text-white">{t("tabs.manageRecurring")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-2 flex-row items-center rounded-xl bg-app-border px-3 py-3"
              onPress={() => navigateToTab("/tabs/goals")}
            >
              <AppIcon name="Target" color={APP_COLORS.actionPrimary} size={18} />
              <Text className="ml-2 text-base font-medium text-white">{t("tabs.goals")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-2 flex-row items-center rounded-xl bg-app-border px-3 py-3"
              onPress={() => navigateToTab("/tabs/categories")}
            >
              <AppIcon name="Tag" color={APP_COLORS.actionPrimary} size={18} />
              <Text className="ml-2 text-base font-medium text-white">{t("tabs.categories")}</Text>
            </TouchableOpacity>
          </View>
      </AppBottomSheetModal>
    </>
  );
}

