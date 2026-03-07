import { APP_COLORS } from "../../constants/colors";
import { Pressable, Text, View } from "react-native";
import { AppIcon } from "../shared/AppIcon";

type AccountsHeaderProps = {
  onAddPress?: () => void;
};

export function AccountsHeader({ onAddPress }: AccountsHeaderProps) {
  return (
    <View className="mb-5 flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-app-surface">
          <AppIcon name="SquareStack" size={17} color={APP_COLORS.actionPrimary} />
        </View>
        <Text className="text-2xl font-bold text-app-textPrimary">My Accounts</Text>
      </View>

      <Pressable
        onPress={onAddPress}
        className="h-10 w-10 items-center justify-center rounded-full border border-app-border bg-app-surface"
      >
        <AppIcon name="Plus" size={18} color={APP_COLORS.actionPrimary} />
      </Pressable>
    </View>
  );
}

