import { Pressable, Text, View } from "react-native";
import { AppIcon } from "../shared/AppIcon";

type AccountListCardProps = {
  iconName: string;
  accountName: string;
  subtitle: string;
  totalBalanceLabel: string;
  availableLabel: string;
  totalBalance: string;
  availableBalance: string;
  onPress: () => void;
};

export function AccountListCard({
  iconName,
  accountName,
  subtitle,
  totalBalanceLabel,
  availableLabel,
  totalBalance,
  availableBalance,
  onPress,
}: AccountListCardProps) {
  return (
    <Pressable
      className="mb-4 rounded-3xl border border-[#0BC6E8]/30 bg-[#101C37] p-4"
      style={{ shadowColor: "#0BC6E8", shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 2 }}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#0A162F]">
            <AppIcon name={iconName} size={18} color="#00E5FF" />
          </View>

          <View>
            <Text className="text-2xl font-bold text-app-textPrimary">{accountName}</Text>
            <Text className="text-xs text-[#64748B]">{subtitle}</Text>
          </View>
        </View>

        <AppIcon name="EllipsisVertical" size={16} color="#4B5D7A" />
      </View>

      <View className="my-4 h-px bg-[#1B2D4C]" />

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[10px] font-semibold tracking-widest text-[#5A6C8B]">{totalBalanceLabel}</Text>
          <Text className="mt-1 text-2xl font-bold text-white" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {totalBalance}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-[10px] font-semibold tracking-widest text-[#5A6C8B]">{availableLabel}</Text>
          <Text className="mt-1 text-2xl font-bold text-[#00E5FF]" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {availableBalance}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
