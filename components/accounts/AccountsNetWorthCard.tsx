import { Text, View } from "react-native";
import { APP_COLORS } from "../../constants/colors";

type AccountsNetWorthCardProps = {
  totalNetWorthLabel: string;
  totalNetWorth: string;
  deltaLabel: string;
  deltaValue: string;
};

export function AccountsNetWorthCard({
  totalNetWorthLabel,
  totalNetWorth,
  deltaLabel,
  deltaValue,
}: AccountsNetWorthCardProps) {
  return (
    <View className="mb-6 rounded-3xl border border-app-border bg-app-surface px-5 py-5">
      <Text className="text-xs font-semibold tracking-widest text-app-textSecondary">{totalNetWorthLabel}</Text>
      <Text className="mt-2 text-5xl font-bold text-white" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {totalNetWorth}
      </Text>

      <View className="mt-3 flex-row items-center gap-2">
        <View className="rounded-full bg-app-success/20 px-2 py-1">
          <Text className="text-xs font-bold text-app-success">{deltaValue}</Text>
        </View>
        <Text className="text-xs text-app-textSecondary">{deltaLabel}</Text>
      </View>
    </View>
  );
}
