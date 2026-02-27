import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

import { GoalTarget } from "../../types/goals.types";

type GoalTargetCardProps = {
  goal: GoalTarget;
};

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

export function GoalTargetCard({ goal }: GoalTargetCardProps) {
  return (
    <View className="rounded-3xl bg-[#111C33] p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: `${goal.accentColor}33` }}
          >
            <Feather name={goal.icon} size={16} color={goal.accentColor} />
          </View>

          <View>
            <Text className="text-xl font-semibold text-app-textPrimary">{goal.title}</Text>
            <Text className="text-xs text-app-textSecondary">{goal.subtitle}</Text>
          </View>
        </View>

        <View
          className="rounded-full px-2 py-1"
          style={{ backgroundColor: `${goal.accentColor}33` }}
        >
          <Text className="text-xs font-semibold" style={{ color: goal.accentColor }}>
            {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-app-textPrimary">
          {formatCurrency(goal.currentAmount)}
        </Text>
        <Text className="text-sm text-app-textSecondary">
          {formatCurrency(goal.targetAmount)}
        </Text>
      </View>

      <View className="mt-2 h-2 rounded-full bg-[#253558] overflow-hidden">
        <LinearGradient
          colors={[goal.accentColor, `${goal.accentColor}CC`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: `${Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100))}%`,
            height: "100%",
            borderRadius: 999,
          }}
        />
      </View>

      <Text className="mt-2 text-right text-xs text-app-textSecondary">
        Target: {goal.targetDate}
      </Text>
    </View>
  );
}
