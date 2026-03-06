import { Redirect, Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { AppIcon } from "../../components/shared/AppIcon";

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
      <View className="flex-1 items-center justify-center bg-[#060F24]">
        <ActivityIndicator size="large" color="#18C8FF" />
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
          tabBarActiveTintColor: "#18C8FF",
          tabBarInactiveTintColor: "#94A3B8",
          tabBarStyle: {
            backgroundColor: "#111C33",
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
              <AppIcon name="DollarSign" color={color} size={size} />
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
                <View className="h-14 w-14 items-center justify-center rounded-full bg-[#18C8FF]">
                  <AppIcon name="Ellipsis" color="#060F24" size={24} />
                </View>
                <Text className="mt-1 text-[11px] font-semibold text-[#94A3B8]">{t("tabs.more")}</Text>
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
          name="goals"
          options={{
            title: t("tabs.goals"),
            tabBarIcon: ({ color, size }) => (
              <AppIcon name="Target" color={color} size={size} />
            ),
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

      <Modal
        visible={isMoreMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMoreMenu}
      >
        <Pressable className="flex-1 bg-[#060F24]/70" onPress={closeMoreMenu}>
          <View className="absolute bottom-24 left-4 right-4 rounded-2xl border border-[#1A243B] bg-[#111C33] p-4">
            <TouchableOpacity
              className="mb-2 flex-row items-center rounded-xl bg-[#1A243B] px-3 py-3"
              onPress={() => navigateToTab("/tabs/recurringTransactions")}
            >
              <AppIcon name="Calendar" color="#18C8FF" size={18} />
              <Text className="ml-2 text-base font-medium text-white">{t("tabs.recurringTransactions")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center rounded-xl bg-[#1A243B] px-3 py-3"
              onPress={() => navigateToTab("/tabs/recurringAdmin")}
            >
              <AppIcon name="Settings" color="#18C8FF" size={18} />
              <Text className="ml-2 text-base font-medium text-white">{t("tabs.manageRecurring")}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
