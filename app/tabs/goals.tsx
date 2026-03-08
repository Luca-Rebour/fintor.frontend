import { APP_COLORS } from "../../constants/colors";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

import { CreateGoalModal } from "../../components/goals/CreateGoalModal";
import { GoalTargetCard } from "../../components/goals/GoalTargetCard";
import { GoalsHeader } from "../../components/goals/GoalsHeader";
import { createGoal, getGoalsData } from "../../services/goals.service";
import {
	CreateGoalInputModel as CreateGoalDTO,
	GoalModel as GoalApi,
} from "../../types/models/goal.model";

export default function GoalsScreen() {
	const { t } = useTranslation();
	const router = useRouter();
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
			const message = createError instanceof Error ? createError.message : t("goals.errors.failedToCreateTarget");
			Alert.alert(t("goals.errors.genericTitle"), message);
		} finally {
			setIsCreatingTarget(false);
		}
	}

	function handleGoalPress(goal: GoalApi) {
		router.push({
			pathname: "/tabs/goalTransactions",
			params: {
				goalId: goal.id,
				goalTitle: goal.title,
			},
		});
	}

	return (
		<View className="flex-1 bg-app-bgPrimary">
			<GoalsHeader title={t("goals.title")} />

			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color={APP_COLORS.actionPrimary} />
				</View>
			) : error ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-base text-app-textPrimary">{error}</Text>
					<Pressable
						onPress={loadGoals}
						className="mt-4 rounded-xl bg-app-bgSecondary border border-app-border px-4 py-2"
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
					<View className="mt-6 mb-3 flex-row items-center justify-between">
						<Text className="text-2xl font-bold text-app-textPrimary">{t("goals.targetsTitle")}</Text>
						<Pressable
							onPress={() => setIsCreateModalVisible(true)}
							className="rounded-lg border border-app-border bg-app-bgSecondary px-3 py-2"
						>
							<Text className="text-sm font-semibold text-app-primary">{t("goals.actions.createTarget")}</Text>
						</Pressable>
					</View>

					<View className="gap-4">
						{goalsData.map((goal) => (
							<GoalTargetCard key={goal.id} goal={goal} onPress={handleGoalPress} />
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

