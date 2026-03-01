import { useMemo, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useRouter } from "expo-router";

import { AddRecurringTransactionCard } from "../../components/recurring/AddRecurringTransactionCard";
import { PendingApprovalCard } from "../../components/recurring/PendingApprovalCard";
import { RecurringHeader } from "../../components/recurring/RecurringHeader";
import { RecurringTransactionItem } from "../../components/recurring/RecurringTransactionItem";
import { RecurringTypeToggle } from "../../components/recurring/RecurringTypeToggle";
import {
	confirmPendingRecurringApproval,
	getRecurringTransactionsData,
	reschedulePendingRecurringApproval,
} from "../../services/recurringTransactions.service";
import { RecurringTransactionsData } from "../../types/recurring";
import { RecurringPendingApprovalApiDTO, RecurringTransactionApiDTO } from "../../types/api/recurring";
import { PendingTransactionStatus } from "../../types/enums/pendingTransactionStatus";
import { TransactionType } from "../../types/enums/transactionType";

export default function RecurringTransactionsScreen() {
	const router = useRouter();
	const [recurringData, setRecurringData] = useState<RecurringTransactionsData | null>(null);
	const [selectedType, setSelectedType] = useState<TransactionType>(TransactionType.Expense);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isSubmittingAction, setIsSubmittingAction] = useState(false);
	const [error, setError] = useState("");

	async function loadRecurringTransactions(showInitialLoader = true) {
		try {
			if (showInitialLoader) {
				setIsLoading(true);
			}
			setError("");
			const data = await getRecurringTransactionsData();
			setRecurringData(data);
		} catch (loadError) {
			const message =
				loadError instanceof Error ? loadError.message : "Failed to load recurring transactions";
			setError(message);
		} finally {
			if (showInitialLoader) {
				setIsLoading(false);
			}
		}
	}

	async function handleRefresh() {
		setIsRefreshing(true);
		await loadRecurringTransactions(false);
		setIsRefreshing(false);
	}

	async function handleConfirmApproval(approval: RecurringPendingApprovalApiDTO) {
		if (isSubmittingAction) {
			return;
		}

		try {
			setIsSubmittingAction(true);
			await confirmPendingRecurringApproval(approval.id);
			await loadRecurringTransactions(false);
			Alert.alert("Recurring updated", `${approval.description} was confirmed successfully.`);
		} catch (actionError) {
			const message = actionError instanceof Error ? actionError.message : "Could not confirm recurring transaction";
			Alert.alert("Error", message);
		} finally {
			setIsSubmittingAction(false);
		}
	}

	async function handleRescheduleApproval(approval: RecurringPendingApprovalApiDTO) {
		if (isSubmittingAction) {
			return;
		}

		try {
			setIsSubmittingAction(true);
			const nextDay = new Date(approval.dueDate);
			nextDay.setDate(nextDay.getDate() + 1);
			await reschedulePendingRecurringApproval(approval.id, nextDay.toISOString());
			await loadRecurringTransactions(false);
			Alert.alert("Recurring updated", `${approval.description} was rescheduled successfully.`);
		} catch (actionError) {
			const message = actionError instanceof Error ? actionError.message : "Could not reschedule recurring transaction";
			Alert.alert("Error", message);
		} finally {
			setIsSubmittingAction(false);
		}
	}

	function handlePressRecurringTransaction(recurringTransaction: RecurringTransactionApiDTO) {
		Alert.alert("Recurring Transaction detail", `${recurringTransaction.name} detail will be enabled soon.`);
	}

	function handleSearchPress() {
		Alert.alert("Search", "Recurring search will be enabled soon.");
	}

	function handleAddRecurringTransaction() {
		router.push({
			pathname: "/tabs/recurringAdmin",
			params: { openCreate: "1" },
		});
	}

	useEffect(() => {
		loadRecurringTransactions();
	}, []);

	const pendingApproval = useMemo(() => {
		if (!recurringData?.pendingApprovals.length) {
			return null;
		}

		const pendingByType = recurringData.pendingApprovals.filter(
			(approval) =>
				Number(approval.transactionType) === selectedType &&
				approval.status === PendingTransactionStatus.Pending,
		);

		if (!pendingByType.length) {
			return null;
		}

		return [...pendingByType].sort(
			(left, right) => +new Date(left.dueDate) - +new Date(right.dueDate),
		)[0];
	}, [recurringData, selectedType]);

	const filteredRecurringTransactions = useMemo(() => {
		if (!recurringData?.recurringTransactions.length) {
			return [];
		}

		return recurringData.recurringTransactions.filter(
			(recurringTransaction) => Number(recurringTransaction.transactionType) === selectedType,
		);
	}, [recurringData, selectedType]);

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-[#060F24]">
				<ActivityIndicator size="large" color="#18C8FF" />
			</View>
		);
	}

	if (error || !recurringData) {
		return (
			<View className="flex-1 items-center justify-center bg-[#060F24] px-6">
				<Text className="text-center text-base text-app-textPrimary">
					{error || "No recurring transactions available"}
				</Text>
				<Pressable
					onPress={() => loadRecurringTransactions()}
					className="mt-4 rounded-xl border border-[#1E2A47] bg-[#111C33] px-4 py-2"
				>
					<Text className="font-semibold text-app-primary">Retry</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-[#060F24]">
			<RecurringHeader
				title="Recurring"
				onBackPress={() => router.push("/tabs/home")}
				onSearchPress={handleSearchPress}
			/>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerClassName="px-4 pb-6"
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={handleRefresh}
						tintColor="#18C8FF"
						colors={["#18C8FF"]}
					/>
				}
			>
				<RecurringTypeToggle value={selectedType} onChange={setSelectedType} />

				{pendingApproval ? (
					<PendingApprovalCard
						approval={pendingApproval}
						onConfirm={handleConfirmApproval}
						onReschedule={handleRescheduleApproval}
					/>
				) : null}

				<View className="mb-3 mt-1 flex-row items-center justify-between">
					<Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">
						UPCOMING RECURRING TRANSACTIONS
					</Text>
					<Pressable onPress={() => router.push("/tabs/recurringAdmin")}>
						<Text className="text-sm font-semibold text-[#18C8FF]">View All</Text>
					</Pressable>
				</View>

				{filteredRecurringTransactions.length ? (
					filteredRecurringTransactions.map((recurringTransaction) => (
						<RecurringTransactionItem
							key={recurringTransaction.id}
							recurringTransaction={recurringTransaction}
							onPress={handlePressRecurringTransaction}
						/>
					))
				) : (
					<View className="mb-4 rounded-2xl border border-[#1E2A47] bg-[#111C33] px-4 py-5">
						<Text className="text-center text-sm text-[#94A3B8]">
							No recurring transactions found for this filter.
						</Text>
					</View>
				)}

				<AddRecurringTransactionCard onPress={handleAddRecurringTransaction} />
			</ScrollView>
		</View>
	);
}

