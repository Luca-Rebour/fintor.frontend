import { APP_COLORS } from "../../constants/colors";
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
      className="mb-4 rounded-3xl border border-app-border bg-app-surface p-4"
      style={{ shadowColor: APP_COLORS.actionPrimary, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 2 }}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-app-bgSecondary">
            <AppIcon name={iconName} size={18} color={APP_COLORS.actionPrimary} />
          </View>

          <View>
            <Text className="text-2xl font-bold text-app-textPrimary">{accountName}</Text>
            <Text className="text-xs text-app-textMuted">{subtitle}</Text>
          </View>
        </View>

        <AppIcon name="EllipsisVertical" size={16} color={APP_COLORS.textMuted} />
      </View>

      <View className="my-4 h-px bg-app-border" />

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[10px] font-semibold tracking-widest text-app-textMuted">{totalBalanceLabel}</Text>
          <Text className="mt-1 text-2xl font-bold text-white" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {totalBalance}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-[10px] font-semibold tracking-widest text-app-textMuted">{availableLabel}</Text>
          <Text className="mt-1 text-2xl font-bold text-app-accentBlue" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {availableBalance}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
