import { Pressable, Text, View } from "react-native";
import { AppIcon } from "../shared/AppIcon";

type AccountsHeaderProps = {
  onAddPress?: () => void;
};

export function AccountsHeader({ onAddPress }: AccountsHeaderProps) {
  return (
    <View className="mb-5 flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#0A1A35]">
          <AppIcon name="SquareStack" size={17} color="#18C8FF" />
        </View>
        <Text className="text-2xl font-bold text-app-textPrimary">My Accounts</Text>
      </View>

      <Pressable
        onPress={onAddPress}
        className="h-10 w-10 items-center justify-center rounded-full border border-[#1E2A47] bg-[#0A1A35]"
      >
        <AppIcon name="Plus" size={18} color="#18C8FF" />
      </Pressable>
    </View>
  );
}
