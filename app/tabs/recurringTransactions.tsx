import { APP_COLORS } from "../../constants/colors";
import { useMemo, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";

import { AddRecurringTransactionCard } from "../../components/recurring/AddRecurringTransactionCard";
import { PendingApprovalCard } from "../../components/recurring/PendingApprovalCard";
import { RecurringHeader } from "../../components/recurring/RecurringHeader";
import { RecurringTransactionItem } from "../../components/recurring/RecurringTransactionItem";
import { RecurringTypeToggle } from "../../components/recurring/RecurringTypeToggle";
import { AppBottomSheetModal } from "../../components/shared/AppBottomSheetModal";
import {
	cancelPendingRecurringApproval,
	confirmPendingRecurringApproval,
	deleteRecurringTransaction,
	getRecurringTransactionsSnapshot,
	refreshRecurringTransactionsData,
	reschedulePendingRecurringApproval,
	subscribeToRecurringTransactions,
} from "../../services/recurringTransactions.service";
import { RecurringPendingApprovalApiDTO, RecurringTransactionApiDTO, RecurringTransactionsData } from "../../types/recurring";
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
	const { t } = useTranslation();
	const router = useRouter();
	const [recurringData, setRecurringData] = useState<RecurringTransactionsData>(getRecurringTransactionsSnapshot());
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
			await refreshRecurringTransactionsData();
		} catch (loadError) {
			const message =
				loadError instanceof Error ? loadError.message : t("recurring.errors.failedToLoad");
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
			const message = actionError instanceof Error ? actionError.message : t("recurring.errors.couldNotConfirm");
			Alert.alert(t("recurring.errors.genericTitle"), message);
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
				Alert.alert(t("recurring.errors.invalidDateTitle"), t("recurring.errors.invalidDateMessage"));
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
			const message = actionError instanceof Error ? actionError.message : t("recurring.errors.couldNotReschedule");
			Alert.alert(t("recurring.errors.genericTitle"), message);
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
			t("recurring.alerts.cancelTitle"),
			t("recurring.alerts.cancelMessage", { description: approval.description }),
			[
				{ text: t("recurring.actions.keep"), style: "cancel" },
				{
					text: t("recurring.actions.cancelTransaction"),
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
								actionError instanceof Error ? actionError.message : t("recurring.errors.couldNotCancel");
							Alert.alert(t("recurring.errors.genericTitle"), message);
						} finally {
							setIsSubmittingAction(false);
						}
					},
				},
			],
		);
	}

	function handlePressRecurringTransaction(recurringTransaction: RecurringTransactionApiDTO) {
		Alert.alert(
			t("recurring.alerts.detailTitle"),
			t("recurring.alerts.detailMessage", { name: recurringTransaction.name }),
			[
				{ text: t("common.cancel"), style: "cancel" },
				{
					text: t("recurring.actions.deleteRecurring"),
					style: "destructive",
					onPress: async () => {
						if (isSubmittingAction) {
							return;
						}

						try {
							setIsSubmittingAction(true);
							await deleteRecurringTransaction(recurringTransaction.id);
							await loadRecurringTransactions(false);
						} catch (actionError) {
							const message =
								actionError instanceof Error
									? actionError.message
									: t("recurring.errors.couldNotDelete");
							Alert.alert(t("recurring.errors.genericTitle"), message);
						} finally {
							setIsSubmittingAction(false);
						}
					},
				},
			],
		);
	}

	function handleSearchPress() {
		Alert.alert(t("recurring.alerts.searchTitle"), t("recurring.alerts.searchMessage"));
	}

	function handleAddRecurringTransaction() {
		router.push({
			pathname: "/tabs/recurringAdmin",
			params: { openCreate: "1" },
		});
	}

	useEffect(() => {
		const unsubscribe = subscribeToRecurringTransactions((data) => {
			setRecurringData(data);
		});

		loadRecurringTransactions();

		return unsubscribe;
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
			<View className="flex-1 items-center justify-center bg-app-bgPrimary">
				<ActivityIndicator size="large" color={APP_COLORS.actionPrimary} />
			</View>
		);
	}

	if (error) {
		return (
			<View className="flex-1 items-center justify-center bg-app-bgPrimary px-6">
				<Text className="text-center text-base text-app-textPrimary">
					{error}
				</Text>
				<Pressable
					onPress={() => loadRecurringTransactions()}
					className="mt-4 rounded-xl border border-app-border bg-app-bgSecondary px-4 py-2"
				>
					<Text className="font-semibold text-app-primary">{t("common.retry")}</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-app-bgPrimary">
			<RecurringHeader
				title={t("recurring.title")}
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
						tintColor={APP_COLORS.actionPrimary}
						colors={[APP_COLORS.actionPrimary]}
					/>
				}
			>
				<RecurringTypeToggle value={selectedType} onChange={setSelectedType} />

				{pendingApprovalsForType.length ? (
					<View className="mb-6 rounded-2xl border border-app-border bg-app-bgSecondary">
						<Pressable
							onPress={() => setIsPendingExpanded((previous) => !previous)}
							className="flex-row items-center justify-between px-4 py-3"
						>
							<Text className="text-xs font-semibold tracking-widest text-app-textSecondary">
								{t("recurring.labels.pending")} ({pendingApprovalsForType.length})
							</Text>
							<Text className="text-sm font-semibold text-app-accentBlue">
								{isPendingExpanded ? t("recurring.actions.hide") : t("recurring.actions.show")}
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
					<View className="mb-6 rounded-2xl border border-app-border bg-app-bgSecondary">
						<Pressable
							onPress={() => setIsRescheduledExpanded((previous) => !previous)}
							className="flex-row items-center justify-between px-4 py-3"
						>
							<Text className="text-xs font-semibold tracking-widest text-app-textSecondary">
								{t("recurring.labels.rescheduled")} ({rescheduledApprovalsForType.length})
							</Text>
							<Text className="text-sm font-semibold text-app-accentBlue">
								{isRescheduledExpanded ? t("recurring.actions.hide") : t("recurring.actions.show")}
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
					<Text className="text-xs font-semibold tracking-widest text-app-textSecondary">
						{t("recurring.labels.upcomingRecurringTransactions")}
					</Text>
					<Pressable onPress={() => router.push("/tabs/recurringAdmin")}>
						<Text className="text-sm font-semibold text-app-accentBlue">{t("common.viewAll")}</Text>
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
					<View className="mb-4 rounded-2xl border border-app-border bg-app-bgSecondary px-4 py-5">
						<Text className="text-center text-sm text-app-textSecondary">
							{t("recurring.empty.filtered")}
						</Text>
					</View>
				)}

				<AddRecurringTransactionCard onPress={handleAddRecurringTransaction} />
			</ScrollView>

			<AppBottomSheetModal visible={!!rescheduleApproval} onClose={() => setRescheduleApproval(null)} snapPoints={["52%"]} debugName="RecurringTransactions:Reschedule">
				<View className="rounded-t-3xl border border-app-border bg-app-bgPrimary px-4 pb-6 pt-4">
					<Text className="mb-1 text-base font-bold text-app-textPrimary">{t("recurring.reschedule.title")}</Text>
					<Text className="mb-3 text-sm text-app-textSecondary">
						{t("recurring.reschedule.message", {
							description: rescheduleApproval?.description ?? t("recurring.reschedule.fallbackDescription"),
						})}
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
							className="flex-1 rounded-2xl border border-app-border bg-app-border px-4 py-3"
						>
							<Text className="text-center text-sm font-semibold text-app-textSecondary">{t("common.cancel")}</Text>
						</Pressable>

						<Pressable
							onPress={submitRescheduleApproval}
							disabled={isSubmittingAction}
							className="flex-1 rounded-2xl bg-app-accentBlue px-4 py-3"
						>
							<Text className="text-center text-sm font-semibold text-white">
								{isSubmittingAction ? t("recurringAdmin.form.actions.saving") : t("recurring.actions.saveDate")}
							</Text>
						</Pressable>
					</View>
				</View>
			</AppBottomSheetModal>
		</View>
	);
}


