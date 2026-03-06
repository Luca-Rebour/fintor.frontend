import { Text, View } from "react-native";

type AccountsSectionHeaderProps = {
  activeAccountsLabel: string;
  accountsCountLabel: string;
};

export function AccountsSectionHeader({ activeAccountsLabel, accountsCountLabel }: AccountsSectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">{activeAccountsLabel}</Text>
      <Text className="text-xs font-bold text-[#18C8FF]">{accountsCountLabel}</Text>
    </View>
  );
}
