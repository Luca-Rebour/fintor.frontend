import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { ProfileMenuSection } from "../../components/profile/ProfileMenuSection";
import { clearStoredJwt } from "../../services/auth.service";
import { getProfileData } from "../../services/profile.service";
import { ProfileData } from "../../types/profile";

export default function ProfileScreen() {
	const router = useRouter();
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		async function loadProfile() {
			try {
				setIsLoading(true);
				setError("");
				const data = await getProfileData();
				setProfileData(data);
			} catch (loadError) {
				const message = loadError instanceof Error ? loadError.message : "Failed to load profile";
				setError(message);
			} finally {
				setIsLoading(false);
			}
		}

		loadProfile();
	}, []);

	async function handleLogout() {
		await clearStoredJwt();
		Alert.alert("Session closed", "You have been logged out.");
		router.replace("/");
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
				<Text className="text-center text-base text-app-textPrimary">{error || "No profile data available"}</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-[#062027] px-4">
			<ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-20 pt-2">
				<ProfileHeader
					fullName={profileData.fullName}
					membershipLabel={profileData.membershipLabel}
					onBackPress={() => router.replace("/tabs/home")}
				/>

				{profileData.sections.map((section) => (
					<ProfileMenuSection key={section.id} section={section} />
				))}

				<LinearGradient
					colors={["#F43F5E", "#9333EA"]}
					start={{ x: 0, y: 0.5 }}
					end={{ x: 1, y: 0.5 }}
					style={{ borderRadius: 9999 }}
				>
					<Pressable onPress={handleLogout} className="rounded-full py-4">
						<Text className="text-center text-base font-bold text-app-textPrimary">Logout</Text>
					</Pressable>
				</LinearGradient>

				<Text className="mt-4 text-center text-xs text-app-textSecondary">{profileData.appVersion}</Text>
			</ScrollView>
		</View>
	);
}

