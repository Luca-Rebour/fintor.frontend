import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { AppIcon } from "../../components/shared/AppIcon";
import { TransactionListItem } from "../../components/transactions/TransactionListItem";
import { getGoalTransactionsData } from "../../services/goals.service";
import { TransactionDTO } from "../../types/transaction";

function resolveParamValue(input: string | string[] | undefined): string {
  if (Array.isArray(input)) {
    return input[0]?.trim() ?? "";
  }

  return input?.trim() ?? "";
}

export default function GoalTransactionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ goalId?: string | string[]; goalTitle?: string | string[] }>();

  const goalId = resolveParamValue(params.goalId);
  const goalTitle = resolveParamValue(params.goalTitle);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactionsData, setTransactionsData] = useState<TransactionDTO[]>([]);
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
  const [isItemSwipeActive, setIsItemSwipeActive] = useState(false);

  useEffect(() => {
    async function loadTransactions() {
      try {
        setIsLoading(true);
        setError("");

        if (!goalId) {
          setTransactionsData([]);
          return;
        }

        const transactions = await getGoalTransactionsData(goalId);
        setTransactionsData(transactions);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : t("goals.errors.failedToLoad");
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadTransactions();
  }, [goalId, t]);

  function handleToggleTransaction(transactionId: string) {
    setExpandedTransactionId((current) => (current === transactionId ? null : transactionId));
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#060F24]">
        <ActivityIndicator size="large" color="#18C8FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#060F24] px-4 pt-2">
        <View className="mb-3 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#111C33]"
          >
            <AppIcon name="ArrowLeft" size={18} color="#FFFFFF" />
          </Pressable>

          <Text className="text-lg font-bold text-app-textPrimary">{t("goals.details.title")}</Text>

          <View className="h-10 w-10" />
        </View>

        <View className="mt-10 rounded-2xl border border-[#1E2A47] bg-[#111C33] p-4">
          <Text className="text-center text-app-textSecondary">{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#060F24] px-4 pt-2">
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#111C33]"
        >
          <AppIcon name="ArrowLeft" size={18} color="#FFFFFF" />
        </Pressable>

        <Text className="text-lg font-bold text-app-textPrimary">{t("goals.details.title")}</Text>

        <View className="h-10 w-10" />
      </View>

      <Text className="mb-4 text-sm text-app-textSecondary">
        {goalTitle || t("goals.details.unknownGoal")}
      </Text>

      {transactionsData.length ? (
        <FlatList
          data={transactionsData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionListItem
              transaction={item}
              isExpanded={expandedTransactionId === item.id}
              onToggle={handleToggleTransaction}
              onSwipeGestureChange={setIsItemSwipeActive}
            />
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isItemSwipeActive}
        />
      ) : (
        <View className="mt-10 rounded-2xl border border-[#1E2A47] bg-[#111C33] p-4">
          <Text className="text-center text-app-textSecondary">{t("goals.details.empty")}</Text>
        </View>
      )}
    </View>
  );
}
