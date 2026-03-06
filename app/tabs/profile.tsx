import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { ProfileMenuSection } from "../../components/profile/ProfileMenuSection";
import { clearStoredJwt, getAuthUserSnapshot, subscribeToAuthUser } from "../../services/auth.service";
import { getProfileData } from "../../services/profile.service";
import { ProfileData } from "../../types/profile";
import { AuthUserModel as User } from "../../types/models/auth.model";

export default function ProfileScreen() {
	const { t, i18n } = useTranslation();
	const router = useRouter();
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	const [authUser, setAuthUser] = useState<User | null>(getAuthUserSnapshot());
	const [isLoading, setIsLoading] = useState(true);
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
				const message = loadError instanceof Error ? loadError.message : t("profile.errors.failedToLoad");
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

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-[#062027]">
				<ActivityIndicator size="large" color="#18C8FF" />
			</View>
		);
	}

	if (error || !profileData) {
		return (
			<View className="flex-1 items-center justify-center bg-[#062027] px-6">
				<Text className="text-center text-base text-app-textPrimary">{error || t("profile.errors.noData")}</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-[#062027] px-4">
			<ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-20 pt-2">
				<ProfileHeader
					fullName={fullNameFromAuth || profileData.fullName}
					membershipLabel={profileData.membershipLabel}
					onBackPress={() => router.replace("/tabs/home")}
				/>

				{profileData.sections.map((section) => (
					<ProfileMenuSection key={section.id} section={section} />
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

				<LinearGradient
					colors={["#F43F5E", "#9333EA"]}
					start={{ x: 0, y: 0.5 }}
					end={{ x: 1, y: 0.5 }}
					style={{ borderRadius: 9999 }}
				>
					<Pressable onPress={handleLogout} className="rounded-full py-4">
						<Text className="text-center text-base font-bold text-app-textPrimary">{t("profile.logout.button")}</Text>
					</Pressable>
				</LinearGradient>

				<Text className="mt-4 text-center text-xs text-app-textSecondary">{profileData.appVersion}</Text>
			</ScrollView>
		</View>
	);
}

