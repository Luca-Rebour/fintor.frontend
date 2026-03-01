import { useMemo, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Modal,
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { AddRecurringTransactionCard } from "../../components/recurring/AddRecurringTransactionCard";
import { PendingApprovalCard } from "../../components/recurring/PendingApprovalCard";
import { RecurringHeader } from "../../components/recurring/RecurringHeader";
import { RecurringTransactionItem } from "../../components/recurring/RecurringTransactionItem";
import { RecurringTypeToggle } from "../../components/recurring/RecurringTypeToggle";
import {
	cancelPendingRecurringApproval,
	confirmPendingRecurringApproval,
	getRecurringTransactionsData,
	reschedulePendingRecurringApproval,
} from "../../services/recurringTransactions.service";
import { RecurringTransactionsData } from "../../types/recurring";
import { RecurringPendingApprovalApiDTO, RecurringTransactionApiDTO } from "../../types/api/recurring";
import { PendingTransactionStatus } from "../../types/enums/pendingTransactionStatus";
import { TransactionType } from "../../types/enums/transactionType";

function resolveTransactionType(value: unknown): TransactionType | null {
	if (typeof value === "number") {
		return value === TransactionType.Income || value === TransactionType.Expense ? value : null;
	}

	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();

		if (normalized === "income") {
			return TransactionType.Income;
		}

		if (normalized === "expense" || normalized === "expenses") {
			return TransactionType.Expense;
		}

		const parsed = Number(normalized);
		if (!Number.isNaN(parsed)) {
			return resolveTransactionType(parsed);
		}
	}

	return null;
}

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

function isRescheduledStatus(value: unknown): boolean {
	if (typeof value === "number") {
		return value === PendingTransactionStatus.Rescheduled;
	}

	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		return normalized === "rescheduled" || normalized === String(PendingTransactionStatus.Rescheduled);
	}

	return false;
}

