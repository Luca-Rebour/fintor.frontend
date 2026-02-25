import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { GoalProgress } from "../../types/dashboard";

type GoalSectionProps = {
  goal: GoalProgress;
};

export function GoalSection({ goal }: GoalSectionProps) {
  return (
    <View className="mb-8">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-app-textPrimary">Goals</Text>
        <Text className="text-sm text-app-primary">See all</Text>
      </View>

      <View className="rounded-2xl bg-app-cardSoft p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-app-primaryStrong/30">
              <Feather name="briefcase" size={16} color="#C084FC" />
            </View>
            <View>
              <Text className="font-bold text-app-textPrimary">{goal.title}</Text>
              <Text className="text-xs text-app-textSecondary">
                ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
              </Text>
            </View>
          </View>

          <Text className="font-bold text-app-textPrimary">{goal.progressPercent}%</Text>
        </View>

        <View className="h-2 w-full rounded-full bg-app-border">
          <View className="h-2 rounded-full bg-app-primaryStrong" style={{ width: `${goal.progressPercent}%` }} />
        </View>
      </View>
    </View>
  );
}
