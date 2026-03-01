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

import { AddRecurringSubscriptionCard } from "../../components/recurring/AddRecurringSubscriptionCard";
import { PendingApprovalCard } from "../../components/recurring/PendingApprovalCard";
import { RecurringHeader } from "../../components/recurring/RecurringHeader";
import { RecurringSubscriptionItem } from "../../components/recurring/RecurringSubscriptionItem";
import { RecurringTypeToggle } from "../../components/recurring/RecurringTypeToggle";
import { getRecurringTransactionsData } from "../../services/recurringTransactions.service";
import {
	RecurringPendingApproval,
	RecurringSubscription,
	RecurringTransactionType,
	RecurringTransactionsData,
} from "../../types/recurring";

export default function RecurringTransactionsScreen() {
	const router = useRouter();
	const [recurringData, setRecurringData] = useState<RecurringTransactionsData | null>(null);
	const [selectedType, setSelectedType] = useState<RecurringTransactionType>("expense");
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
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

	function handleConfirmApproval(approval: RecurringPendingApproval) {
		Alert.alert("Confirm recurring", `Confirm ${approval.title} is scheduled.`);
	}

	function handleRescheduleApproval(approval: RecurringPendingApproval) {
		Alert.alert("Reschedule recurring", `Reschedule ${approval.title}.`);
	}

	function handlePressSubscription(subscription: RecurringSubscription) {
		Alert.alert("Recurring detail", `${subscription.name} detail will be enabled soon.`);
	}

	function handleSearchPress() {
		Alert.alert("Search", "Recurring search will be enabled soon.");
	}

	function handleAddSubscription() {
		Alert.alert("Create recurring", "Create recurring subscription flow will be enabled soon.");
	}

	useEffect(() => {
		loadRecurringTransactions();
	}, []);

	const pendingApproval = useMemo(() => {
		if (!recurringData?.pendingApproval) {
			return null;
		}

		return recurringData.pendingApproval.transactionType === selectedType
			? recurringData.pendingApproval
			: null;
	}, [recurringData, selectedType]);

	const filteredSubscriptions = useMemo(() => {
		if (!recurringData?.subscriptions.length) {
			return [];
		}

		return recurringData.subscriptions.filter(
			(subscription) => subscription.transactionType === selectedType,
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
						UPCOMING SUBSCRIPTIONS
					</Text>
					<Pressable>
						<Text className="text-sm font-semibold text-[#18C8FF]">View All</Text>
					</Pressable>
				</View>

				{filteredSubscriptions.length ? (
					filteredSubscriptions.map((subscription) => (
						<RecurringSubscriptionItem
							key={subscription.id}
							subscription={subscription}
							onPress={handlePressSubscription}
						/>
					))
				) : (
					<View className="mb-4 rounded-2xl border border-[#1E2A47] bg-[#111C33] px-4 py-5">
						<Text className="text-center text-sm text-[#94A3B8]">
							No recurring transactions found for this filter.
						</Text>
					</View>
				)}

				<AddRecurringSubscriptionCard onPress={handleAddSubscription} />
			</ScrollView>
		</View>
	);
}

