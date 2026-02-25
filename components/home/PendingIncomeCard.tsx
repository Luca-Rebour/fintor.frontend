import { Text, View } from "react-native";

type PendingIncomeCardProps = {
  amount: string;
  source: string;
};

export function PendingIncomeCard({ amount, source }: PendingIncomeCardProps) {
  return (
    <View className="mb-6 flex-row items-center justify-between rounded-2xl bg-app-cardSoft p-4">
      <View>
        <Text className="text-lg font-bold text-app-textPrimary">Pending Income</Text>
        <Text className="text-xs text-app-textSecondary">{source}</Text>
        <Text className="mt-1 text-3xl font-bold text-app-textPrimary">{amount}</Text>
      </View>

      <View className="rounded-full bg-app-primary px-4 py-2">
        <Text className="font-semibold text-app-textPrimary">Confirm</Text>
      </View>
    </View>
  );
}
