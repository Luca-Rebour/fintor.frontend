import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

type TransactionSummaryCardsProps = {
  monthlySpending: number;
  monthlyIncome: number;
  balance: number;
  currencyCode: string;
};

export function TransactionSummaryCards({
  monthlySpending,
  monthlyIncome,
  balance,
  currencyCode,
}: TransactionSummaryCardsProps) {
  const normalizedCurrencyCode = currencyCode?.trim().toUpperCase() || "USD";

  return (
    <View className="px-4 mt-4 gap-3">
      <View className="flex-row gap-3">
        <View className="flex-1 bg-[#111C33] rounded-xl p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-app-textSecondary text-xs uppercase">
              Monthly Spending
            </Text>
            <Feather name="arrow-down" size={16} color="#EF4444" />
          </View>

          <Text className="text-app-textPrimary text-xl font-semibold">
            {normalizedCurrencyCode} {monthlySpending.toFixed(2)}
          </Text>
        </View>

        <View className="flex-1 bg-[#111C33] rounded-xl p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-app-textSecondary text-xs uppercase">
              Monthly Income
            </Text>
            <Feather name="arrow-up" size={16} color="#22C55E" />
          </View>

          <Text className="text-app-textPrimary text-xl font-semibold">
            {normalizedCurrencyCode} {monthlyIncome.toFixed(2)}
          </Text>
        </View>
      </View>

      <View className="bg-[#111C33] rounded-xl p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-app-textSecondary text-xs uppercase">
            Balance
          </Text>
          <Feather
            name={balance >= 0 ? "trending-up" : "trending-down"}
            size={16}
            color={balance >= 0 ? "#22C55E" : "#EF4444"}
          />
        </View>

        <Text className={`text-xl font-semibold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
          {normalizedCurrencyCode} {balance.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}