function toDateOnlyString(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function getStartOfDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getTomorrowStartDate(): Date {
	const todayStart = getStartOfDay(new Date());
	todayStart.setDate(todayStart.getDate() + 1);
	return todayStart;
}

export default function RecurringTransactionsScreen() {
	const router = useRouter();
	const [recurringData, setRecurringData] = useState<RecurringTransactionsData | null>(null);
	const [selectedType, setSelectedType] = useState<TransactionType>(TransactionType.Expense);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isSubmittingAction, setIsSubmittingAction] = useState(false);
	const [error, setError] = useState("");
	const [isPendingExpanded, setIsPendingExpanded] = useState(true);
	const [isRescheduledExpanded, setIsRescheduledExpanded] = useState(false);
	const [rescheduleApproval, setRescheduleApproval] = useState<RecurringPendingApprovalApiDTO | null>(null);
	const [rescheduleDate, setRescheduleDate] = useState(new Date());
	const minimumRescheduleDate = getTomorrowStartDate();

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
			await confirmPendingRecurringApproval(approval.id, approval.currencyCode);
			await loadRecurringTransactions(false);
		} catch (actionError) {
			const message = actionError instanceof Error ? actionError.message : "Could not confirm recurring transaction";
			Alert.alert("Error", message);
		} finally {
			setIsSubmittingAction(false);
		}
	}

	function handleRescheduleApproval(approval: RecurringPendingApprovalApiDTO) {
		const dueDate = getStartOfDay(new Date(approval.dueDate));
		const initialDate = dueDate < minimumRescheduleDate ? minimumRescheduleDate : dueDate;

		setRescheduleApproval(approval);
		setRescheduleDate(initialDate);
	}

	async function submitRescheduleApproval() {
		if (!rescheduleApproval || isSubmittingAction) {
			return;
		}

		if (isSubmittingAction) {
			return;
		}

		try {
			const selectedDateStart = getStartOfDay(rescheduleDate);

			if (selectedDateStart < minimumRescheduleDate) {
				Alert.alert("Invalid date", "Please select a date after today.");
				return;
			}

			setIsSubmittingAction(true);
			await reschedulePendingRecurringApproval(
				rescheduleApproval.id,
				toDateOnlyString(selectedDateStart),
			);
			await loadRecurringTransactions(false);
			setRescheduleApproval(null);
		} catch (actionError) {
			const message = actionError instanceof Error ? actionError.message : "Could not reschedule recurring transaction";
			Alert.alert("Error", message);
		} finally {
			setIsSubmittingAction(false);
		}
	}

	function handleRescheduleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
		if (event.type === "dismissed") {
			if (Platform.OS !== "ios") {
				setRescheduleApproval(null);
			}
			return;
		}

		if (!selectedDate) {
			return;
		}

		const selectedDateStart = getStartOfDay(selectedDate);
		const nextDate = selectedDateStart < minimumRescheduleDate ? minimumRescheduleDate : selectedDateStart;

		if (Platform.OS === "ios") {
			setRescheduleDate(nextDate);
			return;
		}

		setRescheduleDate(nextDate);
	}

	function handleCancelApproval(approval: RecurringPendingApprovalApiDTO) {
		Alert.alert(
			"Cancel transaction",
			`Are you sure you want to cancel ${approval.description}?`,
			[
				{ text: "Keep", style: "cancel" },
				{
					text: "Cancel transaction",
					style: "destructive",
					onPress: async () => {
						if (isSubmittingAction) {
							return;
						}

						try {
							setIsSubmittingAction(true);
							await cancelPendingRecurringApproval(approval.id);
							await loadRecurringTransactions(false);
						} catch (actionError) {
							const message =
								actionError instanceof Error ? actionError.message : "Could not cancel recurring transaction";
							Alert.alert("Error", message);
						} finally {
							setIsSubmittingAction(false);
						}
					},
				},
			],
		);
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

	const pendingApprovalsForType = useMemo(() => {
		if (!recurringData?.pendingApprovals.length) {
			return [];
		}

		const pendingByType = recurringData.pendingApprovals.filter(
			(approval) =>
				resolveTransactionType(approval.transactionType) === selectedType &&
				isPendingStatus(approval.status),
		);

		return [...pendingByType].sort(
			(left, right) => +new Date(left.dueDate) - +new Date(right.dueDate),
		);
	}, [recurringData, selectedType]);

	const rescheduledApprovalsForType = useMemo(() => {
		if (!recurringData?.pendingApprovals.length) {
			return [];
		}

		const rescheduledByType = recurringData.pendingApprovals.filter(
			(approval) =>
				resolveTransactionType(approval.transactionType) === selectedType &&
				isRescheduledStatus(approval.status),
		);

		return [...rescheduledByType].sort(
			(left, right) => +new Date(left.dueDate) - +new Date(right.dueDate),
		);
	}, [recurringData, selectedType]);

	const filteredRecurringTransactions = useMemo(() => {
		if (!recurringData?.recurringTransactions.length) {
			return [];
		}

		return recurringData.recurringTransactions.filter(
			(recurringTransaction) => resolveTransactionType(recurringTransaction.transactionType) === selectedType,
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

				{pendingApprovalsForType.length ? (
					<View className="mb-6 rounded-2xl border border-[#1E2A47] bg-[#111C33]">
						<Pressable
							onPress={() => setIsPendingExpanded((previous) => !previous)}
							className="flex-row items-center justify-between px-4 py-3"
						>
							<Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">
								PENDING ({pendingApprovalsForType.length})
							</Text>
							<Text className="text-sm font-semibold text-[#18C8FF]">
								{isPendingExpanded ? "Hide" : "Show"}
							</Text>
						</Pressable>

						{isPendingExpanded
							? pendingApprovalsForType.map((approval) => (
									<PendingApprovalCard
										key={approval.id}
										approval={approval}
										onConfirm={handleConfirmApproval}
										onReschedule={handleRescheduleApproval}
										onCancel={handleCancelApproval}
									/>
								))
							: null}
					</View>
				) : null}

				{rescheduledApprovalsForType.length ? (
					<View className="mb-6 rounded-2xl border border-[#1E2A47] bg-[#111C33]">
						<Pressable
							onPress={() => setIsRescheduledExpanded((previous) => !previous)}
							className="flex-row items-center justify-between px-4 py-3"
						>
							<Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">
								RESCHEDULED ({rescheduledApprovalsForType.length})
							</Text>
							<Text className="text-sm font-semibold text-[#18C8FF]">
								{isRescheduledExpanded ? "Hide" : "Show"}
							</Text>
						</Pressable>

						{isRescheduledExpanded
							? rescheduledApprovalsForType.map((approval) => (
									<PendingApprovalCard
										key={approval.id}
										approval={approval}
										onConfirm={handleConfirmApproval}
										onReschedule={handleRescheduleApproval}
										onCancel={handleCancelApproval}
									/>
								))
							: null}
					</View>
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

			<Modal
				visible={!!rescheduleApproval}
				transparent
				animationType="fade"
				onRequestClose={() => setRescheduleApproval(null)}
			>
				<View className="flex-1 justify-end bg-[#060F24]/70">
					<Pressable className="flex-1" onPress={() => setRescheduleApproval(null)} />

					<View className="rounded-t-3xl border border-[#1E2A47] bg-[#060F24] px-4 pb-6 pt-4">
						<Text className="mb-1 text-base font-bold text-app-textPrimary">Reschedule transaction</Text>
						<Text className="mb-3 text-sm text-[#94A3B8]">
							Choose a new date for {rescheduleApproval?.description ?? "this transaction"}.
						</Text>

						<DateTimePicker
							value={rescheduleDate}
							mode="date"
							display={Platform.OS === "ios" ? "spinner" : "default"}
							minimumDate={minimumRescheduleDate}
							onChange={handleRescheduleDateChange}
						/>

						<View className="mt-4 flex-row gap-3">
							<Pressable
								onPress={() => setRescheduleApproval(null)}
								disabled={isSubmittingAction}
								className="flex-1 rounded-2xl border border-[#334155] bg-[#1A243B] px-4 py-3"
							>
								<Text className="text-center text-sm font-semibold text-[#94A3B8]">Cancel</Text>
							</Pressable>

							<Pressable
								onPress={submitRescheduleApproval}
								disabled={isSubmittingAction}
								className="flex-1 rounded-2xl bg-[#1D4ED8] px-4 py-3"
							>
								<Text className="text-center text-sm font-semibold text-white">
									{isSubmittingAction ? "Saving..." : "Save date"}
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

