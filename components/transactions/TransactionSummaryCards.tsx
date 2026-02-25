import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

type TransactionSummaryCardsProps = {
  monthlySpending: number;
  monthlyIncome: number;
};

export function TransactionSummaryCards({
  monthlySpending,
  monthlyIncome,
}: TransactionSummaryCardsProps) {
  return (
    <View className="flex-row px-4 mt-4 gap-3">
      <View className="flex-1 bg-[#111C33] rounded-xl p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-app-textSecondary text-xs uppercase">
            Monthly Spending
          </Text>
          <Feather name="arrow-down" size={16} color="#EF4444" />
        </View>

        <Text className="text-app-textPrimary text-xl font-semibold">
          ${monthlySpending.toFixed(2)}
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
          ${monthlyIncome.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}
