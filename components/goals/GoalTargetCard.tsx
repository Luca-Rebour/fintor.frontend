import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";
import { AppIcon } from "../shared/AppIcon";

import { GoalApi } from "../../types/goals.types";

type GoalTargetCardProps = {
  goal: GoalApi;
  onPress?: (goal: GoalApi) => void;
};

function formatCurrency(amount: number, currencyCode: string) {
  const normalizedCurrency = currencyCode?.trim().toUpperCase() || "USD";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: normalizedCurrency,
      currencyDisplay: "code",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${normalizedCurrency} ${amount.toFixed(2)}`;
  }
}

export function GoalTargetCard({ goal, onPress }: GoalTargetCardProps) {
  const normalizedTargetAmount = Math.max(0, Number(goal.targetAmount) || 0);
  const normalizedCurrentAmount = Math.max(0, Number(goal.currentAmount) || 0);
  const currencyCode = goal.currencyCode?.trim().toUpperCase() || "USD";
  const progressPercent = normalizedTargetAmount > 0
    ? Math.round((normalizedCurrentAmount / normalizedTargetAmount) * 100)
    : 0;

  const targetDateLabel = (() => {
    const parsed = new Date(goal.targetDate);
    if (Number.isNaN(parsed.getTime())) {
      return goal.targetDate;
    }

    return parsed.toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  })();

  return (
    <Pressable className="rounded-3xl bg-[#111C33] p-4" onPress={() => onPress?.(goal)}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: `${goal.accentColor}33` }}
          >
            <AppIcon name={goal.icon} size={16} color={goal.accentColor} />
          </View>

          <View>
            <Text className="text-xl font-semibold text-app-textPrimary">{goal.title}</Text>
            <Text className="text-xs text-app-textSecondary">{goal.description}</Text>
          </View>
        </View>

        <View
          className="rounded-full px-2 py-1"
          style={{ backgroundColor: `${goal.accentColor}33` }}
        >
          <Text className="text-xs font-semibold" style={{ color: goal.accentColor }}>
            {progressPercent}%
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-app-textPrimary">
          {formatCurrency(normalizedCurrentAmount, currencyCode)}
        </Text>
        <Text className="text-sm text-app-textSecondary">
          {formatCurrency(normalizedTargetAmount, currencyCode)}
        </Text>
      </View>

      <View className="mt-2 h-2 rounded-full bg-[#253558] overflow-hidden">
        <LinearGradient
          colors={[goal.accentColor, `${goal.accentColor}CC`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: `${Math.min(100, Math.max(0, (normalizedCurrentAmount / Math.max(1, normalizedTargetAmount)) * 100))}%`,
            height: "100%",
            borderRadius: 999,
          }}
        />
      </View>

      <Text className="mt-2 text-right text-xs text-app-textSecondary">
        Target: {targetDateLabel}
      </Text>
    </Pressable>
  );
}
