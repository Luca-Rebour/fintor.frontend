import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from "react-native";

import { CashFlowSection } from "../../components/home/CashFlowSection";
import { DashboardHeader } from "../../components/home/DashboardHeader";
import { GoalSection } from "../../components/home/GoalSection";
import { NetWorthSection } from "../../components/home/ExpenseByCategoryChart";
import { PendingIncomeCard } from "../../components/home/PendingIncomeCard";
import { getAuthUserSnapshot, subscribeToAuthUser } from "../../services/auth.service";
import { getDashboardData } from "../../services/dashboard.service";
import {
	confirmPendingRecurringApproval,
	getRecurringTransactionsSnapshot,
	refreshRecurringTransactionsData,
	subscribeToRecurringTransactions,
} from "../../services/recurringTransactions.service";
import { DashboardData } from "../../types/dashboard";
import { User } from "../../types/api/signUp";
import { RecurringPendingApprovalApiDTO } from "../../types/api/recurring";
import { RecurringTransactionsData } from "../../types/recurring";
import { PendingTransactionStatus } from "../../types/enums/pendingTransactionStatus";

function isPendingStatus(value: unknown): boolean {
	if (typeof value === "number") {
		return value === PendingTransactionStatus.Pending;
	}

	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		return normalized === "pending" || normalized === String(PendingTransactionStatus.Pending);
	}

	return false;
}

export default function HomeScreen() {
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
	const [recurringData, setRecurringData] = useState<RecurringTransactionsData>(getRecurringTransactionsSnapshot());
	const [authUser, setAuthUser] = useState<User | null>(getAuthUserSnapshot());
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isConfirmingPending, setIsConfirmingPending] = useState(false);
	const [chartRefreshKey, setChartRefreshKey] = useState(0);
	const [error, setError] = useState("");

	async function loadDashboard(showInitialLoader = true) {
		try {
			if (showInitialLoader) {
				setIsLoading(true);
			}
			setError("");
			const [data] = await Promise.all([
				getDashboardData(),
				refreshRecurringTransactionsData(),
			]);
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
		setChartRefreshKey((previous) => previous + 1);
		setIsRefreshing(false);
	}

	async function handleConfirmPendingTransaction(pendingTransaction: RecurringPendingApprovalApiDTO) {
		if (isConfirmingPending) {
			return;
		}

		try {
			setIsConfirmingPending(true);
			await confirmPendingRecurringApproval(pendingTransaction.id, pendingTransaction.currencyCode);
			await loadDashboard(false);
		} catch (confirmError) {
			const message = confirmError instanceof Error ? confirmError.message : "Could not confirm pending transaction";
			Alert.alert("Error", message);
		} finally {
			setIsConfirmingPending(false);
		}
	}

	useEffect(() => {
		const unsubscribeAuth = subscribeToAuthUser((user) => {
			setAuthUser(user);
		});

		const unsubscribeRecurring = subscribeToRecurringTransactions((data) => {
			setRecurringData(data);
		});

		loadDashboard();

		return () => {
			unsubscribeAuth();
			unsubscribeRecurring();
		};
	}, []);

	const pendingTransactions = useMemo(
		() =>
			recurringData.pendingApprovals
				.filter((pendingApproval) => isPendingStatus(pendingApproval.status))
				.sort((left, right) => +new Date(left.dueDate) - +new Date(right.dueDate)),
		[recurringData],
	);

	const userDisplayName = `${authUser?.name ?? ""} ${authUser?.lastName ?? ""}`.trim() || dashboardData?.userName || "";

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
				<DashboardHeader userName={userDisplayName} />

				<NetWorthSection refreshKey={chartRefreshKey} />

				<PendingIncomeCard
					pendingTransactions={pendingTransactions}
					onConfirm={handleConfirmPendingTransaction}
					isSubmitting={isConfirmingPending}
				/>

				<CashFlowSection metrics={dashboardData.cashFlow} />
				<GoalSection goal={dashboardData.goal} />
			</ScrollView>
		</View>
	);
}

