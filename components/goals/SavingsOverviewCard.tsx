import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

type SavingsOverviewCardProps = {
  totalSavings: number;
  monthlyChangePercent: number;
  currentValue: number;
  goalValue: number;
};

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

export function SavingsOverviewCard({
  totalSavings,
  monthlyChangePercent,
  currentValue,
  goalValue,
}: SavingsOverviewCardProps) {
  const progress = Math.min(100, Math.max(0, (currentValue / goalValue) * 100));

  return (
    <View className="rounded-3xl overflow-hidden">
      <LinearGradient
        colors={["#111C33", "#1A1440"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 16 }}
      >
        <Text className="text-[12px] text-app-textSecondary">Total Savings</Text>

        <View className="mt-1 flex-row items-end gap-2">
          <Text className="text-4xl font-bold text-app-textPrimary">
            {formatCurrency(totalSavings)}
          </Text>
          <Text className="text-xs font-medium text-app-success mb-2">
            +{monthlyChangePercent}% this month
          </Text>
        </View>

        <View className="mt-4 h-2 rounded-full bg-[#253558] overflow-hidden">
          <LinearGradient
            colors={["#B063FF", "#7E5BFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${progress}%`, height: "100%", borderRadius: 999 }}
          />
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-[11px] text-app-textSecondary">$0</Text>
          <Text className="text-[11px] text-app-textSecondary">Goal: {formatCurrency(goalValue)}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}
