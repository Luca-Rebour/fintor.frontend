import { Text, View } from "react-native";

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
    <View className="mb-6 rounded-3xl bg-[#1757D9] px-5 py-5">
      <Text className="text-xs font-semibold tracking-widest text-[#A9C9FF]">{totalNetWorthLabel}</Text>
      <Text className="mt-2 text-5xl font-bold text-white" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {totalNetWorth}
      </Text>

      <View className="mt-3 flex-row items-center gap-2">
        <View className="rounded-full bg-[#0DBD8B]/25 px-2 py-1">
          <Text className="text-xs font-bold text-[#29F5B2]">{deltaValue}</Text>
        </View>
        <Text className="text-xs text-[#A9C9FF]">{deltaLabel}</Text>
      </View>
    </View>
  );
}
