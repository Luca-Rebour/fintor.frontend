import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { QuickAction } from "../../types/dashboard";

type NetWorthSectionProps = {
  totalNetWorth: string;
  monthlyChange: string;
  quickActions: QuickAction[];
};

export function NetWorthSection({ totalNetWorth, monthlyChange, quickActions }: NetWorthSectionProps) {
  return (
    <View className="mb-4 rounded-3xl bg-app-card/50 p-4">
      <Text className="text-sm text-app-textSecondary">Total Net Worth</Text>
      <Text className="mt-1 text-5xl font-extrabold text-app-textPrimary">{totalNetWorth}</Text>

      <View className="mt-3 flex-row items-center gap-2">
        <Text className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-300">
          ↗ {monthlyChange}
        </Text>
        <Text className="text-xs text-app-textSecondary">vs last month</Text>
      </View>

      <View className="mt-6 h-28 justify-end">
        <View className="h-1 rounded-full bg-cyan-400" />
      </View>

      <View className="mt-2 flex-row justify-between px-1">
        {[
          { id: "jan", label: "Jan" },
          { id: "feb", label: "Feb" },
          { id: "mar", label: "Mar" },
          { id: "apr", label: "Apr" },
          { id: "may", label: "May" },
          { id: "jun", label: "Jun" },
        ].map((month) => (
          <Text key={month.id} className="text-xs text-app-textSecondary">
            {month.label}
          </Text>
        ))}
      </View>

      <View className="mt-5 flex-row justify-between">
        {quickActions.map((action) => (
          <View key={action.id} className="items-center">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-app-cardSoft">
              <Feather name={action.icon} size={18} color="#18C8FF" />
            </View>
            <Text className="mt-2 text-xs text-app-textSecondary">{action.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
