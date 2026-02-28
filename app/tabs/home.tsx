import { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";

import { CashFlowSection } from "../../components/home/CashFlowSection";
import { DashboardHeader } from "../../components/home/DashboardHeader";
import { GoalSection } from "../../components/home/GoalSection";
import { NetWorthSection } from "../../components/home/ExpenseByCategoryChart";
import { PendingIncomeCard } from "../../components/home/PendingIncomeCard";
import { getDashboardData } from "../../services/dashboard.service";
import { DashboardData } from "../../types/dashboard";

export default function HomeScreen() {
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState("");

	async function loadDashboard(showInitialLoader = true) {
		try {
			if (showInitialLoader) {
				setIsLoading(true);
			}
			setError("");
			const data = await getDashboardData();
			setDashboardData(data);
		} catch (loadError) {
			const message = loadError instanceof Error ? loadError.message : "Failed to load dashboard";
			setError(message);
		} finally {
			if (showInitialLoader) {
				setIsLoading(false);
			}
		}
	}

	async function handleRefresh() {
		setIsRefreshing(true);
		await loadDashboard(false);
		setIsRefreshing(false);
	}

	useEffect(() => {
		loadDashboard();
	}, []);

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-[#060F24]">
				<ActivityIndicator size="large" color="#18C8FF" />
			</View>
		);
	}

	if (error || !dashboardData) {
		return (
			<View className="flex-1 items-center justify-center bg-[#060F24] px-6">
				<Text className="text-center text-base text-app-textPrimary">{error || "No dashboard data available"}</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-[#060F24] px-4">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerClassName="pb-20 pt-2"
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={handleRefresh}
						tintColor="#18C8FF"
						colors={["#18C8FF"]}
					/>
				}
			>
				<DashboardHeader userName={dashboardData.userName} />

				<NetWorthSection />

				<PendingIncomeCard
					amount={dashboardData.pendingIncomeAmount}
					source={dashboardData.pendingIncomeSource}
				/>

				<CashFlowSection metrics={dashboardData.cashFlow} />
				<GoalSection goal={dashboardData.goal} />
			</ScrollView>
		</View>
	);
}

