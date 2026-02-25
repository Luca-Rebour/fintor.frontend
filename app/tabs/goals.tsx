import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { GoalTargetCard } from "../../components/goals/GoalTargetCard";
import { GoalsHeader } from "../../components/goals/GoalsHeader";
import { SavingsOverviewCard } from "../../components/goals/SavingsOverviewCard";
import { getGoalsData } from "../../services/goals.service";
import { GoalsData } from "../../types/goals.types";

export default function GoalsScreen() {
	const router = useRouter();
	const [goalsData, setGoalsData] = useState<GoalsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	async function loadGoals() {
		try {
			setIsLoading(true);
			setError("");
			const data = await getGoalsData();
			setGoalsData(data);
		} catch (loadError) {
			const message =
				loadError instanceof Error
					? loadError.message
					: "Failed to load goals";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		loadGoals();
	}, []);

	return (
		<View className="flex-1 bg-[#060F24]">
			<GoalsHeader title="Financial Goals" />

			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#18C8FF" />
				</View>
			) : error ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-base text-app-textPrimary">{error}</Text>
					<Pressable
						onPress={loadGoals}
						className="mt-4 rounded-xl bg-[#111C33] border border-[#1E2A47] px-4 py-2"
					>
						<Text className="text-app-primary font-semibold">Retry</Text>
					</Pressable>
				</View>
			) : goalsData ? (
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{
						paddingHorizontal: 16,
						paddingTop: 14,
						paddingBottom: 24,
					}}
				>
					<SavingsOverviewCard
						totalSavings={goalsData.overview.totalSavings}
						monthlyChangePercent={goalsData.overview.monthlyChangePercent}
						currentValue={goalsData.overview.currentValue}
						goalValue={goalsData.overview.goalValue}
					/>

					<View className="mt-6 mb-3 flex-row items-center justify-between">
						<Text className="text-2xl font-bold text-app-textPrimary">Your Targets</Text>
						<Text className="text-sm font-medium text-app-primary">View All</Text>
					</View>

					<View className="gap-4">
						{goalsData.targets.map((goal) => (
							<GoalTargetCard key={goal.id} goal={goal} />
						))}
					</View>
				</ScrollView>
			) : null}
		</View>
	);
}
