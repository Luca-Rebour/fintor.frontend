import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { CreateGoalModal } from "../../components/goals/CreateGoalModal";
import { GoalTargetCard } from "../../components/goals/GoalTargetCard";
import { GoalsHeader } from "../../components/goals/GoalsHeader";
import { SavingsOverviewCard } from "../../components/goals/SavingsOverviewCard";
import { createGoal, getGoalsData } from "../../services/goals.service";
import { CreateGoalDTO, GoalApi } from "../../types/goals.types";

export default function GoalsScreen() {
	const { t } = useTranslation();
	const [goalsData, setGoalsData] = useState<GoalApi[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isCreatingTarget, setIsCreatingTarget] = useState(false);
	const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
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
					: t("goals.errors.failedToLoad");
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		loadGoals();
	}, []);

	async function handleCreateTarget(payload: CreateGoalDTO) {
		if (isCreatingTarget) {
			return;
		}

		try {
			setIsCreatingTarget(true);
			const createdGoal = await createGoal(payload);
			setGoalsData((previous) => [createdGoal, ...previous]);
			setIsCreateModalVisible(false);
		} catch (createError) {
			const message = createError instanceof Error ? createError.message : "No se pudo crear el target";
			Alert.alert("Error", message);
		} finally {
			setIsCreatingTarget(false);
		}
	}

	const overview = useMemo(() => {
		const totalSavings = goalsData.reduce(
			(sum, goal) => sum + Math.max(0, Number(goal.currentAmount) || 0),
			0,
		);

		const totalGoal = goalsData.reduce(
			(sum, goal) => sum + Math.max(0, Number(goal.targetAmount) || 0),
			0,
		);

		const monthlyChangePercent = totalGoal > 0 ? Math.round((totalSavings / totalGoal) * 100) : 0;

		return {
			totalSavings,
			monthlyChangePercent,
			currentValue: totalSavings,
			goalValue: totalGoal,
		};
	}, [goalsData]);

	return (
		<View className="flex-1 bg-[#060F24]">
			<GoalsHeader title={t("goals.title")} />

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
						<Text className="text-app-primary font-semibold">{t("common.retry")}</Text>
					</Pressable>
				</View>
			) : (
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{
						paddingHorizontal: 16,
						paddingTop: 14,
						paddingBottom: 24,
					}}
				>
					<SavingsOverviewCard
						totalSavings={overview.totalSavings}
						monthlyChangePercent={overview.monthlyChangePercent}
						currentValue={overview.currentValue}
						goalValue={overview.goalValue}
					/>

					<View className="mt-6 mb-3 flex-row items-center justify-between">
						<Text className="text-2xl font-bold text-app-textPrimary">{t("goals.targetsTitle")}</Text>
						<Pressable
							onPress={() => setIsCreateModalVisible(true)}
							className="rounded-lg border border-[#1E2A47] bg-[#111C33] px-3 py-2"
						>
							<Text className="text-sm font-semibold text-app-primary">Crear target</Text>
						</Pressable>
					</View>

					<View className="gap-4">
						{goalsData.map((goal) => (
							<GoalTargetCard key={goal.id} goal={goal} />
						))}
					</View>
				</ScrollView>
			)}

			<CreateGoalModal
				visible={isCreateModalVisible}
				isSubmitting={isCreatingTarget}
				onClose={() => setIsCreateModalVisible(false)}
				onCreateTarget={handleCreateTarget}
			/>
		</View>
	);
}
