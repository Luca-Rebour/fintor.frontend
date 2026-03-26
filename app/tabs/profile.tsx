import { APP_COLORS } from "../../constants/colors";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { ProfileMenuSection } from "../../components/profile/ProfileMenuSection";
import { clearStoredJwt, getAuthUserSnapshot, subscribeToAuthUser } from "../../services/auth.service";
import { areNotificationsEnabledOnDevice, requestPushNotificationPermissionAndToken } from "../../services/notification-permissions.service";
import { getServerNotificationPreferencesEnabled, sendNotificationTokenToBackend } from "../../services/notifications.service";
import { getProfileData } from "../../services/profile.service";
import { ProfileData, ProfileMenuItem } from "../../types/profile";
import { AuthUserModel as User } from "../../types/models/auth.model";
import { resolveApiErrorMessage } from "../../i18n/resolve-api-error-message";

export default function ProfileScreen() {
	const { t, i18n } = useTranslation();
	const router = useRouter();
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	const [authUser, setAuthUser] = useState<User | null>(getAuthUserSnapshot());
	const [isLoading, setIsLoading] = useState(true);
	const [isOpeningNotifications, setIsOpeningNotifications] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const unsubscribe = subscribeToAuthUser((user) => {
			setAuthUser(user);
		});

		async function loadProfile() {
			try {
				setIsLoading(true);
				setError("");
				const data = await getProfileData();
				setProfileData(data);
			} catch (loadError) {
				const message = resolveApiErrorMessage(loadError, t, "profile.errors.failedToLoad");
				setError(message);
			} finally {
				setIsLoading(false);
			}
		}

		loadProfile();

		return unsubscribe;
	}, []);

	const fullNameFromAuth = `${authUser?.name ?? ""} ${authUser?.lastName ?? ""}`.trim();

	async function handleLogout() {
		await clearStoredJwt();
		Alert.alert(t("profile.logout.title"), t("profile.logout.message"));
		router.replace("/");
	}

	const currentLanguage = (i18n.resolvedLanguage ?? i18n.language).startsWith("es") ? "es" : "en";

	function handleLanguageChange(language: "es" | "en") {
		void i18n.changeLanguage(language);
	}

	function handleProfileItemPress(item: ProfileMenuItem) {
		if (isOpeningNotifications) {
			return;
		}

		if (item.id === "changePassword") {
			router.push("/tabs/changePassword");
			return;
		}

		if (item.id === "notifications") {
			void handleOpenNotificationPreferences();
			return;
		}

		Alert.alert(item.title, t("common.comingSoon"));
	}

	async function handleOpenNotificationPreferences() {
		try {
			setIsOpeningNotifications(true);

			const isServerEnabled = await getServerNotificationPreferencesEnabled();
			const isDeviceEnabled = await areNotificationsEnabledOnDevice();

			if (isServerEnabled && isDeviceEnabled) {
				router.push({ pathname: "/tabs/notificationPreferences", params: { mode: "enabled" } });
				return;
			}

			const permissionResult = await requestPushNotificationPermissionAndToken();

			if (!permissionResult.granted) {
				router.push({ pathname: "/tabs/notificationPreferences", params: { mode: "disabled" } });
				return;
			}

			if (!permissionResult.expoPushToken) {
				Alert.alert(t("notifications.errorTitle"), t("notifications.tokenUnavailable"));
				router.push({ pathname: "/tabs/notificationPreferences", params: { mode: "disabled" } });
				return;
			}

			await sendNotificationTokenToBackend(permissionResult.expoPushToken);
			router.push({ pathname: "/tabs/notificationPreferences", params: { mode: "enabled" } });
		} catch (loadError) {
			const message = resolveApiErrorMessage(loadError, t, "notifications.enableFailed");
			Alert.alert(t("notifications.errorTitle"), message);
		} finally {
			setIsOpeningNotifications(false);
		}
	}

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-app-bgPrimary">
				<ActivityIndicator size="large" color={APP_COLORS.actionPrimary} />
			</View>
		);
	}

	if (error || !profileData) {
		return (
			<View className="flex-1 items-center justify-center bg-app-bgPrimary px-6">
				<Text className="text-center text-base text-app-textPrimary">{error || t("profile.errors.noData")}</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-app-bgPrimary px-4">
			<ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-20 pt-2">
				<ProfileHeader
					fullName={fullNameFromAuth || profileData.fullName}
					membershipLabel={profileData.membershipLabel}
					onBackPress={() => router.replace("/tabs/home")}
				/>

				{profileData.sections.map((section) => (
					<ProfileMenuSection key={section.id} section={section} onItemPress={handleProfileItemPress} />
				))}

				<View className="mb-4 rounded-2xl bg-app-cardSoft px-4 py-4">
					<Text className="text-base font-semibold text-app-textPrimary">{t("profile.language.title")}</Text>
					<View className="mt-3 flex-row gap-2">
						<Pressable
							onPress={() => handleLanguageChange("es")}
							className={`rounded-full px-4 py-2 ${currentLanguage === "es" ? "bg-app-primary" : "bg-app-card"}`}
						>
							<Text className={`text-sm font-semibold ${currentLanguage === "es" ? "text-app-surface" : "text-app-textPrimary"}`}>
								{t("profile.language.spanish")}
							</Text>
						</Pressable>
						<Pressable
							onPress={() => handleLanguageChange("en")}
							className={`rounded-full px-4 py-2 ${currentLanguage === "en" ? "bg-app-primary" : "bg-app-card"}`}
						>
							<Text className={`text-sm font-semibold ${currentLanguage === "en" ? "text-app-surface" : "text-app-textPrimary"}`}>
								{t("profile.language.english")}
							</Text>
						</Pressable>
					</View>
				</View>

					<Pressable onPress={handleLogout} className="rounded-full py-4" style={{ backgroundColor: APP_COLORS.danger }}>
						<Text className="text-center text-base font-bold text-app-textPrimary">{t("profile.logout.button")}</Text>
					</Pressable>

				<Text className="mt-4 text-center text-xs text-app-textSecondary">{profileData.appVersion}</Text>
			</ScrollView>
		</View>
	);
}


